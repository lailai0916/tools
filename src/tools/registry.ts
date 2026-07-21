import type { ComponentType } from 'react';

export type ToolCategory =
  'converter' | 'text' | 'crypto' | 'web' | 'development' | 'math' | 'generator' | 'fun';

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
import CsvToTsv from './csv-to-tsv';
import XmlFormatter from './xml-formatter';
import JsonFlatten from './json-flatten';
import JsonSortKeys from './json-sort-keys';
import HexText from './hex-text';
import ListConverter from './list-converter';
import MarkdownToHtml from './markdown-to-html';
import Base58 from './base58';
import LengthConverter from './length-converter';
import DuplicateLines from './duplicate-lines';
import WordFrequency from './word-frequency';
import LineNumberer from './line-numberer';
import TextWrap from './text-wrap';
import ExtractEmails from './extract-emails';
import ExtractUrls from './extract-urls';
import UnicodeNormalizer from './unicode-normalizer';
import WhitespaceVisualizer from './whitespace-visualizer';
import Md5Hash from './md5-hash';
import UuidInspector from './uuid-inspector';
import Ipv4Subnet from './ipv4-subnet';
import CookieParser from './cookie-parser';
import HttpHeadersParser from './http-headers-parser';
import UtmBuilder from './utm-builder';
import RobotsGenerator from './robots-generator';
import SitemapGenerator from './sitemap-generator';
import UrlJoiner from './url-joiner';
import MailtoGenerator from './mailto-generator';
import JsonSchemaGenerator from './json-schema-generator';
import SqlFormatter from './sql-formatter';
import CssMinifier from './css-minifier';
import HtmlMinifier from './html-minifier';
import DockerRunToCompose from './docker-run-to-compose';
import GitignoreGenerator from './gitignore-generator';
import SemverCompare from './semver-compare';
import CssSpecificity from './css-specificity';
import FractionCalculator from './fraction-calculator';
import QuadraticSolver from './quadratic-solver';
import DateDifference from './date-difference';
import AgeCalculator from './age-calculator';
import BusinessDays from './business-days';
import BmiCalculator from './bmi-calculator';
import LoanCalculator from './loan-calculator';
import CompoundInterest from './compound-interest';
import AspectRatio from './aspect-ratio';

