import { curatedDataEn } from './curated/data';

import { curatedTextEn } from './curated/text';

import { curatedCryptoEn } from './curated/crypto';

import { curatedWebEn } from './curated/web';

import { curatedCoreEn } from './curated/core';
import { curatedTimeUnitsEn } from './curated/timeUnits';
import { developmentPolishEn } from './curated/developmentPolish';
import { randomNumberPolishEn } from './curated/randomNumberPolish';
import { cryptoPolishEn } from './curated/cryptoPolish';
import { textMathPolishEn } from './curated/textMathPolish';
import { mediaPolishEn } from './curated/mediaPolish';

const baseEn = {
  'site.title': "lailai's Tools",

  'site.tagline': 'Handy tools for developers.',

  'site.toolAvailable': 'browser-only tool',

  'site.toolsAvailable': 'browser-only tools',

  'site.openNavigation': 'Open navigation',

  'site.closeNavigation': 'Close navigation',

  'site.toolNavigation': 'Tool navigation',

  'site.toolCategories': 'Categories',

  'site.allTools': 'All tools',

  'site.searchPlaceholder': 'Search tools',

  'site.searchHint': 'Search tools (⌘K / Ctrl+K)',

  'site.closeSearch': 'Close search',

  'site.clearSearch': 'Clear search filter',

  'site.searchResults': 'Search results',

  'site.searchNoResultsDescription': 'Try a tool name or keyword.',

  'site.searchLocal': 'Searches tools locally',

  'site.searchSelect': 'select',

  'site.searchOpen': 'open',

  'site.noResults': 'No matching tools.',

  'site.noResultsDescription': 'Try another search or show all tools.',

  'site.switchLanguage': 'Switch language',

  'site.themeSystem': 'Auto',

  'site.themeLight': 'Light',

  'site.themeDark': 'Dark',

  'site.viewAll': 'All',

  'site.viewFavorites': 'Favorites',

  'site.viewRecent': 'Recent',

  'site.allCategories': 'All categories',

  'site.addFavorite': 'Add to favorites',

  'site.removeFavorite': 'Remove from favorites',

  'site.noFavorites': 'No favorites yet.',

  'site.noRecent': 'No recent tools yet.',

  'site.emptyFavorites': 'Favorite tools appear here.',

  'site.emptyRecent': 'Tools you open appear here.',

  'site.showAllTools': 'Show all tools',

  'site.skipToContent': 'Skip to content',

  'site.breadcrumb': 'Breadcrumb',

  'site.home': 'Home page',

  'common.mode': 'Mode',

  'common.options': 'Options',

  'common.back': 'Back',

  'common.clear': 'Clear',

  'common.copy': 'Copy',

  'common.copied': 'Copied',

  'common.input': 'Input',

  'common.output': 'Output',

  'common.show': 'Show',

  'common.hide': 'Hide',

  'common.loading': 'Loading tool',

  'common.processing': 'Processing…',

  'common.processingFailed': 'Processing failed. Please try again.',

  'guide.title': 'Tool guide',

  'guide.steps': 'How to use',

  'guide.example': 'Example',

  'guide.notes': 'Notes',

  'guide.input': 'Setup / input',

  'guide.output': 'Result',

  'category.converter': 'Converter',

  'category.crypto': 'Crypto',

  'category.web': 'Web',

  'category.text': 'Text',

  'category.development': 'Development',

  'category.math': 'Math',

  'category.generator': 'Generator',

  'category.fun': 'Tests',

  'fun.report': 'Performance report',

  'fun.rating': 'Rating',

  'fun.personalBest': 'Personal best',

  'fun.newBest': 'New personal best',

  'fun.replayHint': 'Quick replay',

  'fun.status.ready': 'Ready',

  'fun.status.running': 'Session in progress',

  'fun.status.done': 'Session complete',

  'fun.total': 'Total',

  'fun.average': 'Average',

  'fun.bestRound': 'Best round',

  'fun.accuracy': 'Accuracy',

  'fun.mistakes': 'Mistakes',

  'fun.time': 'Time',

  'fun.rounds': 'Rounds',

  'fun.consistency': 'Consistency',

  'fun.insight': 'Review the detailed metrics, then repeat the test to track improvement.',

  'tools.baseConverter.name': 'Base Converter',

  'tools.baseConverter.description':
    'Convert integers of any size between binary, octal, decimal and hexadecimal.',

  'tools.baseConverter.binary': 'Binary',

  'tools.baseConverter.octal': 'Octal',

  'tools.baseConverter.decimal': 'Decimal',

  'tools.baseConverter.hexadecimal': 'Hexadecimal',

  'tools.baseConverter.invalid': 'Invalid digits for this base.',

  'tools.colorConverter.name': 'Color Converter',

  'tools.colorConverter.description':
    'Convert and fine-tune colors between HEX, RGB and HSL with a live preview.',

  'tools.colorConverter.preview': 'Preview',

  'tools.colorConverter.invalid': 'Invalid color value.',

  'tools.colorConverter.pickColor': 'Pick color',

  'tools.colorConverter.adjustRgb': 'RGB channels',

  'tools.colorConverter.red': 'Red channel',

  'tools.colorConverter.green': 'Green channel',

  'tools.colorConverter.blue': 'Blue channel',

  'tools.hashText.name': 'Text Hash',

  'tools.hashText.description': 'Compute SHA-1, SHA-256, SHA-384, and SHA-512 hashes of any text.',

  'tools.hashText.placeholder': 'Type or paste text to hash…',

  'tools.hashText.empty': 'Waiting for input…',

  'tools.regexTester.name': 'Regex Tester',

  'tools.regexTester.description':
    'Test regular expressions against text and see every match live.',

  'tools.regexTester.pattern': 'Pattern',

  'tools.regexTester.patternPlaceholder': 'Enter a regular expression…',

  'tools.regexTester.testText': 'Test text',

  'tools.regexTester.textPlaceholder': 'Paste text to match against…',

  'tools.regexTester.matches': 'Matches',

  'tools.regexTester.noMatch': 'No matches.',

  'tools.regexTester.at': 'at',

  'tools.regexTester.flags': 'Regex flags',

  'tools.regexTester.flag.g': 'Find all matches',

  'tools.regexTester.flag.i': 'Ignore case',

  'tools.regexTester.flag.m': 'Multiline anchors',

  'tools.regexTester.flag.s': 'Dot matches line breaks',

  'tools.regexTester.emptyMatch': 'Empty match',

  'tools.regexTester.limit':
    'Showing the first 2000 matches. Narrow the pattern or shorten the text to inspect more.',

  'tools.textDiff.name': 'Text Diff',

  'tools.textDiff.description':
    'Compare two texts line by line, highlighting additions and deletions.',

  'tools.textDiff.original': 'Original',

  'tools.textDiff.modified': 'Modified',

  'tools.textDiff.originalPlaceholder': 'Paste the original text here…',

  'tools.textDiff.modifiedPlaceholder': 'Paste the modified text here…',

  'tools.textDiff.empty': 'Enter text on both sides to see the diff.',

  'tools.textDiff.identical': 'The two texts are identical.',

  'tools.qrcode.name': 'QR Code Generator',

  'tools.qrcode.description':
    'Create configurable QR codes from text or links and download them as PNG or SVG.',

  'tools.qrcode.placeholder': 'Enter text or a URL…',

  'tools.qrcode.errorCorrection': 'Error correction',

  'tools.qrcode.size': 'Export size',

  'tools.qrcode.margin': 'Quiet zone',

  'tools.qrcode.level.L': 'Low',

  'tools.qrcode.level.M': 'Medium',

  'tools.qrcode.level.Q': 'Quartile',

  'tools.qrcode.level.H': 'High',

  'tools.qrcode.downloadPng': 'Download PNG',

  'tools.qrcode.downloadSvg': 'Download SVG',

  'tools.qrcode.alt': 'Generated QR code',

  'tools.qrcode.empty': 'The QR code will appear here.',

  'tools.unixPermission.name': 'chmod Calculator',

  'tools.unixPermission.description':
    'Compute Unix file permissions as octal and symbolic notation.',

  'tools.unixPermission.owner': 'Owner',

  'tools.unixPermission.group': 'Group',

  'tools.unixPermission.other': 'Other',

  'tools.unixPermission.read': 'Read',

  'tools.unixPermission.write': 'Write',

  'tools.unixPermission.execute': 'Execute',

  'tools.unixPermission.octal': 'Octal',

  'tools.unixPermission.symbolic': 'Symbolic',

  'tools.unixPermission.octalInput': 'Octal input',

  'tools.jwtDecoder.name': 'JWT Decoder',

  'tools.jwtDecoder.description':
    "Decode a JWT's header and payload without verifying the signature.",

  'tools.jwtDecoder.placeholder': 'Paste a JWT here…',

  'tools.jwtDecoder.header': 'Header',

  'tools.jwtDecoder.payload': 'Payload',

  'tools.jwtDecoder.signature': 'Signature',

  'tools.jwtDecoder.invalid': 'Not a valid JWT.',

  'tools.jwtDecoder.note': 'The signature is not verified.',

  'tools.totp.name': 'TOTP Generator',

  'tools.totp.description':
    'Generate time-based one-time passwords from a Base32 secret or otpauth URI.',

  'tools.totp.secret': 'Base32 secret',

  'tools.totp.secretPlaceholder': 'Enter a Base32 secret or paste an otpauth URI…',

  'tools.totp.code': 'Code',

  'tools.totp.expiresIn': 'Expires in',

  'tools.totp.seconds': 's',

  'tools.totp.invalid': 'Not a valid Base32 secret.',

  'tools.totp.empty': 'Waiting for input…',

  'tools.cssGradient.name': 'CSS Gradient',

  'tools.cssGradient.description':
    'Build a CSS linear-gradient between two colors with a live preview.',

  'tools.cssGradient.color1': 'Color 1',

  'tools.cssGradient.color2': 'Color 2',

  'tools.cssGradient.angle': 'Angle',

  'tools.cssGradient.preview': 'Preview',

  'tools.cssGradient.output': 'CSS',

  'tools.boxShadow.name': 'Box Shadow',

  'tools.boxShadow.description': 'Design a CSS box-shadow with a live preview and copyable output.',

  'tools.boxShadow.offsetX': 'Offset X',

  'tools.boxShadow.offsetY': 'Offset Y',

  'tools.boxShadow.blur': 'Blur',

  'tools.boxShadow.spread': 'Spread',

  'tools.boxShadow.color': 'Color',

  'tools.boxShadow.opacity': 'Opacity',

  'tools.boxShadow.inset': 'Inset',

  'tools.boxShadow.preview': 'Preview',

  'tools.boxShadow.output': 'CSS',

  'tools.crontabParser.name': 'Crontab Parser',

  'tools.crontabParser.description': 'Parse a 5-field cron expression into a readable schedule.',

  'tools.crontabParser.placeholder': 'e.g. */5 9-17 * * 1-5',

  'tools.crontabParser.invalid': 'Invalid cron expression.',

  'tools.crontabParser.summary': 'Summary',

  'tools.crontabParser.minute': 'Minute',

  'tools.crontabParser.hour': 'Hour',

  'tools.crontabParser.dayOfMonth': 'Day of month',

  'tools.crontabParser.month': 'Month',

  'tools.crontabParser.dayOfWeek': 'Day of week',

  'tools.metaTags.name': 'Meta Tags',

  'tools.metaTags.description':
    'Generate HTML title, description, Open Graph and Twitter card tags.',

  'tools.metaTags.titleField': 'Title',

  'tools.metaTags.descriptionField': 'Description',

  'tools.metaTags.url': 'Canonical URL',

  'tools.metaTags.image': 'Image URL',

  'tools.metaTags.siteName': 'Site name',

  'tools.metaTags.output': 'HTML',

  'tools.randomNumber.name': 'Random Number',

  'tools.randomNumber.description': 'Generate random integers within an inclusive range.',

  'tools.randomNumber.min': 'Min',

  'tools.randomNumber.max': 'Max',

  'tools.randomNumber.count': 'Count',

  'tools.randomNumber.unique': 'Unique',

  'tools.randomNumber.regenerate': 'Regenerate',

  'tools.randomNumber.output': 'Output',

  'tools.randomNumber.invalidRange': 'Enter a valid integer range (min ≤ max).',

  'tools.randomNumber.invalidCount': 'Count must be an integer from 1 to 1000.',

  'tools.randomNumber.tooManyUnique':
    'There are not enough distinct integers in this range. Reduce the count or widen the range.',

  'tools.placeholderImage.name': 'Placeholder Image',

  'tools.placeholderImage.description': 'Generate a placeholder image and export it as PNG.',

  'tools.placeholderImage.width': 'Width',

  'tools.placeholderImage.height': 'Height',

  'tools.placeholderImage.background': 'Background',

  'tools.placeholderImage.textColor': 'Text color',

  'tools.placeholderImage.text': 'Label',

  'tools.placeholderImage.download': 'Download PNG',

  'tools.placeholderImage.dataUri': 'Data URI',

  'tools.placeholderImage.preview': 'Preview',

  'tools.statistics.name': 'Statistics',

  'tools.statistics.description': 'Descriptive statistics for a list of numbers.',

  'tools.statistics.placeholder': 'Enter numbers, e.g. 4, 8, 15, 16, 23, 42…',

  'tools.statistics.varianceMode': 'Variance type',

  'tools.statistics.population': 'Population',

  'tools.statistics.sample': 'Sample',

  'tools.statistics.count': 'Count',

  'tools.statistics.sum': 'Sum',

  'tools.statistics.mean': 'Mean',

  'tools.statistics.median': 'Median',

  'tools.statistics.mode': 'Mode',

  'tools.statistics.min': 'Min',

  'tools.statistics.max': 'Max',

  'tools.statistics.range': 'Range',

  'tools.statistics.variance': 'Variance',

  'tools.statistics.stddev': 'Std. deviation',

  'tools.statistics.variancePopulation': 'Population variance',

  'tools.statistics.varianceSample': 'Sample variance',

  'tools.statistics.stddevPopulation': 'Population std. dev.',

  'tools.statistics.stddevSample': 'Sample std. dev.',

  'tools.statistics.invalid': 'Enter numbers separated by commas or spaces.',

  'tools.statistics.empty': 'Waiting for input…',

  'tools.unicodeInspector.name': 'Unicode Inspector',

  'tools.unicodeInspector.description':
    'Break text into code points with hex, decimal and UTF-8 bytes.',

  'tools.unicodeInspector.placeholder': 'Type or paste text here…',

  'tools.unicodeInspector.character': 'Character',

  'tools.unicodeInspector.codePoint': 'Code point',

  'tools.unicodeInspector.decimal': 'Decimal',

  'tools.unicodeInspector.utf8': 'UTF-8 bytes',

  'tools.unicodeInspector.empty': 'Waiting for input…',

  'tools.unicodeInspector.truncated': 'Only the first 500 code points are shown.',

  'common.reset': 'Reset',

  'common.invalidInput': 'Invalid input.',

  'common.waitingForInput': 'Waiting for input…',

  'utilityError.required': 'Please enter a value.',

  'utilityError.number': 'Please enter a valid number.',

  'utilityError.csv': 'The CSV contains an unclosed quoted field.',

  'utilityError.xml': 'The XML is invalid.',

  'utilityError.hex': 'Enter complete hexadecimal byte pairs.',

  'utilityError.base58': 'The Base58 input contains an invalid character.',

  'utilityError.width': 'Width must be a positive integer.',

  'utilityError.uuid': 'Enter a valid UUID.',

  'utilityError.ipv4': 'Enter a valid IPv4 address.',

  'utilityError.prefix': 'The CIDR prefix must be between 0 and 32.',

  'utilityError.header': 'Every HTTP header must contain a name and colon.',

  'utilityError.paths': 'Enter at least one path.',

  'utilityError.shellQuote': 'The command contains an unclosed quote or trailing escape.',

  'utilityError.dockerValue': 'A Docker option is missing its value.',

  'utilityError.dockerOption': 'The command contains an unsupported Docker option.',

  'utilityError.dockerImage': 'No Docker image was found in the command.',

  'utilityError.template':
    'Use supported templates: node, python, go, rust, macos, vscode, or jetbrains.',

  'utilityError.semver': 'Enter a valid semantic version.',

  'utilityError.fraction': 'Enter a whole number or fraction such as 3/4.',

  'utilityError.denominator': 'A fraction denominator cannot be zero.',

  'utilityError.divideZero': 'Division by zero is undefined.',

  'utilityError.coefficient': 'Coefficient a or b must be non-zero.',

  'utilityError.date': 'Choose a valid date.',

  'utilityError.birthOrder': 'The birth date cannot be after the comparison date.',

  'utilityError.bodyPositive': 'Height and weight must be positive.',

  'utilityError.loanRange': 'Enter positive loan values and a non-negative rate.',

  'utilityError.investmentRange': 'Enter valid non-negative investment values.',

  'utilityError.dimensions': 'Dimensions must be positive.',

  'tools.ipv4Subnet.name': 'IPv4 Subnet Calculator',

  'tools.ipv4Subnet.description':
    'Calculate network, mask, broadcast, usable range, and address count from CIDR.',

  'tools.ipv4Subnet.address': 'IPv4 address',

  'tools.ipv4Subnet.prefix': 'CIDR prefix',

  'tools.ipv4Subnet.network': 'Network',

  'tools.ipv4Subnet.mask': 'Subnet mask',

  'tools.ipv4Subnet.broadcast': 'Broadcast',

  'tools.ipv4Subnet.range': 'Usable range',

  'tools.ipv4Subnet.addresses': 'Total addresses',

  'tools.dockerRunToCompose.name': 'Docker Run → Compose',

  'tools.dockerRunToCompose.description':
    'Convert common docker run flags into a Compose services document.',

  'tools.dockerRunToCompose.input': 'docker run command',

  'tools.gitignoreGenerator.name': '.gitignore Generator',

  'tools.gitignoreGenerator.description':
    'Combine practical ignore templates for common stacks and editors.',

  'tools.gitignoreGenerator.stacks': 'Templates',

  'tools.gitignoreGenerator.extra': 'Additional patterns',

  'tools.cpsTest.name': 'CPS Test',

  'tools.cpsTest.description': 'Measure how many mouse clicks you can make per second.',

  'tools.cpsTest.duration': 'Test duration',

  'tools.cpsTest.result': 'Clicks per second',

  'tools.cpsTest.resultDetail': '{clicks} valid clicks recorded in this run.',

  'tools.cpsTest.again': 'Try again',

  'tools.cpsTest.startPrompt': 'Click here to start',

  'tools.cpsTest.clickPrompt': 'Keep clicking',

  'tools.cpsTest.status.ready': 'Ready for input',

  'tools.cpsTest.status.live': 'Session in progress',

  'tools.cpsTest.status.complete': 'Session complete',

  'tools.cpsTest.reportTitle': 'Performance report',

  'tools.cpsTest.rating': 'Rating',

  'tools.cpsTest.newBest': 'New personal best',

  'tools.cpsTest.replayHint': 'Quick replay',

  'tools.cpsTest.totalClicks': 'Total clicks',

  'tools.cpsTest.peakRate': 'Peak rate',

  'tools.cpsTest.consistency': 'Consistency',

  'tools.cpsTest.personalBest': 'Personal best',

  'tools.cpsTest.timeline': 'Click speed curve',

  'tools.cpsTest.sampling': '{interval} ms sampling · {duration} s',

  'tools.cpsTest.readyLabel': 'Ready',

  'tools.cpsTest.liveLabel': 'Live clicks',

  'tools.cpsTest.liveRate': 'Current rate',

  'tools.cpsTest.privacy': 'Measured locally in your browser',

  'tools.cpsTest.insight.fast':
    'Excellent burst speed. Your peak is competitive; focus on preserving the same cadence over longer sessions.',

  'tools.cpsTest.insight.steady':
    'Your cadence is notably consistent. A slightly faster first second could lift the overall score without sacrificing control.',

  'tools.cpsTest.insight.practice':
    'Your speed varies between seconds. Relax your hand and aim for an even rhythm before trying to click faster.',

  'tools.reactionTime.name': 'Reaction Time Test',

  'tools.reactionTime.description': 'Measure how quickly you respond to a changing visual signal.',

  'tools.reactionTime.startPrompt': 'Start test',

  'tools.reactionTime.wait': 'Wait for green…',

  'tools.reactionTime.now': 'Tap now!',

  'tools.reactionTime.tooSoon': 'Too soon',

  'tools.reactionTime.again': 'Tap to try again',

  'tools.reactionTime.tapHint': 'Tap or click anywhere in this panel.',

  'tools.reactionTime.instructions':
    'Start the test, wait for the panel to turn green, then respond as quickly as possible.',

  'tools.reactionTime.resultDetail':
    'Five valid rounds are averaged. False starts this run: {falseStarts}.',

  'tools.reactionTime.median': 'Median',

  'tools.reactionTime.roundResults': 'Reaction time for each round',

  'tools.reactionTime.nextRound': 'Tap to begin the next round',

  'tools.typingSpeed.name': 'Typing Speed Test',

  'tools.typingSpeed.description':
    'Measure typing speed and character-level accuracy with a short passage.',

  'tools.typingSpeed.cpm': 'CPM',

  'tools.typingSpeed.wpm': 'WPM',

  'tools.typingSpeed.accuracy': 'Accuracy',

  'tools.typingSpeed.time': 'Elapsed time',

  'tools.typingSpeed.result': 'Typing speed',

  'tools.typingSpeed.resultDetail': 'Your character accuracy was {accuracy}%.',

  'tools.typingSpeed.again': 'New passage',

  'tools.typingSpeed.prompt': 'Text to type',

  'tools.typingSpeed.placeholder': 'Start typing here…',

  'tools.typingSpeed.input': 'Typing input',

  'tools.typingSpeed.instructions':
    'Timing starts with your first character and ends when the passage length is reached.',

  'tools.typingSpeed.rawSpeed': 'Raw character speed',

  'tools.typingSpeed.corrections': 'Corrections',
} as const;

export const en = {
  ...baseEn,
  ...curatedDataEn,
  ...curatedTextEn,
  ...curatedCryptoEn,
  ...curatedWebEn,
  ...curatedCoreEn,
  ...curatedTimeUnitsEn,
  ...developmentPolishEn,
  ...randomNumberPolishEn,
  ...cryptoPolishEn,
  ...textMathPolishEn,
  ...mediaPolishEn,
} as const;

export type MessageKey = keyof typeof en;
