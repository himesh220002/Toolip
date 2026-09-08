import { robustParseJson } from './nvidiaAi';
import { mergeIncrementalMindMap } from './mindMapMerger';

export const getGeminiApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('toolip_gemini_api_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
};

export const setGeminiApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('toolip_gemini_api_key', key.trim());
};

export interface GeminiModelItem {
  id: string;
  name: string;
  badge: string;
  type: 'text' | 'vision';
  provider: 'gemini';
  description: string;
}

export const CLOUD_GEMINI_MODELS: GeminiModelItem[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Latest SOTA Flash)',
    badge: 'Gemini 3.8 Flash',
    type: 'text',
    provider: 'gemini',
    description: 'Flagship SOTA Flash model engineered for long-horizon software engineering, agentic tools, and instant graph layout generation.',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview (SOTA Reasoning)',
    badge: 'Gemini 3.1 Pro',
    type: 'text',
    provider: 'gemini',
    description: 'Latest SOTA reasoning model with deep architectural understanding, complex tree logic, and multimodal parsing.',
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash (High Speed)',
    badge: 'Gemini 3.7 Flash',
    type: 'text',
    provider: 'gemini',
    description: 'High-speed, reliable Flash model built for multi-step execution and instant mindmap auto-expansions.',
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite (Ultra Fast)',
    badge: 'Gemini 3.5 Lite',
    type: 'text',
    provider: 'gemini',
    description: 'Fastest, most cost-effective 3.5 model for high-volume rapid mindmapping and instant child node generation.',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash (Multimodal)',
    badge: 'Gemini 3.6 Flash',
    type: 'text',
    provider: 'gemini',
    description: 'Balanced Flash model offering strong multimodal reasoning across general agentic and structured data tasks.',
  },
];

const MODEL_ALIASES: Record<string, string> = {
  'gemini-2.5-pro': 'gemini-3.1-pro-preview',
  'gemini-2.5-flash': 'gemini-3.8-flash',
  'gemini-2.0-flash': 'gemini-3.8-flash',
  'gemini-1.5-pro': 'gemini-3.1-pro-preview',
  'gemini-1.5-flash': 'gemini-3.7-flash',
};

