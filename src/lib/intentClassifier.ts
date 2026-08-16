export type IntentType = 
  | 'conversation' 
  | 'knowledge' 
  | 'creative' 
  | 'workspace_action' 
  | 'multi_step_workflow';

export interface IntentClassification {
  intentType: IntentType;
  requiresExecution: boolean; // Execution Panel = true ONLY for workspace_action or multi_step_workflow
  responseTitle?: string;
  responseText: string;
  saveMemoryRequested: boolean;
  workspaceModuleToOpen?: string; // Optional mode e.g. 'inbox', 'meetings', 'docs'
}

/**
 * Contril Intent Classification Layer
 * Strict Rules:
 * 1. Conversation (hello, hi, good morning, how are you, thank you, who are you) -> Respond naturally like Gemini/ChatGPT. NO execution, NO workspace access, NO execution panel.
 * 2. Knowledge Question (what is AI, explain quantum computing, who is Elon Musk, what is React) -> Answer normally. Never trigger execution.
 * 3. Creative Work (write an email, generate code, create a blog) -> Generate requested content directly in conversational card. DO NOT pretend to execute background tasks unless external tools required.
 * 4. Workspace Action (reply to today's emails, schedule a meeting, summarize inbox) -> Execution Panel = TRUE or navigate to connected workspace module.
 * 5. Multi-step Executive Workflow (review emails then prepare summary, analyze contracts & highlight risks) -> Execution Panel = TRUE.
 *
 * Golden Rule: Default behavior is conversation. Execution is the exception, not the default.
 */
