import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, string> = {};

  try {
    checks.step1_handler = 'ok';

    const { buildSpiritualImagePrompt } = await import('./_lib/promptEngine');
    checks.step2_promptEngine = typeof buildSpiritualImagePrompt;

    const { interpretQuoteVisually } = await import('./_lib/quoteInterpreter');
    checks.step3_quoteInterpreter = typeof interpretQuoteVisually;

    checks.step4_geminiKey = process.env.GEMINI_API_KEY ? 'set' : 'missing';
    checks.step5_body = JSON.stringify(req.body || {}).slice(0, 200);

    return res.status(200).json({ ok: true, checks });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      checks,
      error: error?.message || String(error),
      stack: error?.stack?.split('\n').slice(0, 5),
    });
  }
}
