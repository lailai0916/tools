import type { LocalizedToolGuide } from './types';

export const curatedWebGuides = {
  urlWorkbench: {
    en: {
      summary:
        'Work on one URL across inspection, query editing, path resolution and campaign links.',
      steps: [
        'Enter an absolute URL in the shared URL field and inspect its components and query parameters.',
        'Choose Query ↔ JSON to edit the parameters, then apply the result to the same URL.',
        'Resolve a relative path or fill in campaign fields. Use the resulting URL to continue in another operation.',
      ],
      example: {
        input: 'Shared URL: https://example.com/docs/?tag=one&tag=two#section\nOperation: Inspect',
        output: 'Path: /docs/\nFragment: #section\nQuery JSON: {"tag":["one","two"]}',
      },
      notes: [
        'Query JSON values must be strings or arrays of strings. Duplicate keys are preserved; converting an interleaved query through JSON can group parameters by name.',
        'Relative paths follow browser URL resolution. A base ending in / is a directory; a base without it treats the final segment as a filename.',
        'Campaign links require HTTP or HTTPS and source, medium and campaign. Existing campaign values are replaced; blank optional fields remove their corresponding parameters.',
        'Only the selected operation is reflected in this page’s address. The URL and parameter text you enter stay in the browser.',
      ],
    },
    'zh-Hans': {
      summary: '围绕同一个 URL 检查字段、编辑参数、解析路径并生成推广链接。',
      steps: [
        '在共享 URL 中输入绝对地址，检查各字段与查询参数。',
        '选择查询参数 ↔ JSON，编辑参数后将结果应用到同一个 URL。',
        '解析相对路径或填写推广字段，将生成的 URL 回填后继续进行其他操作。',
      ],
      example: {
        input: '共享 URL：https://example.com/docs/?tag=one&tag=two#section\n操作：检查',
        output: '路径：/docs/\n片段：#section\n查询参数 JSON：{"tag":["one","two"]}',
      },
      notes: [
        '查询参数 JSON 的值必须是字符串或字符串数组；重复键会保留，交错排列的参数经过 JSON 转换后可能按名称分组。',
        '相对路径遵循浏览器 URL 解析规则；以 / 结尾的基础地址表示目录，否则最后一段会按文件名处理。',
        '推广链接要求 HTTP 或 HTTPS，并填写来源、媒介和活动名称；已有推广参数会替换，留空的可选字段会移除对应参数。',
        '页面地址只记录所选操作；输入的 URL 与参数文本只在浏览器中处理。',
      ],
    },
  },
  httpInspector: {
    en: {
      summary:
        'Inspect HTTP header and Cookie text or convert Basic authentication credentials in both directions.',
      steps: [
        'Choose Headers, Cookies or Basic Auth. Paste the relevant text; Basic Auth encoding uses separate username and password fields.',
        'Read the parsed JSON or authentication result, then copy it. Use Reverse with this result to round-trip Basic Auth.',
      ],
      example: {
        input: 'Mode: Headers\nContent-Type: application/json\nSet-Cookie: a=1\nSet-Cookie: b=2',
        output: '{\n  "content-type": "application/json",\n  "set-cookie": ["a=1", "b=2"]\n}',
      },
      notes: [
        'Header names are normalized to lowercase and repeated names become arrays. Paste header fields only: request/status lines, obsolete folded lines and malformed names are rejected.',
        'The Cookie mode accepts Cookie request-header values, not Set-Cookie response attributes. Malformed items are rejected, duplicate names become arrays and values are not percent-decoded.',
        'Basic Auth is reversible encoding, not encryption. Encoding uses UTF-8; decoding requires canonical standard Base64 and valid UTF-8. A username cannot contain a colon; passwords may.',
        'Credentials and pasted HTTP text are processed locally and are never added to the page address.',
      ],
    },
    'zh-Hans': {
      summary: '检查 HTTP 头字段与 Cookie 文本，并双向转换 Basic Auth 凭据。',
      steps: [
        '选择请求头、Cookie 或 Basic Auth，粘贴对应文本；Basic Auth 编码使用独立的用户名和密码输入框。',
        '检查解析出的 JSON 或凭据结果并复制；点击“用此结果反向转换”可继续双向处理 Basic Auth。',
      ],
      example: {
        input: '模式：请求头\nContent-Type: application/json\nSet-Cookie: a=1\nSet-Cookie: b=2',
        output: '{\n  "content-type": "application/json",\n  "set-cookie": ["a=1", "b=2"]\n}',
      },
      notes: [
        '头字段名称转换为小写，重名字段保留为数组；仅支持头字段行，请求行、状态行、旧式折叠行及格式错误的字段会报错。',
        'Cookie 模式用于 Cookie 请求头，不支持 Set-Cookie 响应属性；格式错误的项会报错，重名 Cookie 保留为数组，值不进行百分号解码。',
        'Basic Auth 是可逆编码，不是加密；编码使用 UTF-8，解码要求规范标准 Base64 与有效 UTF-8。用户名不能含冒号，密码可以。',
        '凭据与粘贴的 HTTP 文本只在本地处理，不会写入页面地址。',
      ],
    },
  },
  ipv4Subnet: {
    en: {
      summary:
        'Convert an unsigned IPv4 address and calculate its CIDR network and usable host range.',
      steps: [
        'Choose dotted IPv4, decimal, hexadecimal or binary input and enter the address.',
        'Set an integer CIDR prefix from 0 to 32. Read the converted address, mask, network, counts and usable range.',
      ],
      example: {
        input: 'Address: 192.168.1.10\nPrefix: 24',
        output:
          'Decimal: 3232235786\nHex: 0xC0A8010A\nNetwork: 192.168.1.0/24\nNetmask: 255.255.255.0\nBroadcast: 192.168.1.255\nTotal: 256; usable: 254\nRange: 192.168.1.1 – 192.168.1.254',
      },
      notes: [
        'Decimal input is unsigned, from 0 to 4294967295. Hex input may start with 0x; binary accepts 32 bits or four dot-separated 8-bit groups.',
        'A /31 follows point-to-point addressing: both addresses are usable. A /32 identifies one host. Neither has a subnet broadcast address.',
        'For prefixes 0–30, the network and broadcast addresses are excluded from the host range. The tool does not inspect routing, interface configuration or reserved address policies; IPv6 is not supported.',
      ],
    },
    'zh-Hans': {
      summary: '转换无符号 IPv4 地址，计算 CIDR 网络与可用主机范围。',
      steps: [
        '选择点分 IPv4、十进制、十六进制或二进制格式，并输入地址。',
        '设置 0 到 32 的整数 CIDR 前缀，查看地址换算、掩码、网络、地址数与可用范围。',
      ],
      example: {
        input: '地址：192.168.1.10\n前缀：24',
        output:
          '十进制：3232235786\n十六进制：0xC0A8010A\n网络：192.168.1.0/24\n掩码：255.255.255.0\n广播：192.168.1.255\n总数：256；可用：254\n范围：192.168.1.1 – 192.168.1.254',
      },
      notes: [
        '十进制使用 0 到 4294967295 的无符号数；十六进制可带 0x 前缀，二进制支持连续 32 位或四组以点分隔的 8 位。',
        '/31 按点对点链路处理，两个地址均可用；/32 表示单个主机，两者都没有子网广播地址。',
        '前缀为 0–30 时，可用主机范围排除网络地址与广播地址；工具不会检查路由、网卡配置或保留地址策略，不支持 IPv6。',
      ],
    },
  },
} as const satisfies Record<string, LocalizedToolGuide>;
