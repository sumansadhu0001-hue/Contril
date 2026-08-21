import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { NvidiaAiService } from "./src/backend/ai/NvidiaAiService";
import { EntitlementService } from "./src/backend/ai/EntitlementService";
import { PLAN_CONFIGURATIONS, getPlanConfig } from "./src/backend/ai/PlanConfiguration";
import apiV1Router from "./src/backend/api/router";
import { AgentSystem } from "./src/backend/agents/AgentSystem";
import { CHIEF_AI_OFFICER_PROMPT } from "./src/backend/agents/systemPrompts";
import { connectorRequirementLabel, requiresExternalConnector, UniversalIntentEngine } from "./src/backend/intelligence/UniversalIntentEngine";
import { config } from "./src/backend/config";
import { SecurityGuard } from "./src/backend/security/SecurityGuard";
import { searchWorkspace } from "./src/backend/ai/WorkspaceSearchHelper";
import { GoogleTokenRefreshWorker } from "./src/backend/workers/GoogleTokenRefreshWorker";

const app = express();
app.use(SecurityGuard.applySecurityHeaders);
app.use("/api", SecurityGuard.rateLimiter);
const PORT = config.port || 3000;

// Enable manual CORS support for Vite standalone dev server proxying/testing
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=30, max=1000");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "10mb" }));

// Production Health & Observability Endpoints
app.get("/health", async (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/metrics", async (req, res) => {
  res.status(200).json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// In-Memory Caching for Prompt Responses
interface CacheEntry {
  text: string;
  timestamp: number;
}
const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

function getCachedResponse(prompt: string): string | null {
  const entry = responseCache.get(prompt);
  if (entry && (Date.now() - entry.timestamp) < CACHE_TTL_MS) {
    return entry.text;
  }
  return null;
}

function setCachedResponse(prompt: string, text: string) {
  responseCache.set(prompt, { text, timestamp: Date.now() });
}

function getNvidiaClient(): OpenAI | null {
  const apiKey = process.env.NVIDIA_API_KEY || config.ai.nvidiaApiKey;
  if (!apiKey || apiKey.includes("MY_KEY")) {
    return null;
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.NVIDIA_BASE_URL || config.ai.nvidiaBaseUrl || "https://integrate.api.nvidia.com/v1",
    maxRetries: 3,
    timeout: 30000,
  });
}

// Mount Enterprise Backend V1 Architecture API Router
app.use("/api/v1", apiV1Router);

// ---------------------------------------------------------------------------
// Production Contril AI Gateway (Server-Authoritative NVIDIA Cloud Inference)
// ---------------------------------------------------------------------------

// 1. Synchronous AI Chat Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const {
      prompt,
      userId = "usr_contril_prod",
      userName,
      userRole,
      timezone,
      conversationHistory,
      connectedServices,
      conversationId,
      temperature,
      maxTokens,
      modelOverride
    } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await NvidiaAiService.generateChatResponse({
      userId,
      userName,
      userRole,
      timezone,
      prompt: prompt.trim(),
      conversationHistory,
      connectedServices,
      conversationId,
      temperature,
      maxTokens,
      modelOverride
    });

    return res.status(200).json(response);
  } catch (error: any) {
    if (error.type === "usage_limit") {
      return res.status(429).json(error);
    }
    console.error("[Contril AI Gateway Error]", error.message || error);
    return res.status(500).json({
      error: "Contril couldn't reach its AI service right now. Check your connection and try again.",
      detail: error.message
    });
  }
});

