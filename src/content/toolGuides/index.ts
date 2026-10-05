import { converterGuides } from './converter';
import { textGuides } from './text';
import { cryptoGuides } from './crypto';
import { webGuides } from './web';
import { developmentGuides } from './development';
import { mathGuides } from './math';
import { generatorGuides } from './generator';
import { funGuides } from './fun';
import type { LocalizedToolGuide, ToolGuideKey } from './types';

// Exhaustive coverage is checked against the tool-name message keys at compile time.
export const toolGuides = {
  ...converterGuides,
  ...textGuides,
  ...cryptoGuides,
  ...webGuides,
  ...developmentGuides,
  ...mathGuides,
  ...generatorGuides,
  ...funGuides,
} satisfies Record<ToolGuideKey, LocalizedToolGuide>;
