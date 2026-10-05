import type { Locale } from '@/i18n';
import type { MessageKey } from '@/i18n/en';

type ToolNameKey = Extract<MessageKey, `tools.${string}.name`>;
export type ToolGuideKey = ToolNameKey extends `tools.${infer Key}.name` ? Key : never;

export type ToolGuide = {
  summary: string;
  steps: readonly [string, string, ...string[]];
  example: { input: string; output: string };
  notes: readonly [string, ...string[]];
};

export type LocalizedToolGuide = Record<Locale, ToolGuide>;
