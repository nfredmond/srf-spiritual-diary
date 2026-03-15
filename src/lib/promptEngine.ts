import type { DiaryEntry } from '../types/DiaryEntry';

export interface SpiritualImagePromptResult {
  prompt: string;
  negativePrompt: string;
  styleName: string;
  keywords: string[];
}

const STYLE_PALETTES = [
  {
    name: 'lotus dawn',
    visual: 'misty lotus pond at sunrise, rose-gold atmosphere, devotional serenity, soft rays over still water',
  },
  {
    name: 'himalayan light',
    visual: 'high Himalayan ridges, crystal air, dawn-blue sky, subtle snow glow, contemplative silence',
  },
  {
    name: 'cosmic stillness',
    visual: 'deep midnight blue cosmos, tranquil aurora veil, luminous sacred geometry in natural forms',
  },
  {
    name: 'desert of inner silence',
    visual: 'vast golden desert at twilight, long meditative shadows, still horizon, calm sacred minimalism',
  },
];

const SYMBOL_MAP: Array<{ words: string[]; imagery: string }> = [
  { words: ['light', 'radiant', 'illumination'], imagery: 'a central field of warm divine light' },
  { words: ['peace', 'calm', 'stillness'], imagery: 'mirror-like still water and tranquil open space' },
  { words: ['love', 'devotion', 'heart'], imagery: 'soft flowing currents of compassionate golden glow' },
  { words: ['soul', 'spirit', 'divine'], imagery: 'ethereal ascending light forms in the distance' },
  { words: ['freedom', 'liberation'], imagery: 'open sky with expansive movement and release' },
  { words: ['wisdom', 'truth', 'knowledge'], imagery: 'natural geometric harmony and balanced symmetry' },
];

const DEFAULT_NEGATIVE_PROMPT = [
  'no visible text',
  'no letters',
  'no words',
  'no numbers',
  'no logos',
  'no signatures',
  'no watermarks',
  'no glyphs',
  'no symbols',
  'no calligraphy',
  'no typographic marks',
  'no subtitles',
  'no captions',
  'no commercial design',
  'no flashy advertising aesthetic',
  'no neon colors',
  'no harsh contrast',
  'no sci-fi spectacle',
  'no exaggerated fantasy effects',
  'no people posing for camera',
  'no crowded scene',
].join(', ');

function getDateKeyStyleIndex(dateKey: string): number {
  const [monthRaw, dayRaw] = dateKey.split('-');
  const month = Number(monthRaw) || 1;
  const day = Number(dayRaw) || 1;
  return (month * 31 + day) % STYLE_PALETTES.length;
}

function extractKeywords(entry: DiaryEntry): string[] {
  const text = `${entry.topic} ${entry.weeklyTheme ?? ''} ${entry.quote}`.toLowerCase();
  const matches = new Set<string>();

  for (const symbol of SYMBOL_MAP) {
    if (symbol.words.some((w) => text.includes(w))) {
      matches.add(symbol.imagery);
    }
  }

  if (matches.size === 0) {
    matches.add(`a contemplative visual metaphor for ${entry.topic.toLowerCase()}`);
  }

  return Array.from(matches);
}

export function buildSpiritualImagePrompt(
  entry: DiaryEntry,
  options?: {
    dateKey?: string;
    allowOmSymbol?: boolean;
  },
): SpiritualImagePromptResult {
  const dateKey = options?.dateKey ?? `${String(entry.month).padStart(2, '0')}-${String(entry.day).padStart(2, '0')}`;
  const style = STYLE_PALETTES[getDateKeyStyleIndex(dateKey)];
  const keywords = extractKeywords(entry);
  const allowOm = options?.allowOmSymbol ?? true;

  const omClause = allowOm
    ? 'Optionally include one very subtle Om (ॐ) symbol blended into natural texture; if used, only one and not dominant.'
    : 'Do not include Om or any symbol.';

  const prompt = [
    'Create reverent spiritual artwork inspired by Self-Realization Fellowship teachings, quiet devotion, humility, stillness, and inward communion with the Divine.',
    `Theme: ${entry.weeklyTheme ?? entry.topic}. Topic focus: ${entry.topic}.`,
    `Quote essence: ${entry.quote}`,
    `Style palette: ${style.name} (${style.visual}).`,
    `Key visual cues: ${keywords.join('; ')}.`,
    entry.specialDay ? `Honor context: ${entry.specialDay}.` : '',
    'Visual tone: calm, welcoming, sacred, contemplative, non-commercial, warm earth tones with soft gold, cream, rose dawn, mountain light, temple garden stillness, lotus symbolism, ocean or sky serenity when fitting.',
    'Composition: balanced, elegant, spacious, natural light, painterly realism or refined devotional illustration, no people posing for camera, no dramatic spectacle, no textual elements.',
    omClause,
  ]
    .filter(Boolean)
    .join(' ');

  const negativePrompt = allowOm
    ? `${DEFAULT_NEGATIVE_PROMPT}, except at most one subtle Om symbol (ॐ)`
    : DEFAULT_NEGATIVE_PROMPT;

  return {
    prompt,
    negativePrompt,
    styleName: style.name,
    keywords,
  };
}
