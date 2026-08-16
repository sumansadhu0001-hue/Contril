import { canExecuteAiCommand, incrementAiCommandUsage } from './featureGating';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  error?: string | null;
  rawPrompt?: string;
}

export interface StreamChatOptions {
  prompt: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  userName?: string;
  profile?: any;
  timezone?: string;
  connectedApps?: string[];
  activeProject?: string;
  googleTokens?: any;
  onChunk: (chunkText: string) => void;
  onComplete: (fullText: string) => void;
  onError: (errorMessage: string) => void;
}

export async function streamChatResponse({
  prompt,
  history,
  userName = '',
  profile,
  timezone,
  connectedApps,
  activeProject,
  googleTokens,
  onChunk,
  onComplete,
  onError
}: StreamChatOptions): Promise<void> {
  const gateCheck = canExecuteAiCommand();
  if (!gateCheck.allowed) {
    onError(gateCheck.reason || 'AI credit limit reached for your plan.');
    return;
  }

  // Increment usage count
  incrementAiCommandUsage();

  console.log('[Contril Chat Pipeline] Initiating chat request:', {
    prompt,
    historyLength: history.length,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        userName,
        history: history.map((m) => ({
          role: m.role,
          text: m.content
        })),
        profile,
        timezone,
        connectedApps,
        activeProject,
        googleTokens
      })
    });

    console.log('[Contril Chat Pipeline] Stream HTTP response status:', response.status);

    if (!response.ok) {
      let errText = `Server returned status ${response.status}`;
      try {
        const json = await response.json();
        if (json.error) errText = json.error;
      } catch (e) {
        // Non-JSON response body
      }
      console.error('[Contril Chat Pipeline] Stream HTTP Error:', errText);
      onError(errText);
      return;
    }

    if (!response.body) {
      console.warn('[Contril Chat Pipeline] Response body is missing. Falling back to non-streaming endpoint...');
      await fallbackNonStream(prompt, history, userName, onComplete, onError);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let accumulatedText = '';
    let buffer = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunkStr = decoder.decode(value, { stream: !done });
        buffer += chunkStr;

        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataContent = trimmed.replace(/^data:\s*/, '');
          if (dataContent === '[DONE]') {
            done = true;
            break;
          }

          try {
            const parsed = JSON.parse(dataContent);
            if (parsed.error) {
              console.error('[Contril Chat Pipeline] Stream returned error payload:', parsed.error);
              onError(parsed.error);
              return;
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              onChunk(parsed.text);
            }
          } catch (e) {
            console.warn('[Contril Chat Pipeline] Unable to parse SSE event data:', dataContent);
          }
        }
      }
    }

    // Process leftover buffer
    if (buffer.trim().startsWith('data:')) {
      const dataContent = buffer.trim().replace(/^data:\s*/, '');
      if (dataContent !== '[DONE]') {
        try {
          const parsed = JSON.parse(dataContent);
          if (parsed.error) {
            onError(parsed.error);
            return;
          }
          if (parsed.text) {
            accumulatedText += parsed.text;
            onChunk(parsed.text);
          }
        } catch (e) {
          // ignore
        }
      }
    }

    console.log('[Contril Chat Pipeline] Stream closed. Total accumulated characters:', accumulatedText.length);

    if (!accumulatedText.trim()) {
      console.warn('[Contril Chat Pipeline] Empty stream received. Attempting non-streaming fallback...');
      await fallbackNonStream(prompt, history, userName, onComplete, onError);
    } else {
      onComplete(accumulatedText);
    }
  } catch (err: any) {
    console.error('[Contril Chat Pipeline] Exception during streaming request:', err);
    try {
      console.log('[Contril Chat Pipeline] Attempting non-streaming fallback after exception...');
      await fallbackNonStream(prompt, history, userName, onComplete, onError);
    } catch (fallbackErr: any) {
      const errMsg = err?.message || 'Network error occurred while connecting to AI service.';
      onError(errMsg);
    }
  }
}

async function fallbackNonStream(
  prompt: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  userName: string,
  onComplete: (fullText: string) => void,
  onError: (errorMessage: string) => void
): Promise<void> {
  console.log('[Contril Chat Pipeline] Requesting /api/ai/converse fallback...');

  const res = await fetch('/api/ai/converse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      userName,
      history: history.map((m) => ({
        role: m.role,
        text: m.content
      }))
    })
  });

  const data = await res.json();
  console.log('[Contril Chat Pipeline] Fallback response status:', res.status, data);

  if (res.ok && data.success && data.reply) {
    onComplete(data.reply);
  } else {
    const errorMsg = data.error || data.message || 'Failed to generate AI response.';
    console.error('[Contril Chat Pipeline] Fallback error:', errorMsg);
    onError(errorMsg);
  }
}
