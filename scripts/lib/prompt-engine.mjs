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

const SYMBOLS = [
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
].join(', ');

function styleIndex(dateKey) {
  const [monthRaw, dayRaw] = dateKey.split('-');
  const month = Number(monthRaw) || 1;
  const day = Number(dayRaw) || 1;
  return (month * 31 + day) % STYLE_PALETTES.length;
}

function extractKeywords(entry) {
  const text = `${entry.topic} ${entry.weekly_theme || entry.weeklyTheme || ''} ${entry.quote}`.toLowerCase();
  const results = new Set();
  for (const symbol of SYMBOLS) {
    if (symbol.words.some((w) => text.includes(w))) {
      results.add(symbol.imagery);
    }
  }
  if (results.size === 0) {
    results.add(`a contemplative visual metaphor for ${String(entry.topic || 'devotion').toLowerCase()}`);
  }
  return [...results];
}

export function buildSpiritualImagePrompt(entry, options = {}) {
  const dateKey = options.dateKey || `${String(entry.month).padStart(2, '0')}-${String(entry.day).padStart(2, '0')}`;
  const style = STYLE_PALETTES[styleIndex(dateKey)];
  const keywords = extractKeywords(entry);
  const allowOm = options.allowOmSymbol !== false;

  const prompt = [
    'Create reverent spiritual artwork inspired by Self-Realization Fellowship teachings and contemplative devotion.',
    `Theme: ${entry.weekly_theme || entry.weeklyTheme || entry.topic}. Topic focus: ${entry.topic}.`,
    `Quote essence: ${entry.quote}`,
    `Style palette: ${style.name} (${style.visual}).`,
    `Key visual cues: ${keywords.join('; ')}.`,
    entry.special_day || entry.specialDay ? `Honor context: ${entry.special_day || entry.specialDay}.` : '',
    'Composition: cinematic, meditative, balanced, high-detail, no people posing for camera, no textual elements.',
    allowOm
      ? 'Optionally include one very subtle Om (ॐ) symbol blended into natural texture; if used, only one and not dominant.'
      : 'Do not include Om or any symbol.',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    prompt,
    negativePrompt: allowOm ? `${NEGATIVE}, except at most one subtle Om symbol (ॐ)` : NEGATIVE,
    styleName: style.name,
    keywords,
  };
}
