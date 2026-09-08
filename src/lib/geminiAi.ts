import { robustParseJson } from './nvidiaAi';

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
  onLog?: (msg: string) => void
): Promise<{ nodes: any[]; edges: any[] }> {
  onLog?.(`⚡ Preparing request for Direct Google Gemini API (${modelId})...`);

  const systemPrompt = `You are a world-class AI Mind Map Architect.
Your task is to take a prompt (and optional existing mindmap structure) and generate or expand a comprehensive, highly detailed hierarchical JSON mindmap graph.

MANDATORY RULES:
1. Return ONLY a single valid JSON object. No intro, no trailing text, no markdown code blocks if possible.
2. The JSON schema MUST be:
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

3. Ensure EVERY node has a unique string "id" (e.g. node_1, node_2, node_3...).
4. "parentId" of root node is null.
5. Create at least 1 Root Node, 4 to 8 Level-1 Nodes, and 2 to 4 Level-2 children for each Level-1 node.
6. Provide rich descriptions in "details" and bullet points in "note".
7. Use harmonious hex color codes (e.g. #00f2fe, #ff007f, #10b981, #f59e0b, #8b5cf6, #3b82f6).`;

  let userPromptText = `Generate a complete, deeply detailed mind map for topic: "${prompt}"`;

  if (existingNodes.length > 0) {
    const compactNodes = existingNodes.map((n) => ({
      id: n.id,
      text: n.text,
      depth: n.depth,
      parentId: n.parentId,
    }));
    userPromptText = `Existing MindMap structure:
${JSON.stringify(compactNodes, null, 2)}

User request: "${prompt}"

Upgrade, expand, and refine this mind map based on the user request. Add missing branches, improve details, and output the complete upgraded mind map JSON.`;
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

  onLog?.(`⚙️ Successfully parsed ${parsed.nodes.length} nodes from Gemini. Computing layout...`);

  const nodes: any[] = [];
  const edges: any[] = [];
  const rawNodes = parsed.nodes;

  // Pre-process rawNodes to ensure unique IDs
  const rawSeenIds = new Set<string>();
  rawNodes.forEach((n: any, idx: number) => {
    let origId = n.id ? String(n.id).trim() : `node_${idx + 1}`;
    let uniqueId = origId;
    let count = 1;
    while (rawSeenIds.has(uniqueId)) {
      uniqueId = `${origId}_${count++}`;
    }
    rawSeenIds.add(uniqueId);
    n.id = uniqueId;
  });

  const rootNode = rawNodes.find((n: any) => n.isRoot || n.depth === 0) || rawNodes[0];
  const rootId = rootNode.id || 'root_main';
  const rootX = 400;
  const rootY = 300;

  nodes.push({
    ...rootNode,
    id: rootId,
    isRoot: true,
    depth: 0,
    parentId: null,
    x: rootNode.x !== undefined ? rootNode.x : rootX,
    y: rootNode.y !== undefined ? rootNode.y : rootY,
    width: rootNode.width || 220,
    height: rootNode.height || 64,
    color: rootNode.color || '#00f2fe',
    emoji: rootNode.emoji || '🧠',
    details: rootNode.details || '',
    note: rootNode.note || '',
  });

  const level1Nodes = rawNodes.filter((n: any) => n !== rootNode && (n.parentId === rootId || n.depth === 1));
  const otherNodes = rawNodes.filter((n: any) => n !== rootNode && !level1Nodes.includes(n));

  const totalL1 = level1Nodes.length || 1;
  const angleStep = (2 * Math.PI) / totalL1;
  const radius1 = 280;

  level1Nodes.forEach((node: any, idx: number) => {
    const angle = idx * angleStep - Math.PI / 2;
    const x = node.x !== undefined ? node.x : Math.round(rootX + radius1 * Math.cos(angle));
    const y = node.y !== undefined ? node.y : Math.round(rootY + radius1 * Math.sin(angle));
    const nodeId = node.id || `node_l1_${idx}`;

    nodes.push({
      ...node,
      id: nodeId,
      isRoot: false,
      depth: 1,
      parentId: rootId,
      x,
      y,
      width: node.width || 180,
      height: node.height || 56,
      color: node.color || '#ff007f',
      emoji: node.emoji || '🚀',
      details: node.details || '',
      note: node.note || '',
    });

    edges.push({
      id: `e_${rootId}_${nodeId}`,
      source: rootId,
      target: nodeId,
      color: node.color || '#ff007f',
    });

    const children = otherNodes.filter((cn: any) => cn.parentId === node.id || cn.parentId === nodeId);
    const totalChild = children.length;
    if (totalChild > 0) {
      const childRadius = 180;
      const spreadAngle = Math.PI / 3;
      const startAngle = angle - spreadAngle / 2;
      const childStep = totalChild > 1 ? spreadAngle / (totalChild - 1) : 0;

      children.forEach((child: any, cIdx: number) => {
        const cAngle = totalChild > 1 ? startAngle + cIdx * childStep : angle;
        const cx = child.x !== undefined ? child.x : Math.round(x + childRadius * Math.cos(cAngle));
        const cy = child.y !== undefined ? child.y : Math.round(y + childRadius * Math.sin(cAngle));
        const childId = child.id || `node_l2_${idx}_${cIdx}`;

        nodes.push({
          ...child,
          id: childId,
          isRoot: false,
          depth: 2,
          parentId: nodeId,
          x: cx,
          y: cy,
          width: child.width || 160,
          height: child.height || 50,
          color: child.color || node.color || '#10b981',
          emoji: child.emoji || '📌',
          details: child.details || '',
          note: child.note || '',
        });

        edges.push({
          id: `e_${nodeId}_${childId}`,
          source: nodeId,
          target: childId,
          color: child.color || node.color || '#10b981',
        });
      });
    }
  });

  // Attach orphaned nodes
  const addedIds = new Set(nodes.map((n) => n.id));
  rawNodes.forEach((n: any, idx: number) => {
    if (!addedIds.has(n.id)) {
      const orphanId = n.id || `orphan_${idx}`;
      nodes.push({
        ...n,
        id: orphanId,
        isRoot: false,
        depth: n.depth || 2,
        parentId: n.parentId || rootId,
        x: n.x !== undefined ? n.x : 500,
        y: n.y !== undefined ? n.y : 500,
        width: n.width || 160,
        height: n.height || 50,
        color: n.color || '#8b5cf6',
        emoji: n.emoji || '📌',
      });
      if (n.parentId && addedIds.has(n.parentId)) {
        edges.push({
          id: `e_${n.parentId}_${orphanId}`,
          source: n.parentId,
          target: orphanId,
          color: n.color || '#8b5cf6',
        });
      }
    }
  });

  // Final deduplication
  const finalNodes: any[] = [];
  const seenNodeIds = new Set<string>();
  nodes.forEach((n, idx) => {
    let nid = n.id ? String(n.id).trim() : `node_${idx}`;
    let count = 1;
    while (seenNodeIds.has(nid)) {
      nid = `${n.id || 'node'}_dup_${count++}`;
    }
    seenNodeIds.add(nid);
    finalNodes.push({ ...n, id: nid });
  });

  const finalEdges: any[] = [];
  const seenEdgeIds = new Set<string>();
  edges.forEach((e, idx) => {
    let eid = e.id ? String(e.id).trim() : `e_${e.source}_${e.target}`;
    let count = 1;
    while (seenEdgeIds.has(eid)) {
      eid = `${e.id || 'edge'}_dup_${count++}`;
    }
    seenEdgeIds.add(eid);
    finalEdges.push({ ...e, id: eid });
  });

  onLog?.(`✨ Google Gemini MindMap generated successfully with ${finalNodes.length} nodes & ${finalEdges.length} connections!`);
  return { nodes: finalNodes, edges: finalEdges };
}
