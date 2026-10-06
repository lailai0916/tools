import { dump as dumpYaml } from 'js-yaml';

import type { UtilityDefinition, UtilityValues } from '@/components/UtilityWorkbench';

import { UtilityInputError } from '@/utils/UtilityInputError';

function required(values: UtilityValues, key: string): string {
  const value = values[key]?.trim();
  if (!value) throw new UtilityInputError('required');
  return value;
}

function shellTokens(input: string): string[] {
  const tokens: string[] = [];
  let token = '';
  let quote = '';
  let started = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '\\' && quote !== "'") {
      const next = input[index + 1];
      if (next === undefined) throw new UtilityInputError('shellQuote');
      if (next === '\n' || (next === '\r' && input[index + 2] === '\n')) {
        index += next === '\r' ? 2 : 1;
        continue;
      }
      started = true;
      if (quote === '"' && !['$', '`', '"', '\\'].includes(next)) token += character;
      else {
        token += next;
        index += 1;
      }
    } else if (quote) {
      if (character === quote) quote = '';
      else token += character;
    } else if (character === '"' || character === "'") {
      quote = character;
      started = true;
    } else if (/\s/.test(character)) {
      if (started) tokens.push(token);
      token = '';
      started = false;
    } else {
      token += character;
      started = true;
    }
  }
  if (quote) throw new UtilityInputError('shellQuote');
  if (started) tokens.push(token);
  return tokens;
}

function dockerOptionValue(value: string | undefined): string {
  if (!value?.trim() || value.startsWith('-')) throw new UtilityInputError('dockerValue');
  return value;
}

function escapeComposeValue(value: unknown): unknown {
  if (typeof value === 'string') return value.replaceAll('$', () => '$$');
  if (Array.isArray(value)) return value.map(escapeComposeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, escapeComposeValue(child)])
    );
  }
  return value;
}

export function dockerRunToCompose(input: string): string {
  const tokens = shellTokens(input);
  if (tokens[0] === 'docker') tokens.shift();
  if (tokens[0] === 'run') tokens.shift();
  const service: Record<string, unknown> = {};
  const ports: string[] = [];
  const environment: string[] = [];
  const volumes: string[] = [];
  const command: string[] = [];
  let image = '';

  const take = (index: number) => dockerOptionValue(tokens[index + 1]);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (image) {
      command.push(...tokens.slice(index));
      break;
    }
    if (token === '-d' || token === '--detach' || token === '--rm') continue;
    if (token === '-p' || token === '--publish') {
      ports.push(take(index));
      index += 1;
      continue;
    }
    if (token.startsWith('--publish=')) {
      ports.push(dockerOptionValue(token.slice(10)));
      continue;
    }
    if (token === '-e' || token === '--env') {
      environment.push(take(index));
      index += 1;
      continue;
    }
    if (token.startsWith('--env=')) {
      environment.push(dockerOptionValue(token.slice(6)));
      continue;
    }
    if (token === '-v' || token === '--volume') {
      volumes.push(take(index));
      index += 1;
      continue;
    }
    if (token.startsWith('--volume=')) {
      volumes.push(dockerOptionValue(token.slice(9)));
      continue;
    }
    if (token === '--name') {
      service.container_name = take(index);
      index += 1;
      continue;
    }
    if (token.startsWith('--name=')) {
      service.container_name = dockerOptionValue(token.slice(7));
      continue;
    }
    if (token === '--restart') {
      service.restart = take(index);
      index += 1;
      continue;
    }
    if (token.startsWith('--restart=')) {
      service.restart = dockerOptionValue(token.slice(10));
      continue;
    }
    if (token.startsWith('-') && !image) throw new UtilityInputError('dockerOption');
    if (!image) image = token;
    else command.push(token);
  }
  if (!image) throw new UtilityInputError('dockerImage');
  service.image = image;
  if (ports.length) service.ports = ports;
  if (environment.length) service.environment = environment;
  if (volumes.length) service.volumes = volumes;
  if (command.length) service.command = command;
  const name = String(
    service.container_name ?? image.split('/').pop()?.split(':')[0] ?? 'app'
  ).replace(/[^a-zA-Z0-9_-]/g, '-');
  return dumpYaml(
    { services: { [name]: escapeComposeValue(service) } },
    { noRefs: true, lineWidth: 100 }
  );
}

const gitignoreTemplates: Record<string, string[]> = {
  node: ['node_modules/', 'dist/', 'coverage/', '.env', '.env.*', '!.env.example', '*.log'],
  python: [
    '__pycache__/',
    '*.py[cod]',
    '.venv/',
    'venv/',
    '.pytest_cache/',
    '.mypy_cache/',
    'dist/',
    '*.egg-info/',
  ],
  go: ['bin/', '*.test', '*.out', 'vendor/'],
  rust: ['target/', '**/*.rs.bk'],
  macos: ['.DS_Store', '.AppleDouble', '.LSOverride'],
  vscode: ['.vscode/*', '!.vscode/extensions.json', '!.vscode/settings.json'],
  jetbrains: ['.idea/', '*.iml'],
};

export function buildGitignore(values: UtilityValues): string {
  const stacks = required(values, 'stacks')
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter(Boolean);
  const sections: string[] = [];
  for (const stack of stacks) {
    if (!Object.hasOwn(gitignoreTemplates, stack)) throw new UtilityInputError('template');
    const entries = gitignoreTemplates[stack];
    sections.push(`# ${stack}\n${entries.join('\n')}`);
  }
  if (values.extra.trim()) sections.push(`# custom\n${values.extra}`);
  return sections.join('\n\n') + '\n';
}

export const utilityDefinitions: Record<string, UtilityDefinition> = {
  dockerRunToCompose: {
    stem: 'dockerRunToCompose',
    fields: [{ key: 'input', type: 'textarea' }],
    compute: ({ input }) => dockerRunToCompose(input),
  },
  gitignoreGenerator: {
    stem: 'gitignoreGenerator',
    fields: [
      { key: 'stacks', type: 'text', defaultValue: 'node, macos, vscode' },
      { key: 'extra', type: 'textarea' },
    ],
    compute: buildGitignore,
  },
};