// 2. Server-Sent Events (SSE) AI Streaming Endpoint
app.post("/api/ai/stream", async (req, res) => {
  try {
    const {
      prompt,
      userId = "usr_contril_prod",
      userName,
      userRole,
      timezone,
      conversationHistory,
      connectedServices,
      conversationId,
      temperature,
      maxTokens,
      modelOverride
    } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    await NvidiaAiService.streamChatResponse({
      userId,
      userName,
      userRole,
      timezone,
      prompt: prompt.trim(),
      conversationHistory,
      connectedServices,
      conversationId,
      temperature,
      maxTokens,
      modelOverride
    }, res);
  } catch (error: any) {
    console.error("[Contril AI Stream Error]", error.message || error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
    res.end();
  }
});

// 3. Entitlement & Quota Status Endpoint
app.get("/api/entitlements", (req, res) => {
  const userId = (req.query.userId as string) || "usr_contril_prod";
  const entitlement = EntitlementService.checkEntitlement(userId);
  return res.status(200).json(entitlement);
});

// 4. Usage Statistics & Daily Tracking Endpoint
app.get("/api/ai/usage", (req, res) => {
  const userId = (req.query.userId as string) || "usr_contril_prod";
  const planId = EntitlementService.getUserPlan(userId);
  const planConfig = getPlanConfig(planId);
  const tz = EntitlementService.getUserTimezone(userId);
  const todayUsage = EntitlementService.getTodayUsage(userId, tz);
  const remaining = Math.max(0, planConfig.dailyTokenLimit - todayUsage.totalTokens);
  const resetAt = EntitlementService.getNextResetTimestamp(tz);
  const history = EntitlementService.getRecentUsageHistory(userId);

  return res.status(200).json({
    plan: planConfig.id,
    planName: planConfig.name,
    dailyTokenLimit: planConfig.dailyTokenLimit,
    tokensUsedToday: todayUsage.totalTokens,
    tokensRemainingToday: remaining,
    requestCountToday: todayUsage.requestCount,
    resetAt,
    timezone: tz,
    recentRequests: history.slice(-10)
  });
});

// ---------------------------------------------------------------------------
// 5. AI Daily Brief Generation Endpoint (NVIDIA NIM)
// ---------------------------------------------------------------------------
app.post("/api/ai/daily-brief", async (req, res) => {
  try {
    const ai = getNvidiaClient();
    const { userPrompt } = req.body;

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "NVIDIA AI service is not configured. Please check your NVIDIA_API_KEY."
      });
    }

    const model = process.env.AI_MODEL || config.ai.defaultModel || "meta/llama-3.1-8b-instruct";
    const response = await ai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are Contril, an elite AI Chief of Staff. Synthesize a concise executive morning brief in JSON format containing: 'summary' (string), 'top3' (array of 3 strings), and 'workloadEstimate' (string). Return only valid JSON. Strictly real data only."
        },
        {
          role: "user",
          content: userPrompt || "Synthesize an executive morning brief for today."
        }
      ],
      temperature: 0.6,
      max_tokens: 512,
    });

    let rawText = response.choices?.[0]?.message?.content?.trim() || "{}";
    rawText = rawText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(rawText);
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Error in /api/ai/daily-brief:", error);
    return res.status(502).json({
      success: false,
      error: "Failed to generate daily brief from AI service. Please try again."
    });
  }
});

// ---------------------------------------------------------------------------
// 6. AI Inbox Reply Generator Endpoint (NVIDIA NIM)
// ---------------------------------------------------------------------------
app.post("/api/ai/inbox-reply", async (req, res) => {
  try {
    const ai = getNvidiaClient();
    const { sender = "Sender", subject = "Update", preview = "", emailContent, tone = "decisive, polite, and brief" } = req.body;

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "NVIDIA AI service is not configured. Please check your NVIDIA_API_KEY."
      });
    }

    const prompt = `Sender: ${sender}\nSubject: ${subject}\nPreview: ${preview}\nFull Text: ${emailContent || preview}\n\nDraft a high-level executive reply in a ${tone} tone. Keep it under 4 sentences. Do not include subject lines, only the body text.`;
    const model = process.env.AI_MODEL || config.ai.defaultModel || "meta/llama-3.1-8b-instruct";

    const response = await ai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are an executive assistant drafting emails on behalf of a CEO/Founder. Be direct, professional, clear, and action-oriented. Strictly real data only."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 300,
    });

    return res.json({
      success: true,
      draft: response.choices?.[0]?.message?.content?.trim() || ""
    });
  } catch (error: any) {
    console.error("Error in /api/ai/inbox-reply:", error);
    return res.status(502).json({
      success: false,
      error: "Failed to generate inbox reply. Please try again."
    });
  }
});

