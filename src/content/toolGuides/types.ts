import type { Locale } from '@/i18n';
import type { TOOLS } from '@/tools/registry';

export type ToolGuideKey = (typeof TOOLS)[number]['key'];

export type ToolGuide = {
  summary: string;
  steps: readonly [string, string, ...string[]];
  example: { input: string; output: string };
  notes: readonly [string, ...string[]];
};

export type LocalizedToolGuide = Record<Locale, ToolGuide>;
