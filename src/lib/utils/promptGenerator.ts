import type { DiaryEntry } from '../../types/DiaryEntry';

export function generateImagePrompt(entry: DiaryEntry): string {
  // CRITICAL: Explicitly prevent text in images
  const noTextInstruction = `
    CRITICAL INSTRUCTION: Create ONLY visual imagery. 
    DO NOT include any text, words, letters, or writing in the image.
    NO text overlays, NO captions, NO typography.
    This is pure visual art representing the spiritual concept.
  `;

  const styleGuide = `
    Style: Spiritual and serene digital art inspired by traditional Indian spiritual paintings.
    Features: soft divine light, golden accents, lotus flowers, peaceful atmosphere,
    ethereal quality, warm color palette with deep blues and sacred golds,
    celestial imagery, sacred geometry, meditation imagery.
    
    Quality: Photorealistic with a dreamy, transcendent mood.
    Composition: Balanced, harmonious, suitable for contemplation.
  `;

  // Extract visual themes from the quote and weekly theme
  const visualConcepts = extractVisualThemes(
    entry.quote, 
    entry.topic, 
    entry.weeklyTheme,
    entry.specialDay
  );
  
  return `${noTextInstruction}\n\n${visualConcepts}\n\n${styleGuide}`;
}

function extractVisualThemes(
  quote: string, 
  topic: string, 
  weeklyTheme?: string,
  specialDay?: string
): string {
  const keywords = quote.toLowerCase();
  
  // Start with the primary theme
  let themes = `A spiritual visual representation of "${weeklyTheme || topic}"`;
  
  // Add special day context
  if (specialDay) {
    themes += `, honoring ${specialDay}`;
  }
  
  // Extract symbolic imagery based on keywords
  const symbols: string[] = [];
  
  if (keywords.includes('light') || keywords.includes('illumin') || keywords.includes('radiant')) {
    symbols.push('divine radiant golden light emanating from the center');
  }
  if (keywords.includes('peace') || keywords.includes('calm') || keywords.includes('serene')) {
    symbols.push('peaceful still water reflecting the sky');
  }
  if (keywords.includes('meditation') || keywords.includes('yoga')) {
    symbols.push('sacred meditation space with soft candlelight');
  }
  if (keywords.includes('love') || keywords.includes('devotion') || keywords.includes('heart')) {
    symbols.push('warm golden energy radiating love');
  }
  if (keywords.includes('god') || keywords.includes('divine') || keywords.includes('infinite')) {
    symbols.push('celestial cosmic presence');
  }
  if (keywords.includes('nature') || keywords.includes('flower') || keywords.includes('garden')) {
    symbols.push('blooming lotus flowers and sacred garden');
  }
  if (keywords.includes('wisdom') || keywords.includes('knowledge') || keywords.includes('truth')) {
    symbols.push('ancient spiritual symbols and sacred geometry');
  }
  if (keywords.includes('new') || keywords.includes('beginning') || keywords.includes('start')) {
    symbols.push('dawn breaking over sacred landscape');
  }
  if (keywords.includes('freedom') || keywords.includes('liberation')) {
    symbols.push('bird soaring into infinite sky, breaking chains of light');
  }
  if (keywords.includes('soul') || keywords.includes('spirit')) {
    symbols.push('ethereal spiritual energy ascending upward');
  }
  if (keywords.includes('joy') || keywords.includes('bliss') || keywords.includes('happiness')) {
    symbols.push('luminous celebration of spiritual ecstasy');
  }
  
  // Combine the themes with symbolic elements
  if (symbols.length > 0) {
    themes += `. Visual elements: ${symbols.join(', ')}`;
  } else {
    // Fallback to topic-based imagery
    themes += `. Symbolic imagery representing the essence of ${topic.toLowerCase()} through sacred art`;
  }
  
  return themes;
}

