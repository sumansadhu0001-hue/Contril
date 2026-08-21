import { config } from '../config';
import { EntitlementService } from './EntitlementService';
import crypto from 'crypto';
import { Response } from 'express';
import OpenAI from 'openai';

export interface ChatMessageInput {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface NvidiaAiRequestOptions {
  userId: string;
  userName?: string;
  userRole?: string;
  timezone?: string;
  prompt: string;
  conversationHistory?: ChatMessageInput[];
  connectedServices?: Record<string, string>;
  conversationId?: string;
  requestId?: string;
  temperature?: number;
  maxTokens?: number;
  modelOverride?: string;
}

export interface NvidiaAiResponse {
  requestId: string;
  conversationId: string;
  message: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls?: any[];
  requiresConfirmation?: boolean;
  pendingAction?: any;
}

export class NvidiaAiService {

  private static getApiKey(): string {
    const key = process.env.NVIDIA_API_KEY || config.ai.nvidiaApiKey;
    if (!key || key.includes('MY_KEY')) {
      throw new Error('NVIDIA_API_KEY is not configured on the backend server.');
    }
    return key;
  }

  private static getBaseUrl(): string {
    return process.env.NVIDIA_BASE_URL || config.ai.nvidiaBaseUrl || 'https://integrate.api.nvidia.com/v1';
  }

  private static getActiveModel(modelOverride?: string): string {
    if (modelOverride) return modelOverride;
    return process.env.AI_MODEL || config.ai.defaultModel || 'meta/llama-3.1-8b-instruct';
  }

  private static getClient(): OpenAI {
    return new OpenAI({
      apiKey: this.getApiKey(),
      baseURL: this.getBaseUrl(),
      maxRetries: 3,
      timeout: 30000,
    });
  }

  /**
   * Constructs the minimal useful context for the request.
   */
  static buildSystemPrompt(options: NvidiaAiRequestOptions): string {
    const tz = options.timezone || EntitlementService.getUserTimezone(options.userId);
    const now = new Date();
    const currentTimeStr = now.toLocaleString('en-US', { timeZone: tz, dateStyle: 'full', timeStyle: 'short' });
    const name = options.userName || 'Executive';
    const role = options.userRole || 'Founder / Executive';
    const connectedTools = options.connectedServices ? Object.keys(options.connectedServices).join(', ') : 'None';

    return `You are CONTRIL — an elite AI Chief of Staff.
User Profile: ${name} (${role})
Current Time: ${currentTimeStr} (${tz})
Connected Services: [${connectedTools}]

CORE DIRECTIVES:
1. UNIVERSAL CONVERSATIONAL INTELLIGENCE: Deliver direct, concise, high-impact reasoning across communication, scheduling, research, strategy, and problem-solving.
2. STRICT ZERO-HALLUCINATION GROUNDING: Never invent emails, fake calendar events, fake past conversations, or fake companies. If Gmail or Calendar is not connected, state honestly: "Connect Gmail / Google Calendar to inspect your inbox and schedule."
3. WORKSPACE ACTIONS: When asked to write an email or plan a meeting, generate a complete, polished draft with Recipient, Subject, and Body ready for one-tap dispatch.
4. CLEAN FORMATTING: Write in clear, elegant paragraphs with clean bullet points (•). Do not output robotic headers or disclaimers like "As an AI".
5. HONEST UNCERTAINTY: If required context is missing, ask clearly and concisely.`;
  }