// fun & tests
import CpsTest from './cps-test';
import SpacebarTest from './spacebar-test';
import ReactionTime from './reaction-time';
import AimTrainer from './aim-trainer';
import MouseAccuracy from './mouse-accuracy';
import ScrollSpeed from './scroll-speed';
import SchulteTable from './schulte-table';
import TimePerception from './time-perception';
import StroopTest from './stroop-test';
import ColorHueTest from './color-hue-test';
import OddOneOut from './odd-one-out';
import RhythmTest from './rhythm-test';
import SequenceMemory from './sequence-memory';
import NumberMemory from './number-memory';
import VisualMemory from './visual-memory';
import VerbalMemory from './verbal-memory';
import MemoryMatch from './memory-match';
import ArithmeticSprint from './arithmetic-sprint';
import GoNoGo from './go-no-go';
import TypingSpeed from './typing-speed';

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

  // utility expansion
  {
    id: 'csv-to-tsv',
    icon: 'lucide:table-2',
    category: 'converter',
    key: 'csvToTsv',
    Component: CsvToTsv,
  },
  {
    id: 'xml-formatter',
    icon: 'lucide:file-code-2',
    category: 'converter',
    key: 'xmlFormatter',
    Component: XmlFormatter,
  },
  {
    id: 'json-flatten',
    icon: 'lucide:unfold-vertical',
    category: 'converter',
    key: 'jsonFlatten',
    Component: JsonFlatten,
  },
  {
    id: 'json-sort-keys',
    icon: 'lucide:arrow-down-a-z',
    category: 'converter',
    key: 'jsonSortKeys',
    Component: JsonSortKeys,
  },
  {
    id: 'hex-text',
    icon: 'lucide:binary',
    category: 'converter',
    key: 'hexText',
    Component: HexText,
  },
  {
    id: 'list-converter',
    icon: 'lucide:list-restart',
    category: 'converter',
    key: 'listConverter',
    Component: ListConverter,
  },
  {
    id: 'markdown-to-html',
    icon: 'lucide:file-type-2',
    category: 'converter',
    key: 'markdownToHtml',
    Component: MarkdownToHtml,
  },
  {
    id: 'base58',
    icon: 'lucide:badge',
    category: 'converter',
    key: 'base58',
    Component: Base58,
  },
  {
    id: 'length-converter',
    icon: 'lucide:ruler',
    category: 'converter',
    key: 'lengthConverter',
    Component: LengthConverter,
  },
  {
    id: 'duplicate-lines',
    icon: 'lucide:list-minus',
    category: 'text',
    key: 'duplicateLines',
    Component: DuplicateLines,
  },
  {
    id: 'word-frequency',
    icon: 'lucide:chart-no-axes-column',
    category: 'text',
    key: 'wordFrequency',
    Component: WordFrequency,
  },
  {
    id: 'line-numberer',
    icon: 'lucide:list-ordered',
    category: 'text',
    key: 'lineNumberer',
    Component: LineNumberer,
  },
  {
    id: 'text-wrap',
    icon: 'lucide:wrap-text',
    category: 'text',
    key: 'textWrap',
    Component: TextWrap,
  },
  {
    id: 'extract-emails',
    icon: 'lucide:mail-search',
    category: 'text',
    key: 'extractEmails',
    Component: ExtractEmails,
  },
  {
    id: 'extract-urls',
    icon: 'lucide:link-2',
    category: 'text',
    key: 'extractUrls',
    Component: ExtractUrls,
  },
  {
    id: 'unicode-normalizer',
    icon: 'lucide:languages',
    category: 'text',
    key: 'unicodeNormalizer',
    Component: UnicodeNormalizer,
  },
  {
    id: 'whitespace-visualizer',
    icon: 'lucide:space',
    category: 'text',
    key: 'whitespaceVisualizer',
    Component: WhitespaceVisualizer,
  },
  { id: 'md5-hash', icon: 'lucide:hash', category: 'crypto', key: 'md5Hash', Component: Md5Hash },
  {
    id: 'uuid-inspector',
    icon: 'lucide:scan-search',
    category: 'crypto',
    key: 'uuidInspector',
    Component: UuidInspector,
  },
  {
    id: 'ipv4-subnet',
    icon: 'lucide:network',
    category: 'web',
    key: 'ipv4Subnet',
    Component: Ipv4Subnet,
  },
  {
    id: 'cookie-parser',
    icon: 'lucide:cookie',
    category: 'web',
    key: 'cookieParser',
    Component: CookieParser,
  },
  {
    id: 'http-headers-parser',
    icon: 'lucide:rows-3',
    category: 'web',
    key: 'httpHeadersParser',
    Component: HttpHeadersParser,
  },
  {
    id: 'utm-builder',
    icon: 'lucide:megaphone',
    category: 'web',
    key: 'utmBuilder',
    Component: UtmBuilder,
  },
  {
    id: 'robots-generator',
    icon: 'lucide:bot',
    category: 'web',
    key: 'robotsGenerator',
    Component: RobotsGenerator,
  },
  {
    id: 'sitemap-generator',
    icon: 'lucide:network',
    category: 'web',
    key: 'sitemapGenerator',
    Component: SitemapGenerator,
  },
  {
    id: 'url-joiner',
    icon: 'lucide:link',
    category: 'web',
    key: 'urlJoiner',
    Component: UrlJoiner,
  },
  {
    id: 'mailto-generator',
    icon: 'lucide:mail-plus',
    category: 'web',
    key: 'mailtoGenerator',
    Component: MailtoGenerator,
  },
  {
    id: 'json-schema-generator',
    icon: 'lucide:braces',
    category: 'development',
    key: 'jsonSchemaGenerator',
    Component: JsonSchemaGenerator,
  },
  {
    id: 'sql-formatter',
    icon: 'lucide:database',
    category: 'development',
    key: 'sqlFormatter',
    Component: SqlFormatter,
  },
  {
    id: 'css-minifier',
    icon: 'lucide:file-minus-2',
    category: 'development',
    key: 'cssMinifier',
    Component: CssMinifier,
  },
  {
    id: 'html-minifier',
    icon: 'lucide:code-xml',
    category: 'development',
    key: 'htmlMinifier',
    Component: HtmlMinifier,
  },
  {
    id: 'docker-run-to-compose',
    icon: 'lucide:container',
    category: 'development',
    key: 'dockerRunToCompose',
    Component: DockerRunToCompose,
  },
  {
    id: 'gitignore-generator',
    icon: 'lucide:git-branch',
    category: 'development',
    key: 'gitignoreGenerator',
    Component: GitignoreGenerator,
  },
  {
    id: 'semver-compare',
    icon: 'lucide:git-compare-arrows',
    category: 'development',
    key: 'semverCompare',
    Component: SemverCompare,
  },
  {
    id: 'css-specificity',
    icon: 'lucide:target',
    category: 'development',
    key: 'cssSpecificity',
    Component: CssSpecificity,
  },
  {
    id: 'fraction-calculator',
    icon: 'lucide:divide',
    category: 'math',
    key: 'fractionCalculator',
    Component: FractionCalculator,
  },
  {
    id: 'quadratic-solver',
    icon: 'lucide:superscript',
    category: 'math',
    key: 'quadraticSolver',
    Component: QuadraticSolver,
  },
  {
    id: 'date-difference',
    icon: 'lucide:calendar-range',
    category: 'math',
    key: 'dateDifference',
    Component: DateDifference,
  },
  {
    id: 'age-calculator',
    icon: 'lucide:cake',
    category: 'math',
    key: 'ageCalculator',
    Component: AgeCalculator,
  },
  {
    id: 'business-days',
    icon: 'lucide:calendar-check',
    category: 'math',
    key: 'businessDays',
    Component: BusinessDays,
  },
  {
    id: 'bmi-calculator',
    icon: 'lucide:activity',
    category: 'math',
    key: 'bmiCalculator',
    Component: BmiCalculator,
  },
  {
    id: 'loan-calculator',
    icon: 'lucide:landmark',
    category: 'math',
    key: 'loanCalculator',
    Component: LoanCalculator,
  },
  {
    id: 'compound-interest',
    icon: 'lucide:chart-no-axes-combined',
    category: 'math',
    key: 'compoundInterest',
    Component: CompoundInterest,
  },
  {
    id: 'aspect-ratio',
    icon: 'lucide:ratio',
    category: 'math',
    key: 'aspectRatio',
    Component: AspectRatio,
  },

  // fun & tests
  {
    id: 'cps-test',
    icon: 'lucide:mouse-pointer-click',
    category: 'fun',
    key: 'cpsTest',
    Component: CpsTest,
  },
  {
    id: 'spacebar-test',
    icon: 'lucide:keyboard',
    category: 'fun',
    key: 'spacebarTest',
    Component: SpacebarTest,
  },
  {
    id: 'reaction-time',
    icon: 'lucide:zap',
    category: 'fun',
    key: 'reactionTime',
    Component: ReactionTime,
  },
  {
    id: 'aim-trainer',
    icon: 'lucide:crosshair',
    category: 'fun',
    key: 'aimTrainer',
    Component: AimTrainer,
  },
  {
    id: 'mouse-accuracy',
    icon: 'lucide:mouse-pointer-2',
    category: 'fun',
    key: 'mouseAccuracy',
    Component: MouseAccuracy,
  },
  {
    id: 'scroll-speed',
    icon: 'lucide:mouse',
    category: 'fun',
    key: 'scrollSpeed',
    Component: ScrollSpeed,
  },
  {
    id: 'schulte-table',
    icon: 'lucide:grid-3x3',
    category: 'fun',
    key: 'schulteTable',
    Component: SchulteTable,
  },
  {
    id: 'time-perception',
    icon: 'lucide:timer',
    category: 'fun',
    key: 'timePerception',
    Component: TimePerception,
  },
  {
    id: 'stroop-test',
    icon: 'lucide:palette',
    category: 'fun',
    key: 'stroopTest',
    Component: StroopTest,
  },
  {
    id: 'color-hue-test',
    icon: 'lucide:swatch-book',
    category: 'fun',
    key: 'colorHueTest',
    Component: ColorHueTest,
  },
  {
    id: 'odd-one-out',
    icon: 'lucide:scan-search',
    category: 'fun',
    key: 'oddOneOut',
    Component: OddOneOut,
  },
  {
    id: 'rhythm-test',
    icon: 'lucide:music-2',
    category: 'fun',
    key: 'rhythmTest',
    Component: RhythmTest,
  },
  {
    id: 'sequence-memory',
    icon: 'lucide:panels-top-left',
    category: 'fun',
    key: 'sequenceMemory',
    Component: SequenceMemory,
  },
  {
    id: 'number-memory',
    icon: 'lucide:binary',
    category: 'fun',
    key: 'numberMemory',
    Component: NumberMemory,
  },
  {
    id: 'visual-memory',
    icon: 'lucide:brain',
    category: 'fun',
    key: 'visualMemory',
    Component: VisualMemory,
  },
  {
    id: 'verbal-memory',
    icon: 'lucide:spell-check-2',
    category: 'fun',
    key: 'verbalMemory',
    Component: VerbalMemory,
  },
  {
    id: 'memory-match',
    icon: 'lucide:copy-check',
    category: 'fun',
    key: 'memoryMatch',
    Component: MemoryMatch,
  },
  {
    id: 'arithmetic-sprint',
    icon: 'lucide:sigma',
    category: 'fun',
    key: 'arithmeticSprint',
    Component: ArithmeticSprint,
  },
  { id: 'go-no-go', icon: 'lucide:circle-stop', category: 'fun', key: 'goNoGo', Component: GoNoGo },
  {
    id: 'typing-speed',
    icon: 'lucide:type',
    category: 'fun',
    key: 'typingSpeed',
    Component: TypingSpeed,
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
