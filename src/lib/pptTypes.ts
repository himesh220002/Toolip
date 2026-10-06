'use client';

// ─── PPT Generator core types (canvas = 960 x 540, 16:9) ───

export const PPT_W = 960;
export const PPT_H = 540;

export type PptElementType = 'text' | 'image' | 'shape' | 'line';

export interface PptElement {
  id: string;
  type: PptElementType;
  x: number; // px on 960x540 canvas
  y: number;
  w: number;
  h: number;
  text?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bg?: string;
  align?: 'left' | 'center' | 'right';
  fontFamily?: string;
  src?: string; // image url / base64
  opacity?: number; // 0-1
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  shape?: 'rect' | 'circle' | 'pill' | 'line';
  letterSpacing?: number;
}

export type PptLayoutId =
  | 'title-hero'
  | 'split-bullets'
  | 'stats-3'
  | 'team-grid'
  | 'timeline'
  | 'data-table'
  | 'quote-image'
  | 'closing';

export interface PptSlide {
  id: string;
  layout: PptLayoutId;
  themeId: string;
  bg: string;
  title: string; // sidebar label
  elements: PptElement[];
}

export interface PptTheme {
  id: string;
  name: string;
  category: string;
  bg: string;
  surface: string;
  accent: string;
  accent2: string;
  text: string;
  muted: string;
  headingFont: string;
  bodyFont: string;
}

export interface SlideContentItem {
  layout: PptLayoutId;
  title: string;
  subtitle?: string;
  kicker?: string;
  bullets?: string[];
  description?: string;
  stats?: Array<{ label: string; value: string; desc?: string }>;
  team?: Array<{ name: string; role: string }>;
  steps?: Array<{ label: string; desc?: string }>;
  table?: { headers: string[]; rows: string[][] };
  image?: string;
  quote?: string;
}

export const uid = (p = 'el'): string => `${p}_${Math.random().toString(36).slice(2, 9)}`;