export interface GeminiCompletionOptions {
  apiKey?: string;
  modelId?: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

/**
 * Direct call to Google Gemini REST API (v1beta)
 */
export async function generateGeminiCompletion(options: GeminiCompletionOptions): Promise<string> {
  const apiKey = (options.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    throw new Error('Google Gemini API key required. Please enter your API key from Google AI Studio (https://aistudio.google.com/app/apikey).');
  }

  const requestedModel = options.modelId || 'gemini-3.8-flash';
  const modelId = MODEL_ALIASES[requestedModel] || requestedModel;

  // System instruction and contents formatting for Gemini API
  const systemMessage = options.messages.find((m) => m.role === 'system');
  const userMessages = options.messages.filter((m) => m.role !== 'system');

  const contents = userMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const payload: any = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.6,
      maxOutputTokens: options.maxTokens ?? 4096,
    },
  };

  if (systemMessage) {
    payload.systemInstruction = {
      parts: [{ text: systemMessage.content }],
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  const data = await res.json();

  if (!res.ok) {
    const errMsg = data.error?.message || `Google Gemini API error (${res.status})`;
    if (res.status === 400 && errMsg.toLowerCase().includes('key')) {
      throw new Error('Invalid Google Gemini API Key. Please verify your key at https://aistudio.google.com/app/apikey');
    }
    if (res.status === 429) {
      throw new Error('Google Gemini API Rate limit exceeded. Please wait a few seconds or try Gemini 3.8 Flash.');
    }
    throw new Error(errMsg);
  }

  const candidates = data.candidates;
  if (!candidates || candidates.length === 0 || !candidates[0].content?.parts?.[0]?.text) {
    throw new Error('Google Gemini returned an empty response.');
  }

  return candidates[0].content.parts[0].text;
}

/**
 * Generate high-speed MindMap structure using Google Gemini API.
 */
export async function generateMindMapWithGemini(
  prompt: string,
  apiKey?: string,
  modelId: string = 'gemini-3.8-flash',
  existingNodes: any[] = [],
  signal?: AbortSignal,
  onLog?: (msg: string) => void,
  existingEdges: any[] = [],
  targetNodeId?: string | null
): Promise<{ nodes: any[]; edges: any[] }> {
  onLog?.(`⚡ Preparing request for Direct Google Gemini API (${modelId})...`);

  const systemPrompt = `You are a world-class AI Mind Map Architect.
Your task is to take a prompt (and optional existing mindmap structure) and generate or expand a comprehensive, highly detailed hierarchical JSON mindmap graph.

MANDATORY RULES FOR MAP UPGRADES & EXPANSIONS:
1. Return ONLY a single valid JSON object. No intro, no trailing text, no markdown code blocks if possible.
2. IF AN EXISTING MINDMAP STRUCTURE IS PROVIDED: You MUST PRESERVE all existing node IDs and structure. To add new branches or expand a node, create NEW nodes with unique "id" strings and set their "parentId" to the target node's "id". Do NOT delete or rewrite existing branches.
3. The JSON schema MUST be:
{
  "nodes": [
    {
      "id": "node_1",
      "text": "Root Node Title",
      "isRoot": true,
      "depth": 0,
      "parentId": null,
      "emoji": "🧠",
      "color": "#00f2fe",
      "details": "Detailed breakdown explanation...",
      "note": "Sub-points or notes"
    },
    {
      "id": "node_2",
      "text": "Subtopic Title",
      "isRoot": false,
      "depth": 1,
      "parentId": "node_1",
      "emoji": "🚀",
      "color": "#ff007f",
      "details": "Details here...",
      "note": "Notes here..."
    }
  ]
}

4. Ensure EVERY node has a unique string "id" (e.g. node_1, node_2, node_3...).
5. "parentId" of root node is null.
6. Provide rich descriptions in "details" and bullet points in "note".
7. Use harmonious hex color codes (e.g. #00f2fe, #ff007f, #10b981, #f59e0b, #8b5cf6, #3b82f6).`;

  let userPromptText = `Generate a complete, deeply detailed mind map for topic: "${prompt}"`;

  if (existingNodes.length > 0) {
    const targetNode = (targetNodeId && existingNodes.find((n) => n.id === targetNodeId)) ||
      existingNodes.find((n) => n.isRoot || n.depth === 0) ||
      existingNodes[0];

    const targetChildrenTitles = existingNodes
      .filter((n) => n.parentId === targetNode.id)
      .map((n) => n.text);

    userPromptText = `MAP UPGRADE REQUEST:
- TARGET PARENT NODE TO EXPAND: "${targetNode.text}" (ID: "${targetNode.id}")
- Current Sub-Items under Target Node: ${JSON.stringify(targetChildrenTitles)}

USER PROMPT: "${prompt}"

CRITICAL GENERATION RULES:
1. Generate ONLY 4 to 8 BRAND NEW sub-nodes to extend the target parent node "${targetNode.text}".
2. Set "parentId": "${targetNode.id}" on every new node (or set parentId to one of your newly generated node IDs if creating multi-level sub-branches).
3. DO NOT INCLUDE OR REPEAT EXISTING NODES (${JSON.stringify(targetChildrenTitles)}). Do NOT output root or ancestor nodes. Output ONLY the new nodes array.
4. Each new node MUST have: unique string "id" (e.g. "new_1", "new_2"), "text" (specific title), "parentId" ("${targetNode.id}"), "emoji", "color", "details", and "note".
5. Return ONLY a valid JSON object matching: {"nodes": [...]}.`;
  }

  onLog?.(`📡 Dispatching request to Google Gemini API endpoint...`);
  if (signal?.aborted) throw new Error('AI generation was cancelled by user.');

  const rawText = await generateGeminiCompletion({
    apiKey,
    modelId,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPromptText },
    ],
    temperature: 0.6,
    maxTokens: 4000,
    signal,
  });

  if (signal?.aborted) throw new Error('AI generation was cancelled by user.');
  onLog?.(`⚡ Google Gemini response received. Parsing JSON graph structure...`);

  const parsed = robustParseJson(rawText);
  if (!parsed || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
    throw new Error('Google Gemini returned an invalid JSON mindmap structure.');
  }

  onLog?.(`⚙️ Successfully parsed ${parsed.nodes.length} nodes from Gemini. Performing incremental graph preservation & layout...`);

  const { nodes: finalNodes, edges: finalEdges } = mergeIncrementalMindMap(
    existingNodes,
    existingEdges,
    parsed.nodes,
    targetNodeId
  );

  onLog?.(`✨ Google Gemini MindMap updated successfully with ${finalNodes.length} nodes & ${finalEdges.length} connections!`);
  return { nodes: finalNodes, edges: finalEdges };
}
