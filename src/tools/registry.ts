import type { ComponentType } from 'react';

export type ToolCategory = 'converter' | 'crypto' | 'web' | 'text' | 'generator';

export interface ToolMeta {
  /** URL segment and prerender filename — must match the folder name. */
  id: string;
  icon: string;
  category: ToolCategory;
  /** i18n key stem: tools.<key>.name / .description */
  key: string;
  Component: ComponentType;
}

// The single source of truth: home grid, routes and search all derive from this.
// Adding a tool = one folder under src/tools + one entry here.
import JsonFormat from './json-format';
import BaseConverter from './base-converter';
import Base64 from './base64';
import ColorConverter from './color-converter';
import Timestamp from './timestamp';
import HashText from './hash-text';
import UrlEncode from './url-encode';
import CaseConverter from './case-converter';
import RegexTester from './regex-tester';
import TextDiff from './text-diff';
import QrCode from './qrcode';
import Uuid from './uuid';

export const TOOLS: ToolMeta[] = [
  {
    id: 'json-format',
    icon: 'lucide:braces',
    category: 'converter',
    key: 'jsonFormat',
    Component: JsonFormat,
  },
  {
    id: 'base-converter',
    icon: 'lucide:arrow-left-right',
    category: 'converter',
    key: 'baseConverter',
    Component: BaseConverter,
  },
  { id: 'base64', icon: 'lucide:binary', category: 'converter', key: 'base64', Component: Base64 },
  {
    id: 'color-converter',
    icon: 'lucide:palette',
    category: 'converter',
    key: 'colorConverter',
    Component: ColorConverter,
  },
  {
    id: 'timestamp',
    icon: 'lucide:clock',
    category: 'converter',
    key: 'timestamp',
    Component: Timestamp,
  },
  {
    id: 'hash-text',
    icon: 'lucide:hash',
    category: 'crypto',
    key: 'hashText',
    Component: HashText,
  },
  {
    id: 'url-encode',
    icon: 'lucide:link',
    category: 'web',
    key: 'urlEncode',
    Component: UrlEncode,
  },
  {
    id: 'case-converter',
    icon: 'lucide:case-sensitive',
    category: 'text',
    key: 'caseConverter',
    Component: CaseConverter,
  },
  {
    id: 'regex-tester',
    icon: 'lucide:regex',
    category: 'text',
    key: 'regexTester',
    Component: RegexTester,
  },
  {
    id: 'text-diff',
    icon: 'lucide:git-compare',
    category: 'text',
    key: 'textDiff',
    Component: TextDiff,
  },
  { id: 'qrcode', icon: 'lucide:qr-code', category: 'generator', key: 'qrcode', Component: QrCode },
  { id: 'uuid', icon: 'lucide:fingerprint', category: 'generator', key: 'uuid', Component: Uuid },
];

export const CATEGORY_ORDER: ToolCategory[] = ['converter', 'crypto', 'web', 'text', 'generator'];
