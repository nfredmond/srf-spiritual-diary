import type { QuoteVisualInterpretation } from './quoteInterpreter.js';

export interface PromptInputEntry {
  month: number;
  day: number;
  topic: string;
  weekly_theme?: string | null;
  quote: string;
  special_day?: string | null;
}

const STYLE_PALETTES = [
  { name: 'rose-gold dawn', visual: 'soft rose-gold dawn light, luminous mist, gentle devotional warmth' },
  { name: 'clear high-altitude light', visual: 'crisp blue-white atmosphere, clean clarity, elevated stillness' },
  { name: 'midnight blue radiance', visual: 'deep blue-violet atmosphere, subtle inner glow, contemplative depth' },
  { name: 'golden twilight minimalism', visual: 'quiet amber light, long shadows, restrained sacred simplicity' },
];

/* Legacy symbol map — kept as fallback when LLM interpretation is unavailable */
const SYMBOL_MAP: Array<{ words: string[]; imagery: string }> = [
  { words: ['light', 'radiant', 'illumination'], imagery: 'a central field of warm divine light' },
  { words: ['peace', 'calm', 'stillness'], imagery: 'mirror-like still water and tranquil open space' },
  { words: ['love', 'devotion', 'heart'], imagery: 'soft flowing currents of compassionate golden glow' },
  { words: ['soul', 'spirit', 'divine'], imagery: 'ethereal ascending light forms in the distance' },
  { words: ['freedom', 'liberation'], imagery: 'open sky with expansive movement and release' },
  { words: ['wisdom', 'truth', 'knowledge'], imagery: 'natural geometric harmony and balanced symmetry' },
];

const NEGATIVE = [
  'no visible text',
  'no letters',
  'no words',
  'no numbers',
  'no logos',
  'no signatures',
  'no watermarks',
  'no glyphs',
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
  'no default generic lotus pond composition',
  'no random mountain lake wallpaper',
  'no decorative spiritual stock art look',
  'no people posing for camera',
  'no crowded scene',
].join(', ');

function legacyKeywords(entry: PromptInputEntry): string[] {
  const text = `${entry.topic} ${entry.weekly_theme ?? ''} ${entry.quote}`.toLowerCase();
  const matches = SYMBOL_MAP.filter((item) => item.words.some((word) => text.includes(word))).map((item) => item.imagery);
  return matches.length > 0 ? matches : [`a contemplative visual metaphor for ${entry.topic.toLowerCase()}`];
}

export function buildSpiritualImagePrompt(
  entry: PromptInputEntry,
  options: {
    dateKey: string;
    allowOmSymbol: boolean;
    /** LLM-interpreted visual scene description — replaces static keyword lookup */
    interpretedVisual?: QuoteVisualInterpretation;
  },
): { prompt: string; negativePrompt: string; styleName: string } {
  const [monthRaw, dayRaw] = options.dateKey.split('-');
  const style = STYLE_PALETTES[((Number(monthRaw) || 1) * 31 + (Number(dayRaw) || 1)) % STYLE_PALETTES.length];

  const hasLlmVisual = Boolean(options.interpretedVisual?.scene && options.interpretedVisual.scene.length > 20);

  const mustInclude = hasLlmVisual
    ? options.interpretedVisual?.mustInclude?.filter(Boolean).join('; ')
    : legacyKeywords(entry).join('; ');

  const avoidList = hasLlmVisual
    ? options.interpretedVisual?.avoid?.filter(Boolean).join('; ')
    : 'generic interchangeable spiritual scenery unrelated to the quote';

  const sceneConcept = hasLlmVisual
    ? options.interpretedVisual?.scene
    : `A contemplative visual metaphor for ${entry.topic.toLowerCase()}.`;

  const prompt = [
    'Create reverent spiritual artwork inspired by Self-Realization Fellowship teachings, but prioritize the quote’s specific meaning over generic devotional wallpaper aesthetics.',
    `Theme: ${entry.weekly_theme ?? entry.topic}. Topic focus: ${entry.topic}.`,
    `This image must visually express the specific meaning of this quote: "${entry.quote}"`,
    `Atmospheric treatment only: ${style.name} (${style.visual}). Do not let the style override the quote-specific scene concept.`,
    `Primary scene concept: ${sceneConcept}`,
    `Required visual anchors that must appear in the scene: ${mustInclude}.`,
    `Avoid these generic fallback motifs unless the quote truly requires them: ${avoidList}.`,
    options.interpretedVisual?.rationale ? `Interpretive rationale: ${options.interpretedVisual.rationale}` : '',
    entry.special_day ? `Honor context: ${entry.special_day}.` : '',
    'Visual tone: sacred, calm, luminous, contemplative, non-commercial, painterly realism or refined devotional illustration. Quote-specific action, conflict, symbolism, and objects should dominate over generic yoga/spiritual decoration.',
    'Composition: balanced and elegant, but concrete and legible. Use meaningful symbolic action or transformation when the quote implies effort, struggle, breakthrough, surrender, growth, or realization. No textual elements.',
    options.allowOmSymbol
      ? 'Do not include Om by default. Only include one very subtle Om (ॐ) if it is genuinely justified by the quote-specific scene or special-day context; if used, only one and not dominant.'
      : 'Do not include Om or any symbol.',
  ]
    .filter(Boolean)
    .join(' ');

  const negativePrompt = options.allowOmSymbol
    ? `${NEGATIVE}, except at most one subtle Om symbol (ॐ) only when scene-justified`
    : NEGATIVE;

  return {
    prompt,
    negativePrompt,
    styleName: style.name,
  };
}