// ---------------------------------------------------------------------------
// 7. AI Meeting Intelligence & Action Item Follow-Up Generator Endpoint
// ---------------------------------------------------------------------------
app.post("/api/ai/meeting-intelligence", async (req, res) => {
  try {
    const ai = getNvidiaClient();
    const { title, transcript, attendees, tone, customInstructions } = req.body;

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Meeting intelligence could not be generated. Please check the NVIDIA API key configuration."
      });
    }

    const promptText = `Meeting Title: ${title || 'Executive Sync'}
Attendees: ${Array.isArray(attendees) ? attendees.join(', ') : (attendees || 'Executive Team')}
Tone Preference: ${tone || 'Executive & Professional'}
Custom Directives: ${customInstructions || 'None'}

Meeting Transcript / Raw Summary:
${transcript}`;

    const model = process.env.AI_MODEL || config.ai.defaultModel || "meta/llama-3.1-8b-instruct";
    const response = await ai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `You are Contril, an elite AI Chief of Staff. Ingest meeting transcripts, extract key decisions, assign action items with owners and deadlines, and draft follow-up emails. Return ONLY valid JSON with keys: 'summary' (string), 'decisions' (string[]), 'actionItems' (array of { task, owner, deadline, completed }), 'followUpEmailDraft' (string), and 'personalizedEmails' (array of { recipient, recipientEmail, subject, emailText, assignedActionItems }). Strictly real data only.`
        },
        { role: "user", content: promptText }
      ],
      temperature: 0.6,
      max_tokens: 1024,
    });

    let rawText = response.choices?.[0]?.message?.content?.trim() || "{}";
    rawText = rawText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(rawText);
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Error in /api/ai/meeting-intelligence:", error);
    return res.status(502).json({
      success: false,
      error: "Failed to generate meeting intelligence. Please try again."
    });
  }
});

// Dedicated Single / Refined Follow-Up Email Generation Endpoint
app.post("/api/ai/generate-followup-email", async (req, res) => {
  try {
    const ai = getNvidiaClient();
    const { meetingTitle, summary, decisions, actionItems, tone, recipientName, customInstructions } = req.body;

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Follow-up email could not be generated."
      });
    }

    const prompt = `Meeting: ${meetingTitle || 'Executive Meeting'}
Target Recipient: ${recipientName || 'All Attendees'}
Tone Style: ${tone || 'Executive & Direct'}
Custom AI Directive: ${customInstructions || 'None'}

Meeting Context:
Summary: ${summary || 'N/A'}
Decisions: ${JSON.stringify(decisions || [])}
Action Items: ${JSON.stringify(actionItems || [])}

Generate a polished follow-up email draft matching the specified tone and directives in JSON format with keys: 'subject' (string), 'emailText' (string).`;

    const model = process.env.AI_MODEL || config.ai.defaultModel || "meta/llama-3.1-8b-instruct";
    const response = await ai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are an executive assistant drafting a tailored, high-precision follow-up email. Return JSON with 'subject' and 'emailText'. Strictly real data only."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 512,
    });

    let rawText = response.choices?.[0]?.message?.content?.trim() || "{}";
    rawText = rawText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(rawText);
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Error in /api/ai/generate-followup-email:", error);
    return res.status(502).json({
      success: false,
      error: "Failed to generate follow-up email. Please try again."
    });
  }
});

// ---------------------------------------------------------------------------
// 8. AI Memory Natural Language Search Endpoint
// ---------------------------------------------------------------------------
app.post("/api/ai/memory-search", async (req, res) => {
  try {
    const ai = getNvidiaClient();
    const { query, memoryItems } = req.body;

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "NVIDIA AI service is not configured. Please check your NVIDIA_API_KEY."
      });
    }

    const contextText = JSON.stringify(memoryItems || []);
    const prompt = `User Query: "${query}"\n\nMemory Context:\n${contextText}\n\nAnswer the user query precisely using the memory context in JSON format with keys: 'answer' (string) and 'sources' (string[]).`;
    const model = process.env.AI_MODEL || config.ai.defaultModel || "meta/llama-3.1-8b-instruct";

    const response = await ai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are the AI Memory Core for Contril. Answer questions with exact dates, facts, and documents referenced from memory. Strictly real data only."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 512,
    });

    let rawText = response.choices?.[0]?.message?.content?.trim() || "{}";
    rawText = rawText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(rawText);
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Error in /api/ai/memory-search:", error);
    return res.status(502).json({
      success: false,
      error: "Failed to search memory. Please try again."
    });
  }
});

// ---------------------------------------------------------------------------
// 9. AI Document Brain Analysis Endpoint
// ---------------------------------------------------------------------------
app.post("/api/ai/document-analyze", async (req, res) => {
  try {
    const ai = getNvidiaClient();
    const { fileName, documentText } = req.body;

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "NVIDIA AI service is not configured. Please check your NVIDIA_API_KEY."
      });
    }

    const model = process.env.AI_MODEL || config.ai.defaultModel || "meta/llama-3.1-8b-instruct";
    const response = await ai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "Analyze executive legal/financial documents. Return JSON with: 'summary' (string), 'clauses' (array of { title, risk: 'low'|'medium'|'high', text }), 'keyDates' (array of { label, date }), and 'financials' (array of { item, value }). Strictly real data only."
        },
        {
          role: "user",
          content: `Document Name: ${fileName}\nContent Sample:\n${documentText}`
        }
      ],
      temperature: 0.6,
      max_tokens: 1024,
    });

    let rawText = response.choices?.[0]?.message?.content?.trim() || "{}";
    rawText = rawText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(rawText);
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Error in /api/ai/document-analyze:", error);
    return res.status(502).json({
      success: false,
      error: "Failed to analyze document. Please try again."
    });
  }
});

