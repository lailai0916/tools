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

export const TOOLS: ToolMeta[] = [
  {
    id: 'json-format',
    icon: 'lucide:braces',
    category: 'converter',
    key: 'jsonFormat',
    Component: JsonFormat,
  },
];

export const CATEGORY_ORDER: ToolCategory[] = ['converter', 'crypto', 'web', 'text', 'generator'];
