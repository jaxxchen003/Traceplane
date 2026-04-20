import { vi } from 'vitest';

global.fetch = vi.fn();

vi.setConfig({ testTimeout: 30000 });
