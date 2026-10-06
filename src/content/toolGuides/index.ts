import { curatedDataGuides } from './curatedData';
import { curatedTextGuides } from './curatedText';
import { curatedCryptoGuides } from './curatedCrypto';
import { curatedWebGuides } from './curatedWeb';
import { curatedTimeUnitsGuides } from './curatedTimeUnits';
import { converterGuides } from './converter';
import { textGuides } from './text';
import { cryptoGuides } from './crypto';
import { webGuides } from './web';
import { developmentGuides } from './development';
import { mathGuides } from './math';
import { generatorGuides } from './generator';
import { funGuides } from './fun';
import type { LocalizedToolGuide, ToolGuideKey } from './types';

// Exhaustive coverage follows the curated registry.
export const toolGuides = {
  ...converterGuides,
  ...textGuides,
  ...cryptoGuides,
  ...webGuides,
  ...developmentGuides,
  ...mathGuides,
  ...generatorGuides,
  ...funGuides,
  ...curatedDataGuides,
  ...curatedTextGuides,
  ...curatedCryptoGuides,
  ...curatedWebGuides,
  ...curatedTimeUnitsGuides,
} satisfies Record<ToolGuideKey, LocalizedToolGuide>;
