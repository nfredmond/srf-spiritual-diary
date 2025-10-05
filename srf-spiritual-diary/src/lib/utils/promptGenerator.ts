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
  const fullContext = `${keywords} ${topic.toLowerCase()} ${(weeklyTheme || '').toLowerCase()} ${(specialDay || '').toLowerCase()}`;
  
  // Check if the quote/context mentions the SRF lineage of Gurus
  const guruReferences = detectGuruReferences(fullContext);
  
  // Start with the primary theme
  let themes = `A spiritual visual representation of "${weeklyTheme || topic}"`;
  
  // Add special day context
  if (specialDay) {
    themes += `, honoring ${specialDay}`;
  }
  
  // Add guru imagery if appropriate
  if (guruReferences.length > 0) {
    themes += `. Include reverent, sacred imagery of ${guruReferences.join(' and ')}`;
    themes += `, depicted in traditional spiritual portraiture with divine light and peaceful countenance`;
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
  if (keywords.includes('guru') || keywords.includes('master') || keywords.includes('teacher')) {
    symbols.push('spiritual master radiating divine wisdom and compassion');
  }
  if (keywords.includes('disciple') || keywords.includes('devotee') || keywords.includes('chela')) {
    symbols.push('devoted seeker in humble reverence');
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

/**
 * Detect references to the SRF lineage of Gurus in the text
 */
function detectGuruReferences(text: string): string[] {
  const gurus: string[] = [];
  
  // Paramahansa Yogananda
  if (text.includes('yogananda') || text.includes('paramahansa') || 
      text.includes('paramhansa') || text.includes('master')) {
    gurus.push('Paramahansa Yogananda');
  }
  
  // Swami Sri Yukteswar
  if (text.includes('yukteswar') || text.includes('sri yukteswar') || 
      text.includes('swami sri yukteswar')) {
    gurus.push('Swami Sri Yukteswar');
  }
  
  // Lahiri Mahasaya
  if (text.includes('lahiri') || text.includes('mahasaya') || 
      text.includes('lahiri mahasaya')) {
    gurus.push('Lahiri Mahasaya');
  }
  
  // Mahavatar Babaji
  if (text.includes('babaji') || text.includes('mahavatar')) {
    gurus.push('Mahavatar Babaji');
  }
  
  // Jesus Christ (also part of SRF lineage)
  if (text.includes('jesus') || text.includes('christ')) {
    gurus.push('Jesus Christ');
  }
  
  // Krishna (another revered master in the tradition)
  if (text.includes('krishna') || text.includes('lord krishna')) {
    gurus.push('Lord Krishna');
  }
  
  return gurus;
}
