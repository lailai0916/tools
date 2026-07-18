import type { ComponentType } from 'react';

export type ToolCategory =
  'converter' | 'text' | 'crypto' | 'web' | 'development' | 'math' | 'generator';

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

// converter
import JsonFormat from './json-format';
import BaseConverter from './base-converter';
import Base64 from './base64';
import ColorConverter from './color-converter';
import Timestamp from './timestamp';
import JsonToYaml from './json-to-yaml';
import JsonToCsv from './json-to-csv';
import HtmlEntities from './html-entities';
import RomanNumeral from './roman-numeral';
import TextToBinary from './text-to-binary';
import TemperatureConverter from './temperature-converter';
import DataSizeConverter from './data-size-converter';
import UnixPermission from './unix-permission';
import DurationConverter from './duration-converter';
import AngleConverter from './angle-converter';
import Base32 from './base32';

// text
import CaseConverter from './case-converter';
import RegexTester from './regex-tester';
import TextDiff from './text-diff';
import TextStats from './text-stats';
import SortLines from './sort-lines';
import Slugify from './slugify';
import TextReverse from './text-reverse';
import StringEscape from './string-escape';
import UnicodeInspector from './unicode-inspector';
import MorseCode from './morse-code';
import NatoAlphabet from './nato-alphabet';
import LineEndings from './line-endings';
import RemoveWhitespace from './remove-whitespace';
import FindReplace from './find-replace';
import CaesarCipher from './caesar-cipher';
import RemoveAccents from './remove-accents';

// crypto
import HashText from './hash-text';
import HmacGenerator from './hmac-generator';
import JwtDecoder from './jwt-decoder';
import PasswordStrength from './password-strength';
import Crc32 from './crc32';
import TextEncrypt from './text-encrypt';
import Totp from './totp';

// web
import UrlEncode from './url-encode';
import UrlParser from './url-parser';
import QueryJson from './query-json';
import BasicAuth from './basic-auth';
import UserAgentParser from './user-agent-parser';
import MimeLookup from './mime-lookup';
import HttpStatus from './http-status';
import IpConverter from './ip-converter';
import Punycode from './punycode';

// development
import CssGradient from './css-gradient';
import BoxShadow from './box-shadow';
import CrontabParser from './crontab-parser';
import SvgDataUri from './svg-to-data-uri';
import JsonToTs from './json-to-ts';
import CssUnit from './css-unit';
import MetaTags from './meta-tags';
import ColorShades from './color-shades';

// math
import PercentageCalculator from './percentage-calculator';
import GcdLcm from './gcd-lcm';
import PrimeFactor from './prime-factor';
import MathEvaluator from './math-evaluator';
import Statistics from './statistics';
import Combinatorics from './combinatorics';
import ModPower from './mod-power';
import PrimeSieve from './prime-sieve';

// generator
import QrCode from './qrcode';
import Uuid from './uuid';
import PasswordGenerator from './password-generator';
import LoremIpsum from './lorem-ipsum';
import RandomNumber from './random-number';
import RandomString from './random-string';
import KeyGenerator from './key-generator';
import Ulid from './ulid';
import Nanoid from './nanoid';
import MacAddress from './mac-address';
import PlaceholderImage from './placeholder-image';
import RandomColor from './random-color';

