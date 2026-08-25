export type ToolCategory =
  'converter' | 'text' | 'crypto' | 'web' | 'development' | 'math' | 'generator' | 'fun';

export interface ToolMeta {
  /** URL segment and prerender filename — must match the folder name. */
  id: string;
  icon: string;
  category: ToolCategory;
  /** i18n key stem: tools.<key>.name / .description */
  key: string;
}

// The single source of truth: home grid, routes and search all derive from this.
// Adding a tool = one folder under src/tools + one entry here.

// converter

// text

// crypto

// web

// development

// math

// generator

// fun & tests

export const TOOLS: ToolMeta[] = [
  // converter
  {
    id: 'json-format',
    icon: 'lucide:braces',
    category: 'converter',
    key: 'jsonFormat',
  },
  {
    id: 'base-converter',
    icon: 'lucide:arrow-left-right',
    category: 'converter',
    key: 'baseConverter',
  },
  { id: 'base64', icon: 'lucide:binary', category: 'converter', key: 'base64' },
  {
    id: 'base32',
    icon: 'lucide:file-digit',
    category: 'converter',
    key: 'base32',
  },
  {
    id: 'color-converter',
    icon: 'lucide:palette',
    category: 'converter',
    key: 'colorConverter',
  },
  {
    id: 'timestamp',
    icon: 'lucide:clock',
    category: 'converter',
    key: 'timestamp',
  },
  {
    id: 'json-to-yaml',
    icon: 'lucide:file-json',
    category: 'converter',
    key: 'jsonToYaml',
  },
  {
    id: 'json-to-csv',
    icon: 'lucide:table',
    category: 'converter',
    key: 'jsonToCsv',
  },
  {
    id: 'html-entities',
    icon: 'lucide:code-xml',
    category: 'converter',
    key: 'htmlEntities',
  },
  {
    id: 'roman-numeral',
    icon: 'lucide:landmark',
    category: 'converter',
    key: 'romanNumeral',
  },
  {
    id: 'text-to-binary',
    icon: 'lucide:binary',
    category: 'converter',
    key: 'textToBinary',
  },
  {
    id: 'temperature-converter',
    icon: 'lucide:thermometer',
    category: 'converter',
    key: 'temperatureConverter',
  },
  {
    id: 'data-size-converter',
    icon: 'lucide:hard-drive',
    category: 'converter',
    key: 'dataSizeConverter',
  },
  {
    id: 'unix-permission',
    icon: 'lucide:shield',
    category: 'converter',
    key: 'unixPermission',
  },
  {
    id: 'duration-converter',
    icon: 'lucide:hourglass',
    category: 'converter',
    key: 'durationConverter',
  },
  {
    id: 'angle-converter',
    icon: 'lucide:triangle',
    category: 'converter',
    key: 'angleConverter',
  },

  // text
  {
    id: 'case-converter',
    icon: 'lucide:case-sensitive',
    category: 'text',
    key: 'caseConverter',
  },
  {
    id: 'regex-tester',
    icon: 'lucide:regex',
    category: 'text',
    key: 'regexTester',
  },
  {
    id: 'text-diff',
    icon: 'lucide:git-compare',
    category: 'text',
    key: 'textDiff',
  },
  {
    id: 'text-stats',
    icon: 'lucide:file-text',
    category: 'text',
    key: 'textStats',
  },
  {
    id: 'sort-lines',
    icon: 'lucide:arrow-down-up',
    category: 'text',
    key: 'sortLines',
  },
  {
    id: 'find-replace',
    icon: 'lucide:replace',
    category: 'text',
    key: 'findReplace',
  },
  { id: 'slugify', icon: 'lucide:link-2', category: 'text', key: 'slugify' },
  {
    id: 'text-reverse',
    icon: 'lucide:flip-horizontal',
    category: 'text',
    key: 'textReverse',
  },
  {
    id: 'string-escape',
    icon: 'lucide:quote',
    category: 'text',
    key: 'stringEscape',
  },
  {
    id: 'unicode-inspector',
    icon: 'lucide:type',
    category: 'text',
    key: 'unicodeInspector',
  },
  {
    id: 'remove-whitespace',
    icon: 'lucide:eraser',
    category: 'text',
    key: 'removeWhitespace',
  },
  {
    id: 'remove-accents',
    icon: 'lucide:languages',
    category: 'text',
    key: 'removeAccents',
  },
  {
    id: 'line-endings',
    icon: 'lucide:corner-down-left',
    category: 'text',
    key: 'lineEndings',
  },
  {
    id: 'caesar-cipher',
    icon: 'lucide:rotate-cw',
    category: 'text',
    key: 'caesarCipher',
  },
  {
    id: 'morse-code',
    icon: 'lucide:radio',
    category: 'text',
    key: 'morseCode',
  },
  {
    id: 'nato-alphabet',
    icon: 'lucide:megaphone',
    category: 'text',
    key: 'natoAlphabet',
  },

  // crypto
  {
    id: 'hash-text',
    icon: 'lucide:hash',
    category: 'crypto',
    key: 'hashText',
  },
  {
    id: 'hmac-generator',
    icon: 'lucide:key-round',
    category: 'crypto',
    key: 'hmacGenerator',
  },
  {
    id: 'text-encrypt',
    icon: 'lucide:lock',
    category: 'crypto',
    key: 'textEncrypt',
  },
  {
    id: 'jwt-decoder',
    icon: 'lucide:key-square',
    category: 'crypto',
    key: 'jwtDecoder',
  },
  { id: 'totp', icon: 'lucide:timer', category: 'crypto', key: 'totp' },
  {
    id: 'password-strength',
    icon: 'lucide:shield-check',
    category: 'crypto',
    key: 'passwordStrength',
  },
  { id: 'crc32', icon: 'lucide:scan-line', category: 'crypto', key: 'crc32' },

  // web
  {
    id: 'url-encode',
    icon: 'lucide:link',
    category: 'web',
    key: 'urlEncode',
  },
  {
    id: 'url-parser',
    icon: 'lucide:globe',
    category: 'web',
    key: 'urlParser',
  },
  {
    id: 'query-json',
    icon: 'lucide:list',
    category: 'web',
    key: 'queryJson',
  },
  {
    id: 'basic-auth',
    icon: 'lucide:user-lock',
    category: 'web',
    key: 'basicAuth',
  },
  {
    id: 'user-agent-parser',
    icon: 'lucide:monitor-smartphone',
    category: 'web',
    key: 'userAgentParser',
  },
  {
    id: 'ip-converter',
    icon: 'lucide:network',
    category: 'web',
    key: 'ipConverter',
  },
  {
    id: 'mime-lookup',
    icon: 'lucide:file-type',
    category: 'web',
    key: 'mimeLookup',
  },
  {
    id: 'http-status',
    icon: 'lucide:server',
    category: 'web',
    key: 'httpStatus',
  },
  { id: 'punycode', icon: 'lucide:at-sign', category: 'web', key: 'punycode' },

  // development
  {
    id: 'json-to-ts',
    icon: 'lucide:file-code',
    category: 'development',
    key: 'jsonToTs',
  },
  {
    id: 'css-gradient',
    icon: 'lucide:paintbrush',
    category: 'development',
    key: 'cssGradient',
  },
  {
    id: 'box-shadow',
    icon: 'lucide:box',
    category: 'development',
    key: 'boxShadow',
  },
  {
    id: 'color-shades',
    icon: 'lucide:blend',
    category: 'development',
    key: 'colorShades',
  },
  {
    id: 'css-unit',
    icon: 'lucide:ruler',
    category: 'development',
    key: 'cssUnit',
  },
  {
    id: 'crontab-parser',
    icon: 'lucide:calendar-clock',
    category: 'development',
    key: 'crontabParser',
  },
  {
    id: 'svg-to-data-uri',
    icon: 'lucide:image',
    category: 'development',
    key: 'svgDataUri',
  },
  {
    id: 'meta-tags',
    icon: 'lucide:tags',
    category: 'development',
    key: 'metaTags',
  },

  // math
  {
    id: 'math-evaluator',
    icon: 'lucide:calculator',
    category: 'math',
    key: 'mathEvaluator',
  },
  {
    id: 'percentage-calculator',
    icon: 'lucide:percent',
    category: 'math',
    key: 'percentageCalculator',
  },
  {
    id: 'statistics',
    icon: 'lucide:sigma',
    category: 'math',
    key: 'statistics',
  },
  { id: 'gcd-lcm', icon: 'lucide:divide', category: 'math', key: 'gcdLcm' },
  {
    id: 'prime-factor',
    icon: 'lucide:asterisk',
    category: 'math',
    key: 'primeFactor',
  },
  {
    id: 'prime-sieve',
    icon: 'lucide:grid-3x3',
    category: 'math',
    key: 'primeSieve',
  },
  {
    id: 'combinatorics',
    icon: 'lucide:parentheses',
    category: 'math',
    key: 'combinatorics',
  },
  {
    id: 'mod-power',
    icon: 'lucide:superscript',
    category: 'math',
    key: 'modPower',
  },

  // generator
  { id: 'uuid', icon: 'lucide:fingerprint', category: 'generator', key: 'uuid' },
  { id: 'ulid', icon: 'lucide:id-card', category: 'generator', key: 'ulid' },
  { id: 'nanoid', icon: 'lucide:badge', category: 'generator', key: 'nanoid' },
  {
    id: 'password-generator',
    icon: 'lucide:key',
    category: 'generator',
    key: 'passwordGenerator',
  },
  {
    id: 'key-generator',
    icon: 'lucide:square-asterisk',
    category: 'generator',
    key: 'keyGenerator',
  },
  {
    id: 'random-number',
    icon: 'lucide:dices',
    category: 'generator',
    key: 'randomNumber',
  },
  {
    id: 'random-string',
    icon: 'lucide:shuffle',
    category: 'generator',
    key: 'randomString',
  },
  {
    id: 'random-color',
    icon: 'lucide:pipette',
    category: 'generator',
    key: 'randomColor',
  },
  { id: 'qrcode', icon: 'lucide:qr-code', category: 'generator', key: 'qrcode' },
  {
    id: 'mac-address',
    icon: 'lucide:router',
    category: 'generator',
    key: 'macAddress',
  },
  {
    id: 'placeholder-image',
    icon: 'lucide:image-plus',
    category: 'generator',
    key: 'placeholderImage',
  },
  {
    id: 'lorem-ipsum',
    icon: 'lucide:pilcrow',
    category: 'generator',
    key: 'loremIpsum',
  },

  // utility expansion
  {
    id: 'csv-to-tsv',
    icon: 'lucide:table-2',
    category: 'converter',
    key: 'csvToTsv',
  },
  {
    id: 'xml-formatter',
    icon: 'lucide:file-code-2',
    category: 'converter',
    key: 'xmlFormatter',
  },
  {
    id: 'json-flatten',
    icon: 'lucide:unfold-vertical',
    category: 'converter',
    key: 'jsonFlatten',
  },
  {
    id: 'json-sort-keys',
    icon: 'lucide:arrow-down-a-z',
    category: 'converter',
    key: 'jsonSortKeys',
  },
  {
    id: 'hex-text',
    icon: 'lucide:binary',
    category: 'converter',
    key: 'hexText',
  },
  {
    id: 'list-converter',
    icon: 'lucide:list-restart',
    category: 'converter',
    key: 'listConverter',
  },
  {
    id: 'markdown-to-html',
    icon: 'lucide:file-type-2',
    category: 'converter',
    key: 'markdownToHtml',
  },
  {
    id: 'base58',
    icon: 'lucide:badge',
    category: 'converter',
    key: 'base58',
  },
  {
    id: 'length-converter',
    icon: 'lucide:ruler',
    category: 'converter',
    key: 'lengthConverter',
  },
  {
    id: 'duplicate-lines',
    icon: 'lucide:list-minus',
    category: 'text',
    key: 'duplicateLines',
  },
  {
    id: 'word-frequency',
    icon: 'lucide:chart-no-axes-column',
    category: 'text',
    key: 'wordFrequency',
  },
  {
    id: 'line-numberer',
    icon: 'lucide:list-ordered',
    category: 'text',
    key: 'lineNumberer',
  },
  {
    id: 'text-wrap',
    icon: 'lucide:wrap-text',
    category: 'text',
    key: 'textWrap',
  },
  {
    id: 'extract-emails',
    icon: 'lucide:mail-search',
    category: 'text',
    key: 'extractEmails',
  },
  {
    id: 'extract-urls',
    icon: 'lucide:link-2',
    category: 'text',
    key: 'extractUrls',
  },
  {
    id: 'unicode-normalizer',
    icon: 'lucide:languages',
    category: 'text',
    key: 'unicodeNormalizer',
  },
  {
    id: 'whitespace-visualizer',
    icon: 'lucide:space',
    category: 'text',
    key: 'whitespaceVisualizer',
  },
  { id: 'md5-hash', icon: 'lucide:hash', category: 'crypto', key: 'md5Hash' },
  {
    id: 'uuid-inspector',
    icon: 'lucide:scan-search',
    category: 'crypto',
    key: 'uuidInspector',
  },
  {
    id: 'ipv4-subnet',
    icon: 'lucide:network',
    category: 'web',
    key: 'ipv4Subnet',
  },
  {
    id: 'cookie-parser',
    icon: 'lucide:cookie',
    category: 'web',
    key: 'cookieParser',
  },
  {
    id: 'http-headers-parser',
    icon: 'lucide:rows-3',
    category: 'web',
    key: 'httpHeadersParser',
  },
  {
    id: 'utm-builder',
    icon: 'lucide:megaphone',
    category: 'web',
    key: 'utmBuilder',
  },
  {
    id: 'robots-generator',
    icon: 'lucide:bot',
    category: 'web',
    key: 'robotsGenerator',
  },
  {
    id: 'sitemap-generator',
    icon: 'lucide:network',
    category: 'web',
    key: 'sitemapGenerator',
  },
  {
    id: 'url-joiner',
    icon: 'lucide:link',
    category: 'web',
    key: 'urlJoiner',
  },
  {
    id: 'mailto-generator',
    icon: 'lucide:mail-plus',
    category: 'web',
    key: 'mailtoGenerator',
  },
  {
    id: 'json-schema-generator',
    icon: 'lucide:braces',
    category: 'development',
    key: 'jsonSchemaGenerator',
  },
  {
    id: 'sql-formatter',
    icon: 'lucide:database',
    category: 'development',
    key: 'sqlFormatter',
  },
  {
    id: 'css-minifier',
    icon: 'lucide:file-minus-2',
    category: 'development',
    key: 'cssMinifier',
  },
  {
    id: 'html-minifier',
    icon: 'lucide:code-xml',
    category: 'development',
    key: 'htmlMinifier',
  },
  {
    id: 'docker-run-to-compose',
    icon: 'lucide:container',
    category: 'development',
    key: 'dockerRunToCompose',
  },
  {
    id: 'gitignore-generator',
    icon: 'lucide:git-branch',
    category: 'development',
    key: 'gitignoreGenerator',
  },
  {
    id: 'semver-compare',
    icon: 'lucide:git-compare-arrows',
    category: 'development',
    key: 'semverCompare',
  },
  {
    id: 'css-specificity',
    icon: 'lucide:target',
    category: 'development',
    key: 'cssSpecificity',
  },
  {
    id: 'fraction-calculator',
    icon: 'lucide:divide',
    category: 'math',
    key: 'fractionCalculator',
  },
  {
    id: 'quadratic-solver',
    icon: 'lucide:superscript',
    category: 'math',
    key: 'quadraticSolver',
  },
  {
    id: 'date-difference',
    icon: 'lucide:calendar-range',
    category: 'math',
    key: 'dateDifference',
  },
  {
    id: 'age-calculator',
    icon: 'lucide:cake',
    category: 'math',
    key: 'ageCalculator',
  },
  {
    id: 'business-days',
    icon: 'lucide:calendar-check',
    category: 'math',
    key: 'businessDays',
  },
  {
    id: 'bmi-calculator',
    icon: 'lucide:activity',
    category: 'math',
    key: 'bmiCalculator',
  },
  {
    id: 'loan-calculator',
    icon: 'lucide:landmark',
    category: 'math',
    key: 'loanCalculator',
  },
  {
    id: 'compound-interest',
    icon: 'lucide:chart-no-axes-combined',
    category: 'math',
    key: 'compoundInterest',
  },
  {
    id: 'aspect-ratio',
    icon: 'lucide:ratio',
    category: 'math',
    key: 'aspectRatio',
  },

  // fun & tests
  {
    id: 'cps-test',
    icon: 'lucide:mouse-pointer-click',
    category: 'fun',
    key: 'cpsTest',
  },
  {
    id: 'spacebar-test',
    icon: 'lucide:keyboard',
    category: 'fun',
    key: 'spacebarTest',
  },
  {
    id: 'reaction-time',
    icon: 'lucide:zap',
    category: 'fun',
    key: 'reactionTime',
  },
  {
    id: 'aim-trainer',
    icon: 'lucide:crosshair',
    category: 'fun',
    key: 'aimTrainer',
  },
  {
    id: 'mouse-accuracy',
    icon: 'lucide:mouse-pointer-2',
    category: 'fun',
    key: 'mouseAccuracy',
  },
  {
    id: 'scroll-speed',
    icon: 'lucide:mouse',
    category: 'fun',
    key: 'scrollSpeed',
  },
  {
    id: 'schulte-table',
    icon: 'lucide:grid-3x3',
    category: 'fun',
    key: 'schulteTable',
  },
  {
    id: 'time-perception',
    icon: 'lucide:timer',
    category: 'fun',
    key: 'timePerception',
  },
  {
    id: 'stroop-test',
    icon: 'lucide:palette',
    category: 'fun',
    key: 'stroopTest',
  },
  {
    id: 'color-hue-test',
    icon: 'lucide:swatch-book',
    category: 'fun',
    key: 'colorHueTest',
  },
  {
    id: 'odd-one-out',
    icon: 'lucide:scan-search',
    category: 'fun',
    key: 'oddOneOut',
  },
  {
    id: 'rhythm-test',
    icon: 'lucide:music-2',
    category: 'fun',
    key: 'rhythmTest',
  },
  {
    id: 'sequence-memory',
    icon: 'lucide:panels-top-left',
    category: 'fun',
    key: 'sequenceMemory',
  },
  {
    id: 'number-memory',
    icon: 'lucide:binary',
    category: 'fun',
    key: 'numberMemory',
  },
  {
    id: 'visual-memory',
    icon: 'lucide:brain',
    category: 'fun',
    key: 'visualMemory',
  },
  {
    id: 'verbal-memory',
    icon: 'lucide:spell-check-2',
    category: 'fun',
    key: 'verbalMemory',
  },
  {
    id: 'memory-match',
    icon: 'lucide:copy-check',
    category: 'fun',
    key: 'memoryMatch',
  },
  {
    id: 'arithmetic-sprint',
    icon: 'lucide:sigma',
    category: 'fun',
    key: 'arithmeticSprint',
  },
  { id: 'go-no-go', icon: 'lucide:circle-stop', category: 'fun', key: 'goNoGo' },
  {
    id: 'typing-speed',
    icon: 'lucide:type',
    category: 'fun',
    key: 'typingSpeed',
  },
];

export const CATEGORY_ORDER: ToolCategory[] = [
  'converter',
  'text',
  'crypto',
  'web',
  'development',
  'math',
  'generator',
  'fun',
];