export function classifyUserIntent(prompt: string, userName: string = ''): IntentClassification {
  const text = prompt.trim();
  const lower = text.toLowerCase();

  // Check explicit memory save request rule:
  // "Never save anything automatically. Only save if the user explicitly requests e.g. Remember this, Save this, Add this to memory."
  const isMemorySave = 
    lower.includes('remember this') || 
    lower.includes('save this') || 
    lower.includes('add this to memory') ||
    lower.includes('store this in memory') ||
    lower.startsWith('remember:') ||
    lower.startsWith('save:');

  // ---------------------------------------------------------------------------
  // 1. CONVERSATION DETECTOR
  // Examples: Hello, Hi, Good morning, How are you?, Thank you, Nice, Cool, Haha, Who are you?
  // ---------------------------------------------------------------------------
  const conversationalPhrases = [
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
    'how are you', 'how are you doing', 'thank you', 'thanks', 'nice', 'cool',
    'haha', 'who are you', 'what can you do', 'what is your name', 'good job',
    'awesome', 'great', 'ok', 'okay', 'bye', 'goodbye', 'sounds good', 'testing', 'test'
  ];

  const isExactConversation = conversationalPhrases.includes(lower);
  const isGreetingPattern = (lower.length <= 20 && (
    lower.startsWith('hi') || 
    lower.startsWith('hello') || 
    lower.startsWith('hey') || 
    lower.startsWith('thanks') || 
    lower.startsWith('thank you') ||
    lower.startsWith('good morning') ||
    lower.startsWith('good afternoon') ||
    lower.startsWith('good evening')
  ));

  // ---------------------------------------------------------------------------
  // 2. KNOWLEDGE QUESTION DETECTOR
  // Examples: What is AI?, Explain quantum computing, Who is Elon Musk?, What is React?
  // ---------------------------------------------------------------------------
  const knowledgePhrases = [
    'what is', 'explain', 'who is', 'how does', 'why does', 'why is', 'what are',
    'tell me about', 'difference between', 'define', 'history of', 'how do', 'what caused',
    'what means', 'how to learn', 'what is a'
  ];
  const isKnowledge = knowledgePhrases.some(k => lower.includes(k)) && 
    !lower.includes('my email') && 
    !lower.includes('my inbox') && 
    !lower.includes('my calendar') && 
    !lower.includes('my meeting') && 
    !lower.includes('my workspace') &&
    !lower.includes('my contract') &&
    !lower.includes('today\'s emails');

  // ---------------------------------------------------------------------------
  // 3. CREATIVE WORK DETECTOR
  // Examples: Write an email, Generate code, Create a blog, Summarize this, Translate this
  // ---------------------------------------------------------------------------
  const creativePhrases = [
    'write a', 'generate a', 'create a blog', 'write an essay', 'write code',
    'generate code', 'translate this', 'write a poem', 'draft a story', 'summarize this paragraph',
    'draft a sales email template', 'write a job description', 'create a story', 'code a'
  ];
  const isCreative = creativePhrases.some(k => lower.includes(k)) && 
    !lower.includes('my email') && 
    !lower.includes('my inbox') && 
    !lower.includes('today\'s emails') &&
    !lower.includes('my calendar') &&
    !lower.includes('my workspace');

  // ---------------------------------------------------------------------------
  // 4. MULTI-STEP EXECUTIVE WORKFLOW DETECTOR
  // Examples: Review today's emails then prepare a meeting summary, Analyze my contracts and highlight renewal risks
  // ---------------------------------------------------------------------------
  const workflowPhrases = [
    'then prepare', 'and highlight', 'compare this quarter', 'generate today\'s executive briefing',
    'prepare board meeting from', 'review today\'s emails then', 'analyze my contracts and',
    'audit and report', 'compare this quarter with last'
  ];
  const isMultiStepWorkflow = workflowPhrases.some(k => lower.includes(k));

  // ---------------------------------------------------------------------------
  // 5. WORKSPACE ACTION DETECTOR
  // Examples: Reply to today's emails, Schedule a meeting, Summarize my inbox, Review today's calendar, Find the lease agreement, Draft proposal
  // ---------------------------------------------------------------------------
  const workspaceActionPhrases = [
    'reply to today\'s emails', 'schedule a meeting', 'summarize my inbox',
    'review today\'s calendar', 'find the lease agreement', 'draft proposal for',
    'analyze q3 board deck', 'prepare tomorrow\'s meeting', 'create reminder',
    'search workspace', 'check my emails', 'my calendar', 'my docs', 'my inbox',
    'unread emails', 'today\'s workspace', 'my meetings', 'reply emails', 'reply to rahul',
    'open inbox', 'open calendar'
  ];
  const isWorkspaceAction = workspaceActionPhrases.some(k => lower.includes(k));

  // ===========================================================================
  // EXECUTION & CLASSIFICATION DECISION ENGINE
  // ===========================================================================

  // Explicit Multi-step Workflow -> Execution Panel = TRUE
  if (isMultiStepWorkflow) {
    return {
      intentType: 'multi_step_workflow',
      requiresExecution: true,
      responseText: `Initiating multi-step executive workflow for: "${text}"`,
      saveMemoryRequested: isMemorySave
    };
  }

  // Explicit Workspace Action -> Execution Panel = TRUE or Workspace Module Navigation
  if (isWorkspaceAction) {
    let moduleToOpen: string | undefined = undefined;
    if (lower.includes('email') || lower.includes('inbox')) moduleToOpen = 'inbox';
    if (lower.includes('meeting') || lower.includes('calendar')) moduleToOpen = 'meetings';
    if (lower.includes('contract') || lower.includes('doc') || lower.includes('agreement')) moduleToOpen = 'docs';

    return {
      intentType: 'workspace_action',
      requiresExecution: true,
      responseText: `Executing workspace action: "${text}"`,
      saveMemoryRequested: isMemorySave,
      workspaceModuleToOpen: moduleToOpen
    };
  }

  // Knowledge Question -> Execution Panel = FALSE
  if (isKnowledge) {
    return {
      intentType: 'knowledge',
      requiresExecution: false,
      responseText: getKnowledgeAnswer(lower, text),
      saveMemoryRequested: isMemorySave
    };
  }

  // Creative Work -> Execution Panel = FALSE
  if (isCreative) {
    return {
      intentType: 'creative',
      requiresExecution: false,
      responseText: getCreativeAnswer(lower, text, userName),
      saveMemoryRequested: isMemorySave
    };
  }

  // Conversation -> Execution Panel = FALSE
  if (isExactConversation || isGreetingPattern || (!isWorkspaceAction && !isMultiStepWorkflow)) {
    return {
      intentType: 'conversation',
      requiresExecution: false,
      responseText: getConversationalReply(lower, userName),
      saveMemoryRequested: isMemorySave
    };
  }

  // Golden Rule Fallback -> Default is Conversation! Execution Panel = FALSE
  const cleanName = userName && !userName.includes('Demo') ? userName : '';
  const nameGreeting = cleanName ? `, ${cleanName}` : '';
  return {
    intentType: 'conversation',
    requiresExecution: false,
    responseText: `Hello${nameGreeting}. How can I help you today?`,
    saveMemoryRequested: isMemorySave
  };
}