export const TOOLS: ToolMeta[] = [
  // converter
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
    id: 'base32',
    icon: 'lucide:file-digit',
    category: 'converter',
    key: 'base32',
    Component: Base32,
  },
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
    id: 'json-to-yaml',
    icon: 'lucide:file-json',
    category: 'converter',
    key: 'jsonToYaml',
    Component: JsonToYaml,
  },
  {
    id: 'json-to-csv',
    icon: 'lucide:table',
    category: 'converter',
    key: 'jsonToCsv',
    Component: JsonToCsv,
  },
  {
    id: 'html-entities',
    icon: 'lucide:code-xml',
    category: 'converter',
    key: 'htmlEntities',
    Component: HtmlEntities,
  },
  {
    id: 'roman-numeral',
    icon: 'lucide:landmark',
    category: 'converter',
    key: 'romanNumeral',
    Component: RomanNumeral,
  },
  {
    id: 'text-to-binary',
    icon: 'lucide:binary',
    category: 'converter',
    key: 'textToBinary',
    Component: TextToBinary,
  },
  {
    id: 'temperature-converter',
    icon: 'lucide:thermometer',
    category: 'converter',
    key: 'temperatureConverter',
    Component: TemperatureConverter,
  },
  {
    id: 'data-size-converter',
    icon: 'lucide:hard-drive',
    category: 'converter',
    key: 'dataSizeConverter',
    Component: DataSizeConverter,
  },
  {
    id: 'unix-permission',
    icon: 'lucide:shield',
    category: 'converter',
    key: 'unixPermission',
    Component: UnixPermission,
  },
  {
    id: 'duration-converter',
    icon: 'lucide:hourglass',
    category: 'converter',
    key: 'durationConverter',
    Component: DurationConverter,
  },
  {
    id: 'angle-converter',
    icon: 'lucide:triangle',
    category: 'converter',
    key: 'angleConverter',
    Component: AngleConverter,
  },

  // text
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
  {
    id: 'text-stats',
    icon: 'lucide:file-text',
    category: 'text',
    key: 'textStats',
    Component: TextStats,
  },
  {
    id: 'sort-lines',
    icon: 'lucide:arrow-down-up',
    category: 'text',
    key: 'sortLines',
    Component: SortLines,
  },
  {
    id: 'find-replace',
    icon: 'lucide:replace',
    category: 'text',
    key: 'findReplace',
    Component: FindReplace,
  },
  { id: 'slugify', icon: 'lucide:link-2', category: 'text', key: 'slugify', Component: Slugify },
  {
    id: 'text-reverse',
    icon: 'lucide:flip-horizontal',
    category: 'text',
    key: 'textReverse',
    Component: TextReverse,
  },
  {
    id: 'string-escape',
    icon: 'lucide:quote',
    category: 'text',
    key: 'stringEscape',
    Component: StringEscape,
  },
  {
    id: 'unicode-inspector',
    icon: 'lucide:type',
    category: 'text',
    key: 'unicodeInspector',
    Component: UnicodeInspector,
  },
  {
    id: 'remove-whitespace',
    icon: 'lucide:eraser',
    category: 'text',
    key: 'removeWhitespace',
    Component: RemoveWhitespace,
  },
  {
    id: 'remove-accents',
    icon: 'lucide:languages',
    category: 'text',
    key: 'removeAccents',
    Component: RemoveAccents,
  },
  {
    id: 'line-endings',
    icon: 'lucide:corner-down-left',
    category: 'text',
    key: 'lineEndings',
    Component: LineEndings,
  },
  {
    id: 'caesar-cipher',
    icon: 'lucide:rotate-cw',
    category: 'text',
    key: 'caesarCipher',
    Component: CaesarCipher,
  },
  {
    id: 'morse-code',
    icon: 'lucide:radio',
    category: 'text',
    key: 'morseCode',
    Component: MorseCode,
  },
  {
    id: 'nato-alphabet',
    icon: 'lucide:megaphone',
    category: 'text',
    key: 'natoAlphabet',
    Component: NatoAlphabet,
  },

  // crypto
  {
    id: 'hash-text',
    icon: 'lucide:hash',
    category: 'crypto',
    key: 'hashText',
    Component: HashText,
  },
  {
    id: 'hmac-generator',
    icon: 'lucide:key-round',
    category: 'crypto',
    key: 'hmacGenerator',
    Component: HmacGenerator,
  },
  {
    id: 'text-encrypt',
    icon: 'lucide:lock',
    category: 'crypto',
    key: 'textEncrypt',
    Component: TextEncrypt,
  },
  {
    id: 'jwt-decoder',
    icon: 'lucide:key-square',
    category: 'crypto',
    key: 'jwtDecoder',
    Component: JwtDecoder,
  },
  { id: 'totp', icon: 'lucide:timer', category: 'crypto', key: 'totp', Component: Totp },
  {
    id: 'password-strength',
    icon: 'lucide:shield-check',
    category: 'crypto',
    key: 'passwordStrength',
    Component: PasswordStrength,
  },
  { id: 'crc32', icon: 'lucide:scan-line', category: 'crypto', key: 'crc32', Component: Crc32 },

  // web
  {
    id: 'url-encode',
    icon: 'lucide:link',
    category: 'web',
    key: 'urlEncode',
    Component: UrlEncode,
  },
  {
    id: 'url-parser',
    icon: 'lucide:globe',
    category: 'web',
    key: 'urlParser',
    Component: UrlParser,
  },
  {
    id: 'query-json',
    icon: 'lucide:list',
    category: 'web',
    key: 'queryJson',
    Component: QueryJson,
  },
  {
    id: 'basic-auth',
    icon: 'lucide:user-lock',
    category: 'web',
    key: 'basicAuth',
    Component: BasicAuth,
  },
  {
    id: 'user-agent-parser',
    icon: 'lucide:monitor-smartphone',
    category: 'web',
    key: 'userAgentParser',
    Component: UserAgentParser,
  },
  {
    id: 'ip-converter',
    icon: 'lucide:network',
    category: 'web',
    key: 'ipConverter',
    Component: IpConverter,
  },
  {
    id: 'mime-lookup',
    icon: 'lucide:file-type',
    category: 'web',
    key: 'mimeLookup',
    Component: MimeLookup,
  },
  {
    id: 'http-status',
    icon: 'lucide:server',
    category: 'web',
    key: 'httpStatus',
    Component: HttpStatus,
  },
  { id: 'punycode', icon: 'lucide:at-sign', category: 'web', key: 'punycode', Component: Punycode },

  // development
  {
    id: 'json-to-ts',
    icon: 'lucide:file-code',
    category: 'development',
    key: 'jsonToTs',
    Component: JsonToTs,
  },
  {
    id: 'css-gradient',
    icon: 'lucide:paintbrush',
    category: 'development',
    key: 'cssGradient',
    Component: CssGradient,
  },
  {
    id: 'box-shadow',
    icon: 'lucide:box',
    category: 'development',
    key: 'boxShadow',
    Component: BoxShadow,
  },
  {
    id: 'color-shades',
    icon: 'lucide:blend',
    category: 'development',
    key: 'colorShades',
    Component: ColorShades,
  },
  {
    id: 'css-unit',
    icon: 'lucide:ruler',
    category: 'development',
    key: 'cssUnit',
    Component: CssUnit,
  },
  {
    id: 'crontab-parser',
    icon: 'lucide:calendar-clock',
    category: 'development',
    key: 'crontabParser',
    Component: CrontabParser,
  },
  {
    id: 'svg-to-data-uri',
    icon: 'lucide:image',
    category: 'development',
    key: 'svgDataUri',
    Component: SvgDataUri,
  },
  {
    id: 'meta-tags',
    icon: 'lucide:tags',
    category: 'development',
    key: 'metaTags',
    Component: MetaTags,
  },

  // math
  {
    id: 'math-evaluator',
    icon: 'lucide:calculator',
    category: 'math',
    key: 'mathEvaluator',
    Component: MathEvaluator,
  },
  {
    id: 'percentage-calculator',
    icon: 'lucide:percent',
    category: 'math',
    key: 'percentageCalculator',
    Component: PercentageCalculator,
  },
  {
    id: 'statistics',
    icon: 'lucide:sigma',
    category: 'math',
    key: 'statistics',
    Component: Statistics,
  },
  { id: 'gcd-lcm', icon: 'lucide:divide', category: 'math', key: 'gcdLcm', Component: GcdLcm },
  {
    id: 'prime-factor',
    icon: 'lucide:asterisk',
    category: 'math',
    key: 'primeFactor',
    Component: PrimeFactor,
  },
  {
    id: 'prime-sieve',
    icon: 'lucide:grid-3x3',
    category: 'math',
    key: 'primeSieve',
    Component: PrimeSieve,
  },
  {
    id: 'combinatorics',
    icon: 'lucide:parentheses',
    category: 'math',
    key: 'combinatorics',
    Component: Combinatorics,
  },
  {
    id: 'mod-power',
    icon: 'lucide:superscript',
    category: 'math',
    key: 'modPower',
    Component: ModPower,
  },

  // generator
  { id: 'uuid', icon: 'lucide:fingerprint', category: 'generator', key: 'uuid', Component: Uuid },
  { id: 'ulid', icon: 'lucide:id-card', category: 'generator', key: 'ulid', Component: Ulid },
  { id: 'nanoid', icon: 'lucide:badge', category: 'generator', key: 'nanoid', Component: Nanoid },
  {
    id: 'password-generator',
    icon: 'lucide:key',
    category: 'generator',
    key: 'passwordGenerator',
    Component: PasswordGenerator,
  },
  {
    id: 'key-generator',
    icon: 'lucide:square-asterisk',
    category: 'generator',
    key: 'keyGenerator',
    Component: KeyGenerator,
  },
  {
    id: 'random-number',
    icon: 'lucide:dices',
    category: 'generator',
    key: 'randomNumber',
    Component: RandomNumber,
  },
  {
    id: 'random-string',
    icon: 'lucide:shuffle',
    category: 'generator',
    key: 'randomString',
    Component: RandomString,
  },
  {
    id: 'random-color',
    icon: 'lucide:pipette',
    category: 'generator',
    key: 'randomColor',
    Component: RandomColor,
  },
  { id: 'qrcode', icon: 'lucide:qr-code', category: 'generator', key: 'qrcode', Component: QrCode },
  {
    id: 'mac-address',
    icon: 'lucide:router',
    category: 'generator',
    key: 'macAddress',
    Component: MacAddress,
  },
  {
    id: 'placeholder-image',
    icon: 'lucide:image-plus',
    category: 'generator',
    key: 'placeholderImage',
    Component: PlaceholderImage,
  },
  {
    id: 'lorem-ipsum',
    icon: 'lucide:pilcrow',
    category: 'generator',
    key: 'loremIpsum',
    Component: LoremIpsum,
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
];
