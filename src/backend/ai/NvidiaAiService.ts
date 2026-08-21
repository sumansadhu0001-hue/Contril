import { config } from '../config';
import { EntitlementService } from './EntitlementService';
import crypto from 'crypto';
import { Response } from 'express';

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
   * Synchronous Chat Completion Gateway
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
    const messages: ChatMessageInput[] = [{ role: 'system', content: systemPrompt }];

    // Append compact recent conversation (last 6 turns max)
    if (options.conversationHistory && options.conversationHistory.length > 0) {
      const recent = options.conversationHistory.slice(-6);
      messages.push(...recent);
    }

    messages.push({ role: 'user', content: options.prompt.trim() });

    // 3. Execute Remote NVIDIA API Call
    const apiKey = this.getApiKey();
    const baseUrl = this.getBaseUrl();
    const requestBody = {
      model,
      messages,
      temperature: options.temperature || 0.6,
      max_tokens: options.maxTokens || 1024
    };

    const startTime = Date.now();
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errBody = await response.text();
      EntitlementService.recordUsage(options.userId, requestId, model, 0, 0, 0, conversationId, 'failed');
      throw new Error(`NVIDIA inference error (HTTP ${response.status}): ${errBody}`);
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content?.trim() || '';
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

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
   * Server-Sent Events (SSE) Streaming AI Gateway
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
    const messages: ChatMessageInput[] = [{ role: 'system', content: systemPrompt }];

    if (options.conversationHistory && options.conversationHistory.length > 0) {
      messages.push(...options.conversationHistory.slice(-6));
    }
    messages.push({ role: 'user', content: options.prompt.trim() });

    // 3. Stream from NVIDIA NIM API
    const apiKey = this.getApiKey();
    const baseUrl = this.getBaseUrl();

    let fullText = '';
    let accumulatedPromptTokens = 0;
    let accumulatedCompletionTokens = 0;
    let accumulatedTotalTokens = 0;

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature || 0.6,
          max_tokens: options.maxTokens || 1024,
          stream: true
        })
      });

      if (!response.ok || !response.body) {
        const errText = await response.text();
        sendEvent('error', { message: `NVIDIA stream error (${response.status}): ${errText}` });
        res.end();
        return;
      }

      const reader = (response.body as any).getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                sendEvent('text_delta', { text: delta });
              }
              if (json.usage) {
                accumulatedPromptTokens = json.usage.prompt_tokens || accumulatedPromptTokens;
                accumulatedCompletionTokens = json.usage.completion_tokens || accumulatedCompletionTokens;
                accumulatedTotalTokens = json.usage.total_tokens || accumulatedTotalTokens;
              }
            } catch {}
          }
        }
      }

      // If streaming mode did not return usage, compute exact usage or leave accurate
      if (accumulatedTotalTokens === 0) {
        // Approximate only if provider omits stream usage, otherwise exact
        accumulatedTotalTokens = accumulatedPromptTokens + accumulatedCompletionTokens;
      }

      // Record Usage
      EntitlementService.recordUsage(
        options.userId,
        requestId,
        model,
        accumulatedPromptTokens,
        accumulatedCompletionTokens,
        accumulatedTotalTokens,
        conversationId,
        'success'
      );

      sendEvent('response_complete', {
        requestId,
        conversationId,
        message: fullText,
        model,
        usage: {
          promptTokens: accumulatedPromptTokens,
          completionTokens: accumulatedCompletionTokens,
          totalTokens: accumulatedTotalTokens
        }
      });
      res.end();

    } catch (err: any) {
      sendEvent('error', { message: `Inference stream interrupted: ${err.message}` });
      res.end();
    }
  }
}