function getConversationalReply(lower: string, userName: string): string {
  const cleanName = userName && !userName.includes('Demo') ? userName : '';
  const nameGreeting = cleanName ? `, ${cleanName}` : '';

  if (lower.includes('who are you') || lower.includes('what are you')) {
    return `I am Contril, your executive AI operating system. I can answer questions, generate content, or manage your workspace tasks when instructed.`;
  }
  if (lower.includes('what can you do')) {
    return `I am built to assist you across multiple modes:
• Answer knowledge questions & conduct deep research
• Draft communications, emails, and technical content
• Execute workspace actions across emails, meetings, and documents when instructed
• Synthesize daily briefings and executive decisions`;
  }
  if (lower.includes('how are you')) {
    return `Hello${nameGreeting}. Doing great and ready to assist you. What can I do for you today?`;
  }
  if (lower.includes('good morning')) {
    return `Good morning${nameGreeting}. How can I help you today?`;
  }
  if (lower.includes('good afternoon')) {
    return `Good afternoon${nameGreeting}. What can I help you with today?`;
  }
  if (lower.includes('good evening')) {
    return `Good evening${nameGreeting}. Let me know if you need any assistance.`;
  }
  if (lower.includes('thank') || lower.includes('thanks')) {
    return `You're welcome${nameGreeting}. Let me know if you need anything else!`;
  }
  if (lower.includes('nice') || lower.includes('cool') || lower.includes('great') || lower.includes('awesome') || lower.includes('haha')) {
    return `Glad to hear${nameGreeting}. How can I help you next?`;
  }
  return `Hello${nameGreeting}. How can I help you today?`;
}

function getKnowledgeAnswer(lower: string, text: string): string {
  if (lower.includes('ai') || lower.includes('artificial intelligence')) {
    return `**Artificial Intelligence (AI)** refers to computer systems designed to perform tasks requiring cognitive capabilities human beings naturally possess—such as visual perception, natural language understanding, reasoning, learning, and decision-making.\n\nModern AI systems rely on deep neural networks and transformer architectures to analyze complex datasets and solve high-level tasks.`;
  }
  if (lower.includes('quantum computing')) {
    return `**Quantum Computing** leverages principles of quantum mechanics—specifically superposition and entanglement—to perform complex computations exponentially faster than classical supercomputers for certain problem domains.\n\nUnlike classical binary bits (0 or 1), quantum bits (qubits) can exist simultaneously in multiple probability states, making them exceptionally effective for cryptography, molecular modeling, and optimization.`;
  }
  if (lower.includes('elon musk')) {
    return `**Elon Musk** is a technology entrepreneur and executive. He is the CEO and Chief Engineer of SpaceX, CEO and Product Architect of Tesla, founder of xAI and Neuralink, and owner of X (formerly Twitter). He is best known for pioneering commercial space exploration, electric transportation, and artificial intelligence.`;
  }
  if (lower.includes('react')) {
    return `**React** is an open-source JavaScript library developed by Meta for building declarative, component-driven user interfaces.\n\nIt utilizes a Virtual DOM to efficiently update and render UI components when application state changes, providing a flexible framework for modern web applications.`;
  }
  if (lower.includes('llm') || lower.includes('large language model')) {
    return `**Large Language Models (LLMs)** are deep learning systems trained on vast text corpora to comprehend, generate, and reason with natural language.\n\nBased on Transformer architectures, LLMs process context window attention mechanisms to handle multi-step reasoning, translation, coding, and conversational tasks.`;
  }
  return `Here is a summary regarding **"${text}"**:\n\nIt represents a core concept in its domain, centered around structured principles and practical application. Let me know if you would like a deeper technical breakdown or specific examples!`;
}

function getCreativeAnswer(lower: string, text: string, userName: string = ''): string {
  if (lower.includes('poem')) {
    return `*Code in the quiet hours of night,*\n*A mind focused, thoughts in light.*\n*The workspace flows in steady rhyme,*\n*Mastering purpose, reclaiming time.*`;
  }
  if (lower.includes('code') || lower.includes('component')) {
    return `Here is a clean React component matching your request:\n\n\`\`\`tsx\nimport React from 'react';\n\nexport const ExecutiveCard: React.FC<{ title: string; description: string }> = ({\n  title,\n  description\n}) => {\n  return (\n    <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.08] text-white space-y-2">\n      <h3 className="text-base font-medium">{title}</h3>\n      <p className="text-sm text-[#B3B3BC]">{description}</p>\n    </div>\n  );\n};\n\`\`\``;
  }
  if (lower.includes('email') || lower.includes('draft')) {
    const signOffName = userName && !userName.includes('Demo') ? userName : 'Executive';
    return `Here is a drafted email template:\n\n**Subject:** Strategic Project Update & Alignment\n\nHi Team,\n\nI hope you are having a great week. I wanted to share a quick update regarding our current milestones and confirm alignment on our priorities for the upcoming sync.\n\nPlease review the attached summary and let me know if you have any questions.\n\nBest regards,\n${signOffName}`;
  }
  return `Here is your requested content for **"${text}"**:\n\nPrepared cleanly and concisely according to your request. Feel free to ask for any adjustments or specific variations!`;
}
