import '@testing-library/jest-dom/vitest';

import { beforeEach, vi } from 'vitest';
import { resetDiaryCache } from '../lib/diaryData';
beforeEach(()=>resetDiaryCache());
vi.mock('virtual:pwa-register/react',()=>({useRegisterSW:()=>({needRefresh:[false],updateServiceWorker:vi.fn()})}));
