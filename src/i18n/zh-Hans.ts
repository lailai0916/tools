import { curatedDataZhHans } from './curated/data';

import { curatedTextZhHans } from './curated/text';

import { curatedCryptoZhHans } from './curated/crypto';

import { curatedWebZhHans } from './curated/web';

import { curatedCoreZhHans } from './curated/core';

import type { MessageKey } from './en';
import { curatedTimeUnitsZhHans } from './curated/timeUnits';
import { developmentPolishZhHans } from './curated/developmentPolish';
import { randomNumberPolishZhHans } from './curated/randomNumberPolish';
import { cryptoPolishZhHans } from './curated/cryptoPolish';
import { textMathPolishZhHans } from './curated/textMathPolish';
import { mediaPolishZhHans } from './curated/mediaPolish';

const baseZhHans = {
  'site.title': "lailai's Tools",

  'site.tagline': '好用的开发者工具集。',

  'site.toolAvailable': '个浏览器本地工具',

  'site.toolsAvailable': '个浏览器本地工具',

  'site.openNavigation': '打开导航',

  'site.closeNavigation': '关闭导航',

  'site.toolNavigation': '工具导航',

  'site.toolCategories': '工具分类',

  'site.allTools': '全部工具',

  'site.searchPlaceholder': '搜索工具',

  'site.searchHint': '搜索工具（⌘K / Ctrl+K）',

  'site.closeSearch': '关闭搜索',

  'site.clearSearch': '清除搜索筛选',

  'site.searchResults': '搜索结果',

  'site.searchNoResultsDescription': '试试工具名称或关键词。',

  'site.searchLocal': '在本地搜索工具',

  'site.searchSelect': '选择',

  'site.searchOpen': '打开',

  'site.noResults': '没有匹配的工具。',

  'site.noResultsDescription': '可以换个关键词，或查看全部工具。',

  'site.switchLanguage': '切换语言',

  'site.themeSystem': '自动',

  'site.themeLight': '浅色',

  'site.themeDark': '深色',

  'site.viewAll': '全部',

  'site.viewFavorites': '收藏',

  'site.viewRecent': '最近',

  'site.allCategories': '全部分类',

  'site.addFavorite': '添加收藏',

  'site.removeFavorite': '取消收藏',

  'site.noFavorites': '还没有收藏',

  'site.noRecent': '还没有最近使用的工具',

  'site.emptyFavorites': '收藏的工具会显示在这里。',

  'site.emptyRecent': '打开过的工具会显示在这里。',

  'site.showAllTools': '查看全部工具',

  'site.skipToContent': '跳到主要内容',

  'site.breadcrumb': '页面路径',

  'site.home': '首页',

  'common.mode': '模式',

  'common.options': '选项',

  'common.back': '返回',

  'common.clear': '清空',

  'common.copy': '复制',

  'common.copied': '已复制',

  'common.input': '输入',

  'common.output': '输出',

  'common.show': '显示',

  'common.hide': '隐藏',

  'common.loading': '正在加载工具',

  'common.processing': '正在处理…',

  'common.processingFailed': '处理失败，请重试。',

  'guide.title': '工具指南',

  'guide.steps': '如何使用',

  'guide.example': '示例',

  'guide.notes': '注意事项',

  'guide.input': '操作或输入',

  'guide.output': '结果',

  'category.converter': '转换',

  'category.crypto': '加密',

  'category.web': '网络',

  'category.text': '文本',

  'category.development': '开发',

  'category.math': '数学',

  'category.generator': '生成',

  'category.fun': '测试',

  'fun.report': '表现报告',

  'fun.rating': '评级',

  'fun.personalBest': '个人最佳',

  'fun.newBest': '刷新个人纪录',

  'fun.replayHint': '快速重测',

  'fun.status.ready': '准备就绪',

  'fun.status.running': '测试进行中',

  'fun.status.done': '测试已完成',

  'fun.total': '总计',

  'fun.average': '平均值',

  'fun.bestRound': '最佳单次',

  'fun.accuracy': '准确率',

  'fun.mistakes': '错误',

  'fun.time': '用时',

  'fun.rounds': '轮次',

  'fun.consistency': '稳定度',

  'fun.insight': '结合详细指标复盘表现，并通过重复测试观察自己的进步。',

  'tools.baseConverter.name': '进制转换',

  'tools.baseConverter.description': '任意长度整数在二进制、八进制、十进制、十六进制之间实时互转。',

  'tools.baseConverter.binary': '二进制',

  'tools.baseConverter.octal': '八进制',

  'tools.baseConverter.decimal': '十进制',

  'tools.baseConverter.hexadecimal': '十六进制',

  'tools.baseConverter.invalid': '含有该进制不允许的字符。',

  'tools.colorConverter.name': '颜色转换',

  'tools.colorConverter.description': '在 HEX、RGB、HSL 之间实时互转、精细调色并预览颜色。',

  'tools.colorConverter.preview': '预览',

  'tools.colorConverter.invalid': '颜色值无效。',

  'tools.colorConverter.pickColor': '选择颜色',

  'tools.colorConverter.adjustRgb': 'RGB 通道',

  'tools.colorConverter.red': '红色通道',

  'tools.colorConverter.green': '绿色通道',

  'tools.colorConverter.blue': '蓝色通道',

  'tools.hashText.name': '文本哈希',

  'tools.hashText.description': '计算文本的 SHA-1、SHA-256、SHA-384、SHA-512 哈希值。',

  'tools.hashText.placeholder': '输入或粘贴要计算哈希的文本……',

  'tools.hashText.empty': '等待输入……',

  'tools.regexTester.name': '正则测试',

  'tools.regexTester.description': '用正则表达式匹配文本，实时查看每一处匹配。',

  'tools.regexTester.pattern': '正则',

  'tools.regexTester.patternPlaceholder': '输入正则表达式……',

  'tools.regexTester.testText': '测试文本',

  'tools.regexTester.textPlaceholder': '粘贴要匹配的文本……',

  'tools.regexTester.matches': '匹配结果',

  'tools.regexTester.noMatch': '无匹配。',

  'tools.regexTester.at': '位置',

  'tools.regexTester.flags': '正则标志',

  'tools.regexTester.flag.g': '匹配全部结果',

  'tools.regexTester.flag.i': '忽略大小写',

  'tools.regexTester.flag.m': '多行起止位置',

  'tools.regexTester.flag.s': '点号匹配换行',

  'tools.regexTester.emptyMatch': '空匹配',

  'tools.regexTester.limit': '仅显示前 2000 个匹配。请缩小匹配范围或缩短文本以查看其他结果。',

  'tools.textDiff.name': '文本对比',

  'tools.textDiff.description': '逐行对比两段文本，标出新增与删除的行。',

  'tools.textDiff.original': '原文',

  'tools.textDiff.modified': '修改后',

  'tools.textDiff.originalPlaceholder': '在此粘贴原文…',

  'tools.textDiff.modifiedPlaceholder': '在此粘贴修改后的文本…',

  'tools.textDiff.empty': '两侧都输入文本后显示差异。',

  'tools.textDiff.identical': '两段文本完全相同。',

  'tools.qrcode.name': '二维码生成',

  'tools.qrcode.description': '把文本或链接生成可调二维码，并下载为 PNG 或 SVG。',

  'tools.qrcode.placeholder': '输入文本或网址……',

  'tools.qrcode.errorCorrection': '容错等级',

  'tools.qrcode.size': '导出尺寸',

  'tools.qrcode.margin': '留白宽度',

  'tools.qrcode.level.L': '低',

  'tools.qrcode.level.M': '中',

  'tools.qrcode.level.Q': '较高',

  'tools.qrcode.level.H': '高',

  'tools.qrcode.downloadPng': '下载 PNG',

  'tools.qrcode.downloadSvg': '下载 SVG',

  'tools.qrcode.alt': '生成的二维码',

  'tools.qrcode.empty': '二维码将显示在这里。',

  'tools.unixPermission.name': 'chmod 计算器',

  'tools.unixPermission.description': '计算 Unix 文件权限的八进制与符号表示。',

  'tools.unixPermission.owner': '所有者',

  'tools.unixPermission.group': '组',

  'tools.unixPermission.other': '其他',

  'tools.unixPermission.read': '读',

  'tools.unixPermission.write': '写',

  'tools.unixPermission.execute': '执行',

  'tools.unixPermission.octal': '八进制',

  'tools.unixPermission.symbolic': '符号',

  'tools.unixPermission.octalInput': '八进制输入',

  'tools.jwtDecoder.name': 'JWT 解码',

  'tools.jwtDecoder.description': '解码 JWT 的头部与载荷，不校验签名。',

  'tools.jwtDecoder.placeholder': '在此粘贴 JWT……',

  'tools.jwtDecoder.header': '头部',

  'tools.jwtDecoder.payload': '载荷',

  'tools.jwtDecoder.signature': '签名',

  'tools.jwtDecoder.invalid': '不是有效的 JWT。',

  'tools.jwtDecoder.note': '未校验签名。',

  'tools.totp.name': 'TOTP 生成',

  'tools.totp.description': '根据 Base32 密钥或 otpauth URI 生成基于时间的一次性密码（TOTP）。',

  'tools.totp.secret': 'Base32 密钥',

  'tools.totp.secretPlaceholder': '输入 Base32 密钥或粘贴 otpauth URI…',

  'tools.totp.code': '验证码',

  'tools.totp.expiresIn': '剩余',

  'tools.totp.seconds': '秒',

  'tools.totp.invalid': '不是有效的 Base32 密钥。',

  'tools.totp.empty': '等待输入……',

  'tools.cssGradient.name': 'CSS 渐变',

  'tools.cssGradient.description': '在两种颜色间生成 CSS 线性渐变，并实时预览。',

  'tools.cssGradient.color1': '颜色 1',

  'tools.cssGradient.color2': '颜色 2',

  'tools.cssGradient.angle': '角度',

  'tools.cssGradient.preview': '预览',

  'tools.cssGradient.output': 'CSS',

  'tools.boxShadow.name': '盒阴影',

  'tools.boxShadow.description': '可视化设计 CSS box-shadow，实时预览并复制代码。',

  'tools.boxShadow.offsetX': '水平偏移',

  'tools.boxShadow.offsetY': '垂直偏移',

  'tools.boxShadow.blur': '模糊',

  'tools.boxShadow.spread': '扩展',

  'tools.boxShadow.color': '颜色',

  'tools.boxShadow.opacity': '不透明度',

  'tools.boxShadow.inset': '内阴影',

  'tools.boxShadow.preview': '预览',

  'tools.boxShadow.output': 'CSS',

  'tools.crontabParser.name': 'Crontab 解析器',

  'tools.crontabParser.description': '将 5 段式 cron 表达式解析为易读的执行计划。',

  'tools.crontabParser.placeholder': '例如 */5 9-17 * * 1-5',

  'tools.crontabParser.invalid': '无效的 cron 表达式。',

  'tools.crontabParser.summary': '摘要',

  'tools.crontabParser.minute': '分钟',

  'tools.crontabParser.hour': '小时',

  'tools.crontabParser.dayOfMonth': '日',

  'tools.crontabParser.month': '月',

  'tools.crontabParser.dayOfWeek': '星期',

  'tools.metaTags.name': 'Meta 标签',

  'tools.metaTags.description': '生成 HTML 标题、描述、Open Graph 与 Twitter 卡片标签。',

  'tools.metaTags.titleField': '标题',

  'tools.metaTags.descriptionField': '描述',

  'tools.metaTags.url': '规范链接',

  'tools.metaTags.image': '图片链接',

  'tools.metaTags.siteName': '站点名称',

  'tools.metaTags.output': 'HTML',

  'tools.randomNumber.name': '随机数',

  'tools.randomNumber.description': '在闭区间内生成随机整数。',

  'tools.randomNumber.min': '最小值',

  'tools.randomNumber.max': '最大值',

  'tools.randomNumber.count': '数量',

  'tools.randomNumber.unique': '不重复',

  'tools.randomNumber.regenerate': '重新生成',

  'tools.randomNumber.output': '输出',

  'tools.randomNumber.invalidCount': '数量必须是 1–1000 的整数。',

  'tools.randomNumber.tooManyUnique': '范围内没有足够多的不重复整数，请减少数量或扩大范围。',

  'tools.randomNumber.invalidRange': '请输入有效的整数范围（最小值 ≤ 最大值）。',

  'tools.placeholderImage.name': '占位图生成',

  'tools.placeholderImage.description': '生成占位图片，并导出为 PNG。',

  'tools.placeholderImage.width': '宽度',

  'tools.placeholderImage.height': '高度',

  'tools.placeholderImage.background': '背景色',

  'tools.placeholderImage.textColor': '文字颜色',

  'tools.placeholderImage.text': '文字',

  'tools.placeholderImage.download': '下载 PNG',

  'tools.placeholderImage.dataUri': 'Data URI',

  'tools.placeholderImage.preview': '预览',

  'tools.statistics.name': '描述统计',

  'tools.statistics.description': '计算一组数字的描述统计量。',

  'tools.statistics.placeholder': '输入数字，如 4, 8, 15, 16, 23, 42……',

  'tools.statistics.varianceMode': '方差类型',

  'tools.statistics.population': '总体',

  'tools.statistics.sample': '样本',

  'tools.statistics.count': '数量',

  'tools.statistics.sum': '求和',

  'tools.statistics.mean': '平均数',

  'tools.statistics.median': '中位数',

  'tools.statistics.mode': '众数',

  'tools.statistics.min': '最小值',

  'tools.statistics.max': '最大值',

  'tools.statistics.range': '极差',

  'tools.statistics.variance': '方差',

  'tools.statistics.stddev': '标准差',

  'tools.statistics.variancePopulation': '总体方差',

  'tools.statistics.varianceSample': '样本方差',

  'tools.statistics.stddevPopulation': '总体标准差',

  'tools.statistics.stddevSample': '样本标准差',

  'tools.statistics.invalid': '请输入以逗号或空格分隔的数字。',

  'tools.statistics.empty': '等待输入……',

  'tools.unicodeInspector.name': 'Unicode 检查器',

  'tools.unicodeInspector.description': '把文本拆分为码点，显示十六进制、十进制与 UTF-8 字节。',

  'tools.unicodeInspector.placeholder': '在此输入或粘贴文本……',

  'tools.unicodeInspector.character': '字符',

  'tools.unicodeInspector.codePoint': '码点',

  'tools.unicodeInspector.decimal': '十进制',

  'tools.unicodeInspector.utf8': 'UTF-8 字节',

  'tools.unicodeInspector.empty': '等待输入……',

  'tools.unicodeInspector.truncated': '仅显示前 500 个码点。',

  'common.reset': '重置',

  'common.invalidInput': '输入无效。',

  'common.waitingForInput': '等待输入……',

  'utilityError.required': '请输入内容。',

  'utilityError.number': '请输入有效数字。',

  'utilityError.csv': 'CSV 中存在未闭合的引号字段。',

  'utilityError.xml': 'XML 格式无效。',

  'utilityError.hex': '请输入完整的十六进制字节对。',

  'utilityError.base58': 'Base58 输入中含有无效字符。',

  'utilityError.width': '列宽必须是正整数。',

  'utilityError.uuid': '请输入有效的 UUID。',

  'utilityError.ipv4': '请输入有效的 IPv4 地址。',

  'utilityError.prefix': 'CIDR 前缀必须在 0 到 32 之间。',

  'utilityError.header': '每个 HTTP 头都必须包含名称和冒号。',

  'utilityError.paths': '请至少输入一个路径。',

  'utilityError.shellQuote': '命令中存在未闭合的引号或末尾转义符。',

  'utilityError.dockerValue': 'Docker 选项缺少对应的值。',

  'utilityError.dockerOption': '命令中含有暂不支持的 Docker 选项。',

  'utilityError.dockerImage': '命令中没有找到 Docker 镜像。',

  'utilityError.template': '可用模板：node、python、go、rust、macos、vscode 或 jetbrains。',

  'utilityError.semver': '请输入有效的语义化版本号。',

  'utilityError.fraction': '请输入整数或 3/4 形式的分数。',

  'utilityError.denominator': '分母不能为零。',

  'utilityError.divideZero': '不能除以零。',

  'utilityError.coefficient': '系数 a 或 b 必须至少有一个不为零。',

  'utilityError.date': '请选择有效日期。',

  'utilityError.birthOrder': '出生日期不能晚于计算日期。',

  'utilityError.bodyPositive': '身高和体重必须为正数。',

  'utilityError.loanRange': '请输入正数贷款值和非负利率。',

  'utilityError.investmentRange': '请输入有效的非负投资数值。',

  'utilityError.dimensions': '尺寸必须为正数。',

  'tools.ipv4Subnet.name': 'IPv4 子网计算器',

  'tools.ipv4Subnet.description': '根据 CIDR 计算网络、掩码、广播地址、可用范围和地址数。',

  'tools.ipv4Subnet.address': 'IPv4 地址',

  'tools.ipv4Subnet.prefix': 'CIDR 前缀',

  'tools.ipv4Subnet.network': '网络地址',

  'tools.ipv4Subnet.mask': '子网掩码',

  'tools.ipv4Subnet.broadcast': '广播地址',

  'tools.ipv4Subnet.range': '可用范围',

  'tools.ipv4Subnet.addresses': '地址总数',

  'tools.dockerRunToCompose.name': 'Docker Run 转 Compose',

  'tools.dockerRunToCompose.description': '将常见 docker run 参数转换为 Compose services 文档。',

  'tools.dockerRunToCompose.input': 'docker run 命令',

  'tools.gitignoreGenerator.name': '.gitignore 生成器',

  'tools.gitignoreGenerator.description': '组合常见技术栈和编辑器的实用忽略模板。',

  'tools.gitignoreGenerator.stacks': '模板',

  'tools.gitignoreGenerator.extra': '附加规则',

  'tools.cpsTest.name': 'CPS 手速测试',

  'tools.cpsTest.description': '测试每秒能够完成多少次鼠标点击。',

  'tools.cpsTest.duration': '测试时长',

  'tools.cpsTest.result': '每秒点击次数',

  'tools.cpsTest.resultDetail': '本轮共记录 {clicks} 次有效点击。',

  'tools.cpsTest.again': '再试一次',

  'tools.cpsTest.startPrompt': '点击此处开始',

  'tools.cpsTest.clickPrompt': '继续点击',

  'tools.cpsTest.status.ready': '等待输入',

  'tools.cpsTest.status.live': '测试进行中',

  'tools.cpsTest.status.complete': '测试已完成',

  'tools.cpsTest.reportTitle': '表现报告',

  'tools.cpsTest.rating': '评级',

  'tools.cpsTest.newBest': '刷新个人纪录',

  'tools.cpsTest.replayHint': '快速重测',

  'tools.cpsTest.totalClicks': '总点击次数',

  'tools.cpsTest.peakRate': '峰值速度',

  'tools.cpsTest.consistency': '节奏稳定度',

  'tools.cpsTest.personalBest': '个人最佳',

  'tools.cpsTest.timeline': '点击速度曲线',

  'tools.cpsTest.sampling': '约 {interval} ms 采样 · {duration} s',

  'tools.cpsTest.readyLabel': '准备就绪',

  'tools.cpsTest.liveLabel': '实时点击',

  'tools.cpsTest.liveRate': '当前速度',

  'tools.cpsTest.privacy': '全部数据仅在浏览器本地测量',

  'tools.cpsTest.insight.fast':
    '爆发速度非常出色，峰值已具备竞争力；接下来可以尝试在更长测试中维持相同节奏。',

  'tools.cpsTest.insight.steady':
    '你的点击节奏十分稳定；在不牺牲控制的前提下加快第一秒启动，可以进一步提高总成绩。',

  'tools.cpsTest.insight.practice':
    '各秒之间的速度波动较大。先放松手部、保持均匀节奏，再逐步提高点击速度。',

  'tools.reactionTime.name': '反应速度测试',

  'tools.reactionTime.description': '测量看到视觉信号变化后作出反应所需的时间。',

  'tools.reactionTime.startPrompt': '开始测试',

  'tools.reactionTime.wait': '等待绿色信号……',

  'tools.reactionTime.now': '立即点击！',

  'tools.reactionTime.tooSoon': '点早了',

  'tools.reactionTime.again': '点击重新测试',

  'tools.reactionTime.tapHint': '点击或轻触面板任意位置。',

  'tools.reactionTime.instructions': '开始后等待面板变为绿色，再尽快点击。',

  'tools.reactionTime.resultDetail': '最终成绩取五次有效反应的平均值。本轮抢点 {falseStarts} 次。',

  'tools.reactionTime.median': '中位数',

  'tools.reactionTime.roundResults': '各轮反应时间',

  'tools.reactionTime.nextRound': '点击开始下一轮',

  'tools.typingSpeed.name': '打字速度测试',

  'tools.typingSpeed.description': '通过一段短文测量打字速度与逐字准确率。',

  'tools.typingSpeed.cpm': '字/分',

  'tools.typingSpeed.wpm': '词/分',

  'tools.typingSpeed.accuracy': '准确率',

  'tools.typingSpeed.time': '已用时间',

  'tools.typingSpeed.result': '打字速度',

  'tools.typingSpeed.resultDetail': '本轮逐字准确率为 {accuracy}%。',

  'tools.typingSpeed.again': '更换短文',

  'tools.typingSpeed.prompt': '需要输入的文本',

  'tools.typingSpeed.placeholder': '从这里开始输入……',

  'tools.typingSpeed.input': '打字输入框',

  'tools.typingSpeed.instructions': '输入第一个字符时开始计时，达到短文长度时结束。',

  'tools.typingSpeed.rawSpeed': '原始字符速度',

  'tools.typingSpeed.corrections': '修正次数',
} as const;

export const zhHans: Record<MessageKey, string> = {
  ...baseZhHans,
  ...curatedDataZhHans,
  ...curatedTextZhHans,
  ...curatedCryptoZhHans,
  ...curatedWebZhHans,
  ...curatedCoreZhHans,
  ...curatedTimeUnitsZhHans,
  ...developmentPolishZhHans,
  ...randomNumberPolishZhHans,
  ...cryptoPolishZhHans,
  ...textMathPolishZhHans,
  ...mediaPolishZhHans,
};
