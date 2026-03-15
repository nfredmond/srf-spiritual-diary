export interface PromptInputEntry {
  month: number;
  day: number;
  topic: string;
  weekly_theme?: string | null;
  quote: string;
  special_day?: string | null;
}

const STYLE_PALETTES = [
  { name: 'lotus dawn', visual: 'misty lotus pond at sunrise, rose-gold atmosphere, devotional serenity, soft rays over still water' },
  { name: 'himalayan light', visual: 'high Himalayan ridges, crystal air, dawn-blue sky, subtle snow glow, contemplative silence' },
  { name: 'cosmic stillness', visual: 'deep midnight blue cosmos, tranquil aurora veil, luminous sacred geometry in natural forms' },
  { name: 'desert of inner silence', visual: 'vast golden desert at twilight, long meditative shadows, still horizon, calm sacred minimalism' },
];

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

export function buildSpiritualImagePrompt(
  entry: PromptInputEntry,
  options: { dateKey: string; allowOmSymbol: boolean },
): { prompt: string; negativePrompt: string; styleName: string } {
  const [monthRaw, dayRaw] = options.dateKey.split('-');
  const style = STYLE_PALETTES[((Number(monthRaw) || 1) * 31 + (Number(dayRaw) || 1)) % STYLE_PALETTES.length];
  const text = `${entry.topic} ${entry.weekly_theme ?? ''} ${entry.quote}`.toLowerCase();
  const keywords = SYMBOL_MAP.filter((item) => item.words.some((word) => text.includes(word))).map((item) => item.imagery);

  const prompt = [
    'Create reverent spiritual artwork inspired by Self-Realization Fellowship teachings, quiet devotion, humility, stillness, and inward communion with the Divine.',
    `Theme: ${entry.weekly_theme ?? entry.topic}. Topic focus: ${entry.topic}.`,
    `Quote essence: ${entry.quote}`,
    `Style palette: ${style.name} (${style.visual}).`,
    `Key visual cues: ${(keywords.length > 0 ? keywords : [`a contemplative visual metaphor for ${entry.topic.toLowerCase()}`]).join('; ')}.`,
    entry.special_day ? `Honor context: ${entry.special_day}.` : '',
    'Visual tone: calm, welcoming, sacred, contemplative, non-commercial, warm earth tones with soft gold, cream, rose dawn, mountain light, temple garden stillness, lotus symbolism, ocean or sky serenity when fitting.',
    'Composition: balanced, elegant, spacious, natural light, painterly realism or refined devotional illustration, no people posing for camera, no dramatic spectacle, no textual elements.',
    options.allowOmSymbol
      ? 'Optionally include one very subtle Om (ॐ) symbol blended into natural texture; if used, only one and not dominant.'
      : 'Do not include Om or any symbol.',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    prompt,
    negativePrompt: options.allowOmSymbol ? `${NEGATIVE}, except at most one subtle Om symbol (ॐ)` : NEGATIVE,
    styleName: style.name,
  };
}
