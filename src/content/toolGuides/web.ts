import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const webGuides = {
  urlEncode: {
    en: {
      summary: 'Percent-encode a URL component or decode percent-encoded text.',
      steps: ['Choose Encode or Decode.', 'Enter the component text and copy the result.'],
      example: {
        input: 'Encode: hello world&x=1',
        output: 'hello%20world%26x%3D1',
      },
      notes: [
        'Uses encodeURIComponent, so URL separators are escaped too. Spaces become %20; + is not decoded as a space in this tool.',
      ],
    },
    'zh-Hans': {
      summary: '对 URL 组成部分进行百分号编码或解码。',
      steps: ['选择编码或解码。', '输入组件文本，复制转换结果。'],
      example: {
        input: '编码：hello world&x=1',
        output: 'hello%20world%26x%3D1',
      },
      notes: [
        '使用 encodeURIComponent，URL 分隔符也会被转义。空格变为 %20；此工具解码时不会将 + 视为空格。',
      ],
    },
  },
  urlParser: {
    en: {
      summary: 'Break an absolute URL into its parts and query parameters.',
      steps: [
        'Paste a complete URL including its scheme, such as https://.',
        'Inspect the protocol, host, path, query and fragment fields.',
      ],
      example: {
        input: 'https://example.com/docs?q=ui#intro',
        output: 'Host: example.com\nPath: /docs\nQuery: ?q=ui\nFragment: #intro',
      },
      notes: [
        'Parsing uses the browser URL implementation and may normalize the address. The URL is inspected locally, without sending a request to it.',
      ],
    },
    'zh-Hans': {
      summary: '将绝对 URL 拆分为组成部分与查询参数。',
      steps: ['粘贴包含 https:// 等协议的完整 URL。', '检查协议、主机、路径、查询参数与片段字段。'],
      example: {
        input: 'https://example.com/docs?q=ui#intro',
        output: '主机：example.com\n路径：/docs\n查询：?q=ui\n片段：#intro',
      },
      notes: ['采用浏览器 URL 实现解析，地址可能被规范化；只在本地检查，不会向该 URL 发起请求。'],
    },
  },
  queryJson: {
    en: {
      summary: 'Convert URL query parameters into a JSON object or build a query from JSON.',
      steps: [
        'Select Query → JSON or JSON → Query.',
        'Paste the query string or a top-level JSON object and read the result.',
      ],
      example: {
        input: 'Query → JSON\ntag=ui&tag=tools&q=hello+world',
        output: '{\n  "tag": ["ui", "tools"],\n  "q": "hello world"\n}',
      },
      notes: [
        'Repeated query keys become arrays. Parsed values remain strings; JSON arrays create repeated keys, and nested objects are serialized into parameter values.',
      ],
    },
    'zh-Hans': {
      summary: '将 URL 查询参数转换为 JSON 对象，或从 JSON 构建查询串。',
      steps: ['选择查询串转 JSON 或 JSON 转查询串。', '粘贴查询串或顶层 JSON 对象，查看结果。'],
      example: {
        input: '查询串转 JSON\ntag=ui&tag=tools&q=hello+world',
        output: '{\n  "tag": ["ui", "tools"],\n  "q": "hello world"\n}',
      },
      notes: [
        '重复键会成为数组，解析后的值仍为字符串；JSON 数组会生成重复参数，嵌套对象会序列化为参数值。',
      ],
    },
  },
  basicAuth: {
    en: {
      summary: 'Build an HTTP Basic Authorization header from credentials.',
      steps: ['Enter the username and password.', 'Copy the automatically generated Basic header.'],
      example: {
        input: 'Username: user\nPassword: pass',
        output: 'Authorization: Basic dXNlcjpwYXNz',
      },
      notes: [
        'Base64 makes credentials readable, not encrypted. Use Basic authentication over HTTPS and avoid sharing the generated header.',
      ],
    },
    'zh-Hans': {
      summary: '根据用户名与密码生成 HTTP Basic Authorization 请求头。',
      steps: ['填写用户名与密码。', '复制自动生成的 Basic 请求头。'],
      example: {
        input: '用户名：user\n密码：pass',
        output: 'Authorization: Basic dXNlcjpwYXNz',
      },
      notes: ['Base64 不能隐藏凭据；Basic 认证应使用 HTTPS，不要公开生成的请求头。'],
    },
  },
  userAgentParser: {
    en: {
      summary: 'Get a quick browser, OS and device summary from a User-Agent string.',
      steps: [
        'Paste a User-Agent string or use the current browser’s value.',
        'Read the detected browser, operating system and device category.',
      ],
      example: {
        input:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        output: 'Chrome\nWindows\nDesktop',
      },
      notes: [
        'Detection uses local pattern matching. User-Agent strings can be reduced or spoofed and do not reliably identify a person or physical device.',
      ],
    },
    'zh-Hans': {
      summary: '从 User-Agent 字符串快速识别浏览器、操作系统与设备类型。',
      steps: ['粘贴 User-Agent，或使用当前浏览器的值。', '查看识别出的浏览器、系统与设备类别。'],
      example: {
        input:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        output: 'Chrome\nWindows\n桌面设备',
      },
      notes: ['采用本地模式匹配；User-Agent 可能被精简或伪造，无法可靠识别个人或实际设备。'],
    },
  },
  ipConverter: {
    en: {
      summary: 'Convert an IPv4 address to its unsigned 32-bit integer and back.',
      steps: [
        'Enter a dotted IPv4 address or an integer in its corresponding field.',
        'Read the synchronized representation.',
      ],
      example: {
        input: '192.168.1.1',
        output: '3232235777',
      },
      notes: [
        'Each IPv4 octet must be 0–255; the integer range is 0–4294967295. IPv6 and CIDR prefixes are not accepted here.',
      ],
    },
    'zh-Hans': {
      summary: '在 IPv4 地址与无符号 32 位整数之间转换。',
      steps: ['在对应输入框填写点分 IPv4 地址或整数。', '查看同步更新的另一种表示方式。'],
      example: {
        input: '192.168.1.1',
        output: '3232235777',
      },
      notes: ['IPv4 每段范围为 0–255，整数范围为 0–4294967295；此处不接受 IPv6 或 CIDR 前缀。'],
    },
  },
  mimeLookup: {
    en: {
      summary: 'Look up common filename extensions and MIME types.',
      steps: [
        'Enter an extension or MIME type in the search field.',
        'Read the matching entries in the reference table.',
      ],
      example: {
        input: '.json',
        output: 'application/json',
      },
      notes: [
        'The reference covers common types, not every registered MIME type. It does not inspect file contents or guarantee a server’s Content-Type header.',
      ],
    },
    'zh-Hans': {
      summary: '查询常见文件扩展名与 MIME 类型。',
      steps: ['在搜索框输入扩展名或 MIME 类型。', '查看参考表中的匹配项。'],
      example: {
        input: '.json',
        output: 'application/json',
      },
      notes: [
        '参考表覆盖常见类型，而非全部注册 MIME 类型；不会检查文件内容，也不保证服务器实际返回的 Content-Type。',
      ],
    },
  },
  httpStatus: {
    en: {
      summary: 'Find the meaning of common HTTP response status codes.',
      steps: ['Search by status code or a keyword.', 'Read the matching name and description.'],
      example: {
        input: '404',
        output: 'Not Found',
      },
      notes: [
        'This is a local reference. It does not send an HTTP request or diagnose the cause of a response from a particular server.',
      ],
    },
    'zh-Hans': {
      summary: '查阅常见 HTTP 响应状态码的含义。',
      steps: ['输入状态码或关键词进行搜索。', '查看对应名称与说明。'],
      example: {
        input: '404',
        output: 'Not Found',
      },
      notes: ['这是本地参考表，不会发起 HTTP 请求，也不会诊断某个服务器返回该状态的具体原因。'],
    },
  },
  punycode: {
    en: {
      summary: 'Compare an internationalized domain name with its ASCII Punycode form.',
      steps: [
        'Enter a Unicode hostname or its xn-- ASCII form.',
        'Read the corresponding representation in the other field.',
      ],
      example: {
        input: 'bücher.example',
        output: 'xn--bcher-kva.example',
      },
      notes: [
        'Enter a hostname rather than a full URL. Conversion does not check domain availability, DNS records or whether visually similar names are trustworthy.',
      ],
    },
    'zh-Hans': {
      summary: '对照国际化域名与其 ASCII Punycode 形式。',
      steps: ['输入 Unicode 主机名或以 xn-- 表示的 ASCII 主机名。', '查看另一输入框中的对应形式。'],
      example: {
        input: 'bücher.example',
        output: 'xn--bcher-kva.example',
      },
      notes: [
        '请输入主机名而非完整 URL；转换不检查域名是否可注册、DNS 记录或相似字形域名是否可信。',
      ],
    },
  },
  ipv4Subnet: {
    en: {
      summary: 'Calculate an IPv4 subnet’s network, mask, broadcast and host range.',
      steps: [
        'Enter an IPv4 address and a prefix length from 0 to 32.',
        'Read the network details and usable address range.',
      ],
      example: {
        input: '192.168.1.10 / 24',
        output:
          'Network: 192.168.1.0/24\nMask: 255.255.255.0\nBroadcast: 192.168.1.255\nHost range: 192.168.1.1–192.168.1.254\nAddresses: 256',
      },
      notes: [
        'Address count includes the whole subnet. /31 and /32 treat all addresses as usable; this tool does not configure or probe a network.',
      ],
    },
    'zh-Hans': {
      summary: '计算 IPv4 子网的网络地址、掩码、广播与主机范围。',
      steps: ['输入 IPv4 地址与 0–32 的前缀长度。', '查看子网信息及可用地址范围。'],
      example: {
        input: '192.168.1.10 / 24',
        output:
          '网络：192.168.1.0/24\n掩码：255.255.255.0\n广播：192.168.1.255\n主机范围：192.168.1.1–192.168.1.254\n地址总数：256',
      },
      notes: ['地址数量包含整个子网；/31 与 /32 将全部地址视为可用。本工具不会配置或探测网络。'],
    },
  },
  cookieParser: {
    en: {
      summary: 'Turn a Cookie request string into a JSON map.',
      steps: [
        'Paste semicolon-separated name=value pairs.',
        'Inspect the parsed names and decoded values.',
      ],
      example: {
        input: 'theme=dark; name=hello%20world',
        output: '{\n  "theme": "dark",\n  "name": "hello world"\n}',
      },
      notes: [
        'Repeated names keep the last value. This parses Cookie-style pairs, not a full Set-Cookie response with cookie attributes.',
      ],
    },
    'zh-Hans': {
      summary: '将 Cookie 请求字符串解析为 JSON 映射。',
      steps: ['粘贴用分号分隔的 name=value 内容。', '检查解析后的名称与解码后的值。'],
      example: {
        input: 'theme=dark; name=hello%20world',
        output: '{\n  "theme": "dark",\n  "name": "hello world"\n}',
      },
      notes: [
        '重复名称保留最后一个值；解析的是 Cookie 键值对，不是带完整属性模型的 Set-Cookie 响应。',
      ],
    },
  },
  httpHeadersParser: {
    en: {
      summary: 'Convert a block of HTTP headers into structured JSON.',
      steps: [
        'Paste headers with one name: value pair per line.',
        'Read the lowercase header names and their values.',
      ],
      example: {
        input: 'Content-Type: application/json\nX-Tag: ui\nX-Tag: tools',
        output: '{\n  "content-type": "application/json",\n  "x-tag": ["ui", "tools"]\n}',
      },
      notes: [
        'Repeated headers become arrays. An HTTP status line is ignored; this tool parses pasted text and does not send a request.',
      ],
    },
    'zh-Hans': {
      summary: '将 HTTP 请求头或响应头文本转换为结构化 JSON。',
      steps: ['粘贴头部文本，每行一个 name: value。', '查看小写头部名称与对应值。'],
      example: {
        input: 'Content-Type: application/json\nX-Tag: ui\nX-Tag: tools',
        output: '{\n  "content-type": "application/json",\n  "x-tag": ["ui", "tools"]\n}',
      },
      notes: ['重复头部会成为数组，HTTP 状态行会被忽略；只解析粘贴文本，不会发送请求。'],
    },
  },
  utmBuilder: {
    en: {
      summary: 'Build a campaign URL with standard UTM query parameters.',
      steps: [
        'Enter the destination URL, source, medium and campaign.',
        'Optionally add term and content, then copy the generated URL.',
      ],
      example: {
        input: 'URL: https://example.com/\nSource: newsletter\nMedium: email\nCampaign: launch',
        output: 'https://example.com/?utm_source=newsletter&utm_medium=email&utm_campaign=launch',
      },
      notes: [
        'Existing unrelated parameters and fragments are retained; matching UTM parameters are replaced. Tracking still depends on the destination analytics setup.',
      ],
    },
    'zh-Hans': {
      summary: '为活动链接添加标准 UTM 查询参数。',
      steps: [
        '填写目标 URL、来源、媒介与活动名称。',
        '按需补充关键词和内容标识，再复制生成的链接。',
      ],
      example: {
        input: 'URL：https://example.com/\n来源：newsletter\n媒介：email\n活动：launch',
        output: 'https://example.com/?utm_source=newsletter&utm_medium=email&utm_campaign=launch',
      },
      notes: [
        '保留原有无关参数与片段，替换同名 UTM 参数；是否产生统计数据仍取决于目标站点的分析配置。',
      ],
    },
  },
  robotsGenerator: {
    en: {
      summary: 'Draft a robots.txt file with crawl rules and an optional sitemap URL.',
      steps: [
        'Set the user agent and enter allowed and disallowed paths, one per line.',
        'Add a sitemap URL if needed and copy the generated file contents.',
      ],
      example: {
        input: 'User agent: *\nAllow: /\nDisallow: /admin',
        output: 'User-agent: *\nAllow: /\nDisallow: /admin',
      },
      notes: [
        'Publish the result as /robots.txt on the target site. Crawl rules are advisory and do not provide access control.',
      ],
    },
    'zh-Hans': {
      summary: '生成包含抓取规则与可选站点地图地址的 robots.txt 草稿。',
      steps: [
        '设置 User-agent，每行填写一个允许或禁止抓取的路径。',
        '按需添加站点地图 URL，复制生成的文件内容。',
      ],
      example: {
        input: 'User-agent：*\n允许：/\n禁止：/admin',
        output: 'User-agent: *\nAllow: /\nDisallow: /admin',
      },
      notes: ['需自行将结果发布到目标站点的 /robots.txt；抓取规则属于约定，不能代替访问控制。'],
    },
  },
  sitemapGenerator: {
    en: {
      summary: 'Build a simple XML sitemap from a base URL and a list of paths.',
      steps: [
        'Enter the site’s base URL and at least one path, one per line.',
        'Copy the XML sitemap and publish it on your site.',
      ],
      example: {
        input: 'Base: https://example.com/\nPaths: / and /about',
        output: 'URL entries:\nhttps://example.com/\nhttps://example.com/about',
      },
      notes: [
        'Generates loc entries only. Paths are resolved using URL rules; pages are not fetched and search-engine indexing is not guaranteed.',
      ],
    },
    'zh-Hans': {
      summary: '根据基础 URL 与路径列表生成简单的 XML 站点地图。',
      steps: [
        '填写站点基础 URL，至少输入一个路径，每行一个。',
        '复制 XML 站点地图并自行发布到站点。',
      ],
      example: {
        input: '基础 URL：https://example.com/\n路径：/ 与 /about',
        output: 'URL 条目：\nhttps://example.com/\nhttps://example.com/about',
      },
      notes: ['只生成 loc 条目；路径按 URL 规则解析，不抓取页面，也不保证搜索引擎收录。'],
    },
  },
  urlJoiner: {
    en: {
      summary: 'Resolve relative paths against a base URL.',
      steps: [
        'Enter a complete base URL.',
        'Add one relative or absolute path per line and copy the resolved URLs.',
      ],
      example: {
        input: 'Base: https://example.com/docs/\nPaths:\nguide\n/guide',
        output: 'https://example.com/docs/guide\nhttps://example.com/guide',
      },
      notes: [
        'A leading slash resolves from the host root. A trailing slash in the base matters: /docs/ is a directory, while /docs is treated as a final path segment.',
      ],
    },
    'zh-Hans': {
      summary: '按照 URL 解析规则将相对路径合并到基础 URL。',
      steps: ['填写完整的基础 URL。', '每行输入一个相对或绝对路径，再复制解析后的 URL。'],
      example: {
        input: '基础 URL：https://example.com/docs/\n路径：\nguide\n/guide',
        output: 'https://example.com/docs/guide\nhttps://example.com/guide',
      },
      notes: [
        '以 / 开头的路径从主机根目录解析；基础 URL 的末尾斜杠会影响结果：/docs/ 视为目录，/docs 视为最后一个路径段。',
      ],
    },
  },
  mailtoGenerator: {
    en: {
      summary: 'Create a mailto link with recipients and prefilled message fields.',
      steps: [
        'Enter recipients, separating multiple addresses with commas or semicolons.',
        'Add optional CC, BCC, subject and body, then copy the mailto URL.',
      ],
      example: {
        input: 'To: hello@example.com\nSubject: Hello',
        output: 'mailto:hello@example.com?subject=Hello',
      },
      notes: [
        'The link opens a configured mail client; this tool does not send email. Prefilled fields may behave differently across mail clients.',
      ],
    },
    'zh-Hans': {
      summary: '生成带收件人及预填邮件字段的 mailto 链接。',
      steps: [
        '填写收件人，多个地址可用逗号或分号分隔。',
        '按需填写抄送、密送、主题与正文，再复制 mailto URL。',
      ],
      example: {
        input: '收件人：hello@example.com\n主题：Hello',
        output: 'mailto:hello@example.com?subject=Hello',
      },
      notes: [
        '链接会交给已配置的邮件客户端处理，本工具不发送邮件；不同客户端对预填字段的支持可能不同。',
      ],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