// ---------------------------------------------------------------------------
// 10. AI Conversational & Knowledge Engine Endpoints
// ---------------------------------------------------------------------------

async function fetchGmailSummary(token: string): Promise<string> {
  try {
    const listRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!listRes.ok) return "Unable to fetch emails (unauthorized).";
    const listData = await listRes.json() as any;
    if (!listData.messages || !Array.isArray(listData.messages)) {
      return "Your inbox has no unread messages.";
    }
    const emails = [];
    for (const msgRef of listData.messages.slice(0, 5)) {
      const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}?format=minimal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (detailRes.ok) {
        const detail = await detailRes.json() as any;
        emails.push(`- Subject/Preview: "${detail.snippet}"`);
      }
    }
    return emails.length > 0 ? emails.join("\n") : "Your inbox has no unread messages.";
  } catch (e) {
    return "Failed to query Gmail inbox.";
  }
}

async function fetchGoogleCalendarEvents(token: string): Promise<any[]> {
  try {
    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true&timeMin=" + encodeURIComponent(new Date().toISOString()), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json() as any;
      return (data.items || []).map((item: any) => ({
        title: item.summary || "No Title",
        time: item.start?.dateTime || item.start?.date || "TBD",
        platform: item.hangoutLink ? "Google Meet" : "In-Person"
      }));
    }
  } catch (e) {
    console.error("Failed to fetch calendar events in tool:", e);
  }
  return [];
}

// Real-time Chat Streaming Endpoint
app.post("/api/ai/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { prompt, history, userName, profile, timezone, connectedApps, activeProject, googleTokens } = req.body;

  if (!prompt || !prompt.trim()) {
    res.write(`data: ${JSON.stringify({ error: "Prompt cannot be empty" })}\n\n`);
    res.write("data: [DONE]\n\n");
    return res.end();
  }

  const ai = getNvidiaClient();
  if (!ai) {
    res.write(`data: ${JSON.stringify({ error: "NVIDIA API key is not configured on server." })}\n\n`);
    res.write("data: [DONE]\n\n");
    return res.end();
  }

  try {
    const model = process.env.AI_MODEL || config.ai.defaultModel || "meta/llama-3.1-8b-instruct";
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `${CHIEF_AI_OFFICER_PROMPT}\n\nWorkspace Context:\n- User: ${userName || 'Executive'}\n- Time: ${new Date().toLocaleString()}\n- Timezone: ${timezone || 'Asia/Kolkata'}\n- Apps: ${connectedApps?.join(', ') || 'None'}\nStrictly real data only.`
      }
    ];

    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg.text && msg.text.trim()) {
          const role = msg.role === 'user' ? 'user' : 'assistant';
          messages.push({ role, content: msg.text });
        }
      }
    }
    messages.push({ role: "user", content: prompt });

    const stream = await ai.chat.completions.create({
      model,
      messages,
      temperature: 0.6,
      max_tokens: 1024,
      stream: true,
      stream_options: { include_usage: true }
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || "";
      if (delta) {
        res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    return res.end();
  } catch (error: any) {
    console.error("[Contril Chat Stream] Stream error:", error);
    const isRateLimit = error.status === 429;
    const msg = isRateLimit
      ? "AI service is temporarily busy (rate limited). Please try again in a few moments."
      : error.message || "Streaming failed";
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.write("data: [DONE]\n\n");
    return res.end();
  }
});

