import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const webGuides = {} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
