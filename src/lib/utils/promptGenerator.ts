import type { DiaryEntry } from '../../types/DiaryEntry';
import { buildSpiritualImagePrompt } from '../promptEngine';

export function generateImagePrompt(entry: DiaryEntry): string {
  const allowOmSymbol = import.meta.env.VITE_SRF_ALLOW_OM_SYMBOL !== 'false';
  const result = buildSpiritualImagePrompt(entry, { allowOmSymbol });
  return `${result.prompt}\n\nNegative prompt: ${result.negativePrompt}`;
}