// Conversational Endpoint with RAG
app.post("/api/ai/converse", async (req, res) => {
  try {
    const ai = getNvidiaClient();
    const { prompt, userName, history, profile, timezone, connectedApps, activeProject, googleTokens } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: "Prompt cannot be empty" });
    }

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "NVIDIA AI service is not configured. Please check your NVIDIA_API_KEY in environment variables."
      });
    }

    const intent = UniversalIntentEngine.classify(prompt);
    let liveWorkspaceContext = "";
    let summaryText = "";

    const isSearchIntent = (txt: string, intentName: string) => {
      const p = txt.toLowerCase();
      const keywords = ['find', 'search', 'lookup', 'where is', 'get', 'emails', 'files', 'meetings', 'messages', 'retrieve', 'invoice'];
      return ['email', 'calendar', 'documents', 'search'].includes(intentName) || keywords.some(k => p.includes(k));
    };

    if (isSearchIntent(prompt, intent.name)) {
      const match = prompt.match(/(?:find|search|lookup|where is|get)\s+([a-zA-Z0-9_\-\.\@\s]+)/i);
      const searchTerm = match && match[1] ? match[1].trim() : prompt.trim();
      const searchRes = await searchWorkspace(searchTerm, connectedApps || [], googleTokens?.accessToken);
      
      if (searchRes.results.length > 0) {
        liveWorkspaceContext += `\n\n## Search Results found in Workspace:\n` + searchRes.results.map((r: any, idx: number) => 
          `[Match ${idx+1}] Source: ${r.source} (${r.type}) | Title: ${r.title}\nSnippet: ${r.snippet}`
        ).join("\n\n");
      } else {
        liveWorkspaceContext += `\n\n## Search Results found in Workspace:\nNo matching records found in connected accounts.`;
      }
    } else {
      if (googleTokens?.accessToken && !googleTokens.accessToken.startsWith('demo_')) {
        const emailText = await fetchGmailSummary(googleTokens.accessToken);
        liveWorkspaceContext += `\n\n### Live Gmail Inbox Context:\n${emailText}`;

        const eventList = await fetchGoogleCalendarEvents(googleTokens.accessToken);
        if (eventList.length > 0) {
          liveWorkspaceContext += `\n\n### Live Google Calendar Context:\n` + eventList.map(ev => `- Event: ${ev.title} | Time: ${ev.time} | Platform: ${ev.platform}`).join("\n");
        } else {
          liveWorkspaceContext += `\n\n### Live Google Calendar Context:\nNo upcoming events found.`;
        }
      } else {
        liveWorkspaceContext += `\n\n### Workspace Status:\nNo Google account connected. Do not reference any emails, meetings, or calendar events -- none are available.`;
      }
    }

    const agent = AgentSystem.selectBestAgent(prompt);
    const systemInstruction = `${CHIEF_AI_OFFICER_PROMPT}

## Active Agent: ${agent.name}
Role: ${agent.role}
Special Instructions:
${agent.systemPrompt}
- Strictly real data only. Do not hallucinate emails, files, or meetings. If no records exist, answer naturally stating 0 matches.

## Current Workspace Context:
- User Name: ${userName || 'Not provided'}
- Timezone: ${timezone || 'Not provided'}
- Current Server Time: ${new Date().toLocaleString()}
- Connected Apps: ${connectedApps ? connectedApps.join(", ") : "None"}
- Active Project: ${activeProject || "None"}
- Plan Tier: ${profile?.plan || 'FREE'}
${liveWorkspaceContext}`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemInstruction }
    ];

    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg.text && msg.text.trim()) {
          const role = msg.role === 'user' ? 'user' : 'assistant';
          messages.push({ role, content: msg.text });
        }
      }
    }
    messages.push({ role: "user", content: prompt });

    const model = process.env.AI_MODEL || config.ai.defaultModel || "meta/llama-3.1-8b-instruct";
    const response = await ai.chat.completions.create({
      model,
      messages,
      temperature: 0.6,
      max_tokens: 1024,
    });

    const reply = response.choices?.[0]?.message?.content?.trim() || "";
    return res.json({
      success: true,
      reply
    });
  } catch (error: any) {
    console.error("[Contril Chat Converse] Error:", error);
    const isRateLimit = error.status === 429;
    const msg = isRateLimit
      ? "AI service is temporarily busy (rate limited). Please try again in a few moments."
      : error.message || "An unexpected error occurred.";
    return res.status(isRateLimit ? 429 : 500).json({
      success: false,
      error: msg
    });
  }
});

// ---------------------------------------------------------------------------
// 11. Android App Mobile Integration Endpoints
// ---------------------------------------------------------------------------
app.use("/release", express.static(path.join(process.cwd(), "release")));

app.get("/api/mobile/version", (req, res) => {
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const host = req.get("host") || "localhost:3000";
  res.json({
    latestVersion: "0.1.2",
    minimumVersion: "0.1.0",
    apkUrl: `${protocol}://${host}/release/contril-release.apk`,
    releaseNotes: "Contril Early Access 0.1.2: Added native background synchronization, push notification handlers, and full-screen workspace spotlight search."
  });
});

// ---------------------------------------------------------------------------
// Vite Server Integration & Production Static Serving
// ---------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Contril AI OS Server running on http://0.0.0.0:${PORT}`);
    GoogleTokenRefreshWorker.start();
  });
}

export default app;

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  startServer();
}
