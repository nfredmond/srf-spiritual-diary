/**
 * Uses Gemini text model to interpret a spiritual quote into a
 * bespoke visual scene description for image generation.
 */

function getGeminiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || null;
}

export interface QuoteVisualInterpretation {
  scene: string;
  mustInclude: string[];
  avoid: string[];
  rationale?: string;
}

const FALLBACK_AVOID = [
  'generic lotus pond composition',
  'default mountain lake scene unrelated to the quote',
  'random Om symbol with no quote-specific purpose',
  'decorative spiritual wallpaper aesthetic',
];

const SYSTEM_CONTEXT = `You are a visual art director creating scene briefs for sacred artwork in the Self-Realization Fellowship tradition.

Your job is to interpret the SPECIFIC meaning of the quote into a visually concrete scene, not generic spiritual wallpaper.

Return STRICT JSON only in this shape:
{
  "scene": "2-4 sentence visual brief describing one specific scene",
  "mustInclude": ["3 to 5 concrete visual anchors that must appear"],
  "avoid": ["3 to 5 generic motifs to avoid unless directly required by the quote"],
  "rationale": "1 sentence explaining why this scene fits the quote"
}

Rules:
- The scene must reflect the quote's actual meaning, conflict, metaphor, and action.
- Prefer visual metaphors of effort, transformation, inner power, moral struggle, clarity, surrender, joy, etc. when appropriate.
- Do NOT default to lotus flowers, mountain lakes, glowing temples, generic trees, or Om symbols unless the quote itself strongly suggests them.
- Include specific composition, lighting, atmosphere, and symbolic objects/actions.
- Human figures are allowed only if they are symbolic participants in the scene, not posing portraits.
- Never include text, letters, words, captions, or legible writing in the image.
- Keep the tone reverent, luminous, and contemplative, but let quote-specific content dominate over house-style spirituality.
- Output valid JSON only.`;

function fallbackInterpretation(topic: string): QuoteVisualInterpretation {
  return {
    scene: `A contemplative visual metaphor for ${topic.toLowerCase()}, rendered as a specific sacred landscape with clear symbolic focus rather than generic spiritual decoration.`,
    mustInclude: [
      `one clear symbolic focal element tied to ${topic.toLowerCase()}`,
      'specific light source and atmosphere',
      'one visible metaphor of transformation or realization',
    ],
    avoid: FALLBACK_AVOID,
    rationale: `The scene should stay centered on ${topic.toLowerCase()} rather than defaulting to interchangeable spiritual imagery.`,
  };
}

function extractJsonObject(text: string): QuoteVisualInterpretation | null {
  const trimmed = text.trim();

  const candidates = [trimmed];
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Partial<QuoteVisualInterpretation>;
      if (typeof parsed.scene !== 'string' || parsed.scene.trim().length < 20) continue;

      return {
        scene: parsed.scene.trim(),
        mustInclude: Array.isArray(parsed.mustInclude)
          ? parsed.mustInclude.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 5)
          : [],
        avoid: Array.isArray(parsed.avoid)
          ? parsed.avoid.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 5)
          : FALLBACK_AVOID,
        rationale: typeof parsed.rationale === 'string' ? parsed.rationale.trim() : undefined,
      };
    } catch {
      // keep trying
    }
  }

  return null;
}

export async function interpretQuoteVisually(
  quote: string,
  topic: string,
  weeklyTheme?: string | null,
  specialDay?: string | null,
): Promise<QuoteVisualInterpretation> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    console.warn('No Gemini API key for quote interpretation, using topic fallback');
    return fallbackInterpretation(topic);
  }

  const textModel = process.env.SRF_TEXT_MODEL || 'gemini-2.5-flash';

  const userPrompt = [
    `Quote: "${quote}"`,
    `Topic: ${topic}`,
    weeklyTheme ? `Weekly Theme: ${weeklyTheme}` : '',
    specialDay ? `Special Context: ${specialDay}` : '',
    '',
    'Create a quote-specific scene brief. Emphasize the quote’s actual action, tension, and visual metaphor. Avoid default SRF-style filler unless clearly justified.',
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
            maxOutputTokens: 500,
            temperature: 0.85,
            responseMimeType: 'application/json',
          },
        }),
      },
    );

    const payload = await response.json();

    if (!response.ok) {
      console.warn('Gemini text interpretation failed:', payload?.error?.message);
      return fallbackInterpretation(topic);
    }

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || text.trim().length < 20) {
      console.warn('Gemini text interpretation returned empty/short result');
      return fallbackInterpretation(topic);
    }

    const parsed = extractJsonObject(text);
    if (!parsed) {
      console.warn('Gemini text interpretation was not valid JSON; using fallback text wrapper');
      return {
        scene: text.trim(),
        mustInclude: [`a concrete visual metaphor for ${topic.toLowerCase()}`],
        avoid: FALLBACK_AVOID,
        rationale: 'Raw model output used because structured parsing failed.',
      };
    }

    if (parsed.mustInclude.length === 0) {
      parsed.mustInclude = [`a concrete visual metaphor for ${topic.toLowerCase()}`];
    }
    if (parsed.avoid.length === 0) {
      parsed.avoid = FALLBACK_AVOID;
    }

    return parsed;
  } catch (error) {
    console.warn('Quote interpretation error, using fallback:', error);
    return fallbackInterpretation(topic);
  }
}
