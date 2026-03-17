/**
 * Uses Gemini text model to interpret a spiritual quote into a
 * bespoke visual scene description for image generation.
 */

function getGeminiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || null;
}

const SYSTEM_CONTEXT = `You are a visual art director creating scene descriptions for sacred meditation artwork in the Self-Realization Fellowship tradition. Given a spiritual quote, its topic, and optional weekly theme, describe a specific, vivid visual scene that captures the unique meaning of THIS particular quote — not generic spiritual imagery.

Rules:
- Describe a concrete natural or sacred scene (landscapes, water, sky, flora, light phenomena, sacred architecture, seasonal elements)
- Include specific colors, lighting quality, composition, and atmosphere
- The scene MUST reflect the particular meaning and metaphors in the quote, not just "spiritual vibes"
- 2-3 sentences maximum
- Never include text, words, letters, or legible writing in your description
- Never describe people posing or looking at the viewer
- Tone: reverent, serene, contemplative, warm
- Draw visual metaphors directly from the quote's imagery and meaning`;

export async function interpretQuoteVisually(
  quote: string,
  topic: string,
  weeklyTheme?: string | null,
  specialDay?: string | null,
): Promise<string> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    console.warn('No Gemini API key for quote interpretation, using topic fallback');
    return `a contemplative visual metaphor for ${topic.toLowerCase()}`;
  }

  const textModel = process.env.SRF_TEXT_MODEL || 'gemini-2.5-flash';

  const userPrompt = [
    `Quote: "${quote}"`,
    `Topic: ${topic}`,
    weeklyTheme ? `Weekly Theme: ${weeklyTheme}` : '',
    specialDay ? `Special Context: ${specialDay}` : '',
    '',
    'Describe a specific visual scene that captures the unique spiritual meaning of this quote:',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${textModel}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_CONTEXT}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 250,
            temperature: 0.9,
          },
        }),
      },
    );

    const payload = await response.json();

    if (!response.ok) {
      console.warn('Gemini text interpretation failed:', payload?.error?.message);
      return `a contemplative visual metaphor for ${topic.toLowerCase()}`;
    }

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || text.trim().length < 20) {
      console.warn('Gemini text interpretation returned empty/short result');
      return `a contemplative visual metaphor for ${topic.toLowerCase()}`;
    }

    return text.trim();
  } catch (error) {
    console.warn('Quote interpretation error, using fallback:', error);
    return `a contemplative visual metaphor for ${topic.toLowerCase()}`;
  }
}