  /**
   * Synchronous Chat Completion Gateway with OpenAI-compatible NVIDIA NIM
   */
  static async generateChatResponse(options: NvidiaAiRequestOptions): Promise<NvidiaAiResponse> {
    const requestId = options.requestId || `ctr_req_${crypto.randomUUID()}`;
    const conversationId = options.conversationId || `conv_${crypto.randomUUID().slice(0, 8)}`;
    const model = this.getActiveModel(options.modelOverride);

    // 1. Pre-Flight Entitlement Check
    const entitlement = EntitlementService.checkEntitlement(options.userId);
    if (!entitlement.allowed) {
      throw {
        type: 'usage_limit',
        status: 429,
        plan: entitlement.plan,
        dailyLimit: entitlement.dailyTokenLimit,
        used: entitlement.tokensUsedToday,
        remaining: 0,
        resetAt: entitlement.resetAt,
        message: entitlement.message
      };
    }

    // 2. Build Messages Payload
    const systemPrompt = this.buildSystemPrompt(options);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (options.conversationHistory && options.conversationHistory.length > 0) {
      const recent = options.conversationHistory.slice(-6);
      for (const msg of recent) {
        messages.push({ role: msg.role as any, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: options.prompt.trim() });

    // 3. Execute via OpenAI SDK with Automatic Retries
    const client = this.getClient();
    let completion: OpenAI.Chat.ChatCompletion;

    try {
      completion = await client.chat.completions.create({
        model,
        messages,
        temperature: options.temperature || 0.6,
        max_tokens: options.maxTokens || 1024,
      });
    } catch (err: any) {
      EntitlementService.recordUsage(options.userId, requestId, model, 0, 0, 0, conversationId, 'failed');
      if (err.status === 429) {
        throw new Error('NVIDIA AI inference service is temporarily busy (rate limited). Please try again in a few moments.');
      }
      throw new Error(`NVIDIA NIM inference error: ${err.message || err}`);
    }

    const replyText = completion.choices?.[0]?.message?.content?.trim() || '';
    const usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || (promptTokens + completionTokens);

    // 4. Record Exact Provider Usage in Database
    EntitlementService.recordUsage(
      options.userId,
      requestId,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      conversationId,
      'success'
    );

    // 5. Detect Consequential Actions (e.g. Email Sending / Meeting Creation)
    const lower = options.prompt.toLowerCase();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const foundEmail = options.prompt.match(emailRegex)?.[0] || replyText.match(emailRegex)?.[0];
    let pendingAction = null;

    if (foundEmail || lower.includes('send email') || lower.includes('schedule meeting') || lower.includes('draft email')) {
      const isCalendar = lower.includes('schedule') || lower.includes('meeting');
      pendingAction = {
        id: `act_${crypto.randomUUID().slice(0, 8)}`,
        title: isCalendar ? 'Confirm Calendar Schedule' : (foundEmail ? `Send Email to ${foundEmail}` : 'Approve Email Dispatch'),
        description: replyText,
        targetService: isCalendar ? 'Google Calendar' : 'Gmail',
        consequenceLevel: 'medium',
        status: 'PENDING_APPROVAL'
      };
    }

    return {
      requestId,
      conversationId,
      message: replyText,
      model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens
      },
      requiresConfirmation: pendingAction !== null,
      pendingAction
    };
  }

  /**
   * Server-Sent Events (SSE) Streaming AI Gateway with OpenAI-compatible NVIDIA NIM
   */
  static async streamChatResponse(options: NvidiaAiRequestOptions, res: Response): Promise<void> {
    const requestId = options.requestId || `ctr_req_${crypto.randomUUID()}`;
    const conversationId = options.conversationId || `conv_${crypto.randomUUID().slice(0, 8)}`;
    const model = this.getActiveModel(options.modelOverride);

    // Set SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (eventType: string, data: any) => {
      res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // 1. Pre-Flight Entitlement Check
    const entitlement = EntitlementService.checkEntitlement(options.userId);
    if (!entitlement.allowed) {
      sendEvent('usage_limit', {
        type: 'usage_limit',
        plan: entitlement.plan,
        dailyLimit: entitlement.dailyTokenLimit,
        used: entitlement.tokensUsedToday,
        remaining: 0,
        resetAt: entitlement.resetAt,
        message: entitlement.message
      });
      res.end();
      return;
    }

    sendEvent('response_start', { requestId, conversationId, model });

    // 2. Build Messages Payload
    const systemPrompt = this.buildSystemPrompt(options);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (options.conversationHistory && options.conversationHistory.length > 0) {
      const recent = options.conversationHistory.slice(-6);
      for (const msg of recent) {
        messages.push({ role: msg.role as any, content: msg.content });
      }
    }
    messages.push({ role: 'user', content: options.prompt.trim() });

    // 3. Stream from NVIDIA NIM API
    const client = this.getClient();
    let fullText = '';
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalTokens = 0;

    try {
      const stream = await client.chat.completions.create({
        model,
        messages,
        temperature: options.temperature || 0.6,
        max_tokens: options.maxTokens || 1024,
        stream: true,
        stream_options: { include_usage: true }
      });

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) {
          fullText += delta;
          sendEvent('chunk', { text: delta });
        }
        if (chunk.usage) {
          totalPromptTokens = chunk.usage.prompt_tokens || totalPromptTokens;
          totalCompletionTokens = chunk.usage.completion_tokens || totalCompletionTokens;
          totalTokens = chunk.usage.total_tokens || (totalPromptTokens + totalCompletionTokens);
        }
      }

      // If usage was not emitted in chunk, approximate minimal completion
      if (totalTokens === 0) {
        totalPromptTokens = Math.ceil(systemPrompt.length / 4) + Math.ceil(options.prompt.length / 4);
        totalCompletionTokens = Math.ceil(fullText.length / 4);
        totalTokens = totalPromptTokens + totalCompletionTokens;
      }

      // Record exact provider usage
      EntitlementService.recordUsage(
        options.userId,
        requestId,
        model,
        totalPromptTokens,
        totalCompletionTokens,
        totalTokens,
        conversationId,
        'success'
      );

      // Detect Consequential Action
      const lower = options.prompt.toLowerCase();
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const foundEmail = options.prompt.match(emailRegex)?.[0] || fullText.match(emailRegex)?.[0];
      let pendingAction = null;

      if (foundEmail || lower.includes('send email') || lower.includes('schedule meeting') || lower.includes('draft email')) {
        const isCalendar = lower.includes('schedule') || lower.includes('meeting');
        pendingAction = {
          id: `act_${crypto.randomUUID().slice(0, 8)}`,
          title: isCalendar ? 'Confirm Calendar Schedule' : (foundEmail ? `Send Email to ${foundEmail}` : 'Approve Email Dispatch'),
          description: fullText,
          targetService: isCalendar ? 'Google Calendar' : 'Gmail',
          consequenceLevel: 'medium',
          status: 'PENDING_APPROVAL'
        };
      }

      sendEvent('response_end', {
        requestId,
        conversationId,
        fullText,
        usage: {
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
          totalTokens
        },
        requiresConfirmation: pendingAction !== null,
        pendingAction
      });

      res.end();
    } catch (err: any) {
      EntitlementService.recordUsage(options.userId, requestId, model, 0, 0, 0, conversationId, 'failed');
      const isRateLimit = err.status === 429;
      const errorMessage = isRateLimit
        ? 'NVIDIA AI inference service is temporarily busy (rate limited). Please try again in a few moments.'
        : `Inference stream interrupted: ${err.message || err}`;

      sendEvent('error', {
        requestId,
        conversationId,
        error: errorMessage,
        code: isRateLimit ? 429 : 500
      });
      res.end();
    }
  }
}
