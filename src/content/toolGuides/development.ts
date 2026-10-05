import type { LocalizedToolGuide, ToolGuideKey } from './types';

export const developmentGuides = {
  jsonToTs: {
    en: {
      summary: 'Infer TypeScript declarations from a sample JSON value.',
      steps: [
        'Paste valid JSON and choose a name for the root type.',
        'Copy the generated declarations and review inferred types and optional fields.',
      ],
      example: {
        input: 'Root name: Root\n{"name":"lailai","active":true}',
        output: 'interface Root {\n  name: string;\n  active: boolean;\n}',
      },
      notes: [
        'Types are inferred from the supplied sample. Missing cases, empty arrays and future values may require manual edits; declarations do not validate data at runtime.',
      ],
    },
    'zh-Hans': {
      summary: '根据 JSON 样本推断 TypeScript 类型声明。',
      steps: ['粘贴有效 JSON，并设置根类型名称。', '复制声明，检查推断出的类型与可选字段。'],
      example: {
        input: '根类型名称：Root\n{"name":"lailai","active":true}',
        output: 'interface Root {\n  name: string;\n  active: boolean;\n}',
      },
      notes: [
        '只依据所提供的样本推断；未出现的情况、空数组及未来数据可能需要手动调整，类型声明不进行运行时验证。',
      ],
    },
  },
  cssGradient: {
    en: {
      summary: 'Preview a two-color linear gradient and generate its CSS declaration.',
      steps: [
        'Choose the two endpoint colors.',
        'Adjust the angle, inspect the preview and copy the CSS.',
      ],
      example: {
        input: 'Angle: 90°\nColors: #000000 and #ffffff',
        output: 'background: linear-gradient(90deg, #000000, #ffffff);',
      },
      notes: [
        'CSS angles start at the top: 0deg points upward and 90deg points right. The tool creates a linear gradient with two stops.',
      ],
    },
    'zh-Hans': {
      summary: '预览双色线性渐变，并生成对应 CSS 声明。',
      steps: ['选择渐变两端的颜色。', '调整角度，查看预览并复制 CSS。'],
      example: {
        input: '角度：90°\n颜色：#000000 与 #ffffff',
        output: 'background: linear-gradient(90deg, #000000, #ffffff);',
      },
      notes: ['CSS 角度从顶部起算，0deg 向上、90deg 向右；此工具生成包含两个色标的线性渐变。'],
    },
  },
  boxShadow: {
    en: {
      summary: 'Tune a single CSS box shadow with a live preview.',
      steps: [
        'Adjust horizontal and vertical offsets, blur and spread.',
        'Choose color, opacity and optional inset, then copy the declaration.',
      ],
      example: {
        input: 'X: 0; Y: 6; blur: 18; spread: 0\nColor: #000000; opacity: 0.2',
        output: 'box-shadow: 0px 6px 18px 0px rgba(0, 0, 0, 0.2);',
      },
      notes: [
        'Offsets and spread may be negative; blur cannot. The final appearance also depends on the element’s shape and surrounding background.',
      ],
    },
    'zh-Hans': {
      summary: '通过实时预览调整单层 CSS 盒阴影。',
      steps: ['调整水平、垂直偏移及模糊、扩展半径。', '选择颜色、透明度与可选内阴影，再复制声明。'],
      example: {
        input: 'X：0；Y：6；模糊：18；扩展：0\n颜色：#000000；透明度：0.2',
        output: 'box-shadow: 0px 6px 18px 0px rgba(0, 0, 0, 0.2);',
      },
      notes: ['偏移与扩展可为负数，模糊半径不能为负；最终效果还取决于元素形状及周围背景。'],
    },
  },
  colorShades: {
    en: {
      summary: 'Create lighter and darker variants of a base color.',
      steps: [
        'Choose the base color and the number of steps.',
        'Inspect the shade palette and copy individual HEX values.',
      ],
      example: {
        input: 'Base: #808080',
        output: 'Lighter variants approach #ffffff.\nDarker variants approach #000000.',
      },
      notes: [
        'Colors are produced by mixing RGB channels with white or black. Steps are not perceptually uniform and do not guarantee accessible text contrast.',
      ],
    },
    'zh-Hans': {
      summary: '为基础颜色生成更浅与更深的变体。',
      steps: ['选择基础色与阶数。', '查看色阶，复制需要的 HEX 值。'],
      example: {
        input: '基础色：#808080',
        output: '浅色逐渐接近 #ffffff。\n深色逐渐接近 #000000。',
      },
      notes: [
        '通过 RGB 通道与白色或黑色混合生成色阶；各阶视觉差异不一定均匀，也不保证文字对比度符合无障碍要求。',
      ],
    },
  },
  cssUnit: {
    en: {
      summary: 'Convert between px and rem using an explicit root font size.',
      steps: ['Set the root font size in pixels.', 'Edit px or rem to update the other value.'],
      example: {
        input: 'Root font size: 16 px\nPixels: 24',
        output: '1.5 rem',
      },
      notes: [
        'rem is relative to the document root font size. This calculator does not read the computed font size of another website or convert em units.',
      ],
    },
    'zh-Hans': {
      summary: '根据指定根字体大小，在 px 与 rem 之间换算。',
      steps: ['设置以像素为单位的根字体大小。', '编辑 px 或 rem，另一数值会同步更新。'],
      example: {
        input: '根字体大小：16 px\n像素：24',
        output: '1.5 rem',
      },
      notes: ['rem 相对于文档根字体大小；此工具不会读取其他网站的计算字体大小，也不换算 em 单位。'],
    },
  },
  crontabParser: {
    en: {
      summary: 'Explain a standard five-field cron expression field by field.',
      steps: [
        'Enter minute, hour, day of month, month and day of week, separated by spaces.',
        'Read the human-readable explanation and the breakdown of each field.',
      ],
      example: {
        input: '0 9 * * 1-5',
        output: 'Runs at 09:00 Monday through Friday.',
      },
      notes: [
        'Supports numeric fields, *, lists, ranges and steps. The actual execution time zone is configured by your scheduler; seconds, years, named months and Quartz extensions are not supported.',
      ],
    },
    'zh-Hans': {
      summary: '逐字段解释标准五字段 cron 表达式。',
      steps: ['按分钟、小时、日、月、星期顺序填写，以空格分隔。', '查看自然语言说明与各字段含义。'],
      example: {
        input: '0 9 * * 1-5',
        output: '每周一至周五 09:00 执行。',
      },
      notes: [
        '支持数字字段、*、列表、范围与步长；实际执行时区由调度器配置；不支持秒、年份、月份名称或 Quartz 扩展。',
      ],
    },
  },
  svgDataUri: {
    en: {
      summary: 'Encode SVG source as a data URI for embedding in CSS.',
      steps: [
        'Paste SVG source with opening and closing svg tags.',
        'Copy the data URI or ready-to-use background-image declaration.',
      ],
      example: {
        input: '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
        output: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'%3e%3c/svg%3e",
      },
      notes: [
        'The tool performs basic SVG detection and whitespace reduction, not full validation or sanitization. Embedded data can increase stylesheet size.',
      ],
    },
    'zh-Hans': {
      summary: '将 SVG 源码编码为可嵌入 CSS 的 data URI。',
      steps: [
        '粘贴包含开始与结束 svg 标签的源码。',
        '复制 data URI 或可直接使用的 background-image 声明。',
      ],
      example: {
        input: '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
        output: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'%3e%3c/svg%3e",
      },
      notes: [
        '仅进行基础 SVG 检测与空白压缩，不是完整验证或安全清理；内嵌数据可能增大样式表体积。',
      ],
    },
  },
  metaTags: {
    en: {
      summary: 'Draft HTML metadata for a page and its social sharing previews.',
      steps: [
        'Fill in the title, description, page URL, image URL and site name as needed.',
        'Copy the generated title, canonical, Open Graph and Twitter tags into the page head.',
      ],
      example: {
        input: 'Title: Hello\nDescription: A demo page',
        output: 'Includes:\n<title>Hello</title>\n<meta name="description" content="A demo page">',
      },
      notes: [
        'Blank fields are omitted. Use absolute URLs for page and image fields; publishing tags does not guarantee how crawlers will display or cache a preview.',
      ],
    },
    'zh-Hans': {
      summary: '为网页与社交分享预览生成 HTML 元数据草稿。',
      steps: [
        '按需填写标题、描述、页面 URL、图片 URL 与站点名称。',
        '将生成的标题、canonical、Open Graph 与 Twitter 标签复制到页面 head 中。',
      ],
      example: {
        input: '标题：Hello\n描述：A demo page',
        output: '包含：\n<title>Hello</title>\n<meta name="description" content="A demo page">',
      },
      notes: ['空字段会省略。页面与图片建议使用绝对 URL；发布标签不保证爬虫的显示或缓存行为。'],
    },
  },
  jsonSchemaGenerator: {
    en: {
      summary: 'Infer a JSON Schema draft from a sample JSON document.',
      steps: [
        'Paste the sample JSON.',
        'Inspect the generated draft 2020-12 schema, especially types, required keys and array items.',
      ],
      example: {
        input: '{"name":"lailai"}',
        output:
          'Inferred object schema:\ntype: object\nproperties.name.type: string\nrequired: ["name"]\nadditionalProperties: false',
      },
      notes: [
        'Present object keys are marked required and extra keys disallowed. A single sample cannot establish every valid value or constraint; review the schema before adopting it.',
      ],
    },
    'zh-Hans': {
      summary: '从 JSON 样本推断 JSON Schema 草稿。',
      steps: [
        '粘贴 JSON 样本。',
        '检查生成的 draft 2020-12 Schema，重点核对类型、必填键与数组项。',
      ],
      example: {
        input: '{"name":"lailai"}',
        output:
          '推断出的对象 Schema：\ntype: object\nproperties.name.type: string\nrequired: ["name"]\nadditionalProperties: false',
      },
      notes: [
        '样本中存在的对象键会标记为必填，额外键被禁止；单个样本不能覆盖全部有效值与约束，正式采用前请审阅。',
      ],
    },
  },
  sqlFormatter: {
    en: {
      summary: 'Apply basic line breaks and keyword formatting to a SQL snippet.',
      steps: [
        'Paste the SQL text.',
        'Review the formatted output before copying it into your editor.',
      ],
      example: {
        input: 'select id from users where active = 1',
        output: 'SELECT id\nFROM users\nWHERE active = 1',
      },
      notes: [
        'This is a lightweight text formatter, not a SQL parser. Whitespace in strings and comments can be affected; verify semantics for the SQL dialect you use.',
      ],
    },
    'zh-Hans': {
      summary: '为 SQL 片段添加基础换行并整理关键字格式。',
      steps: ['粘贴 SQL 文本。', '检查排版结果，再复制到编辑器中。'],
      example: {
        input: 'select id from users where active = 1',
        output: 'SELECT id\nFROM users\nWHERE active = 1',
      },
      notes: [
        '采用轻量文本规则，不是 SQL 解析器；字符串与注释中的空白可能受到影响，请按所用 SQL 方言核对语义。',
      ],
    },
  },
  cssMinifier: {
    en: {
      summary: 'Remove comments and reduce whitespace in a CSS snippet.',
      steps: ['Paste the CSS source.', 'Review the compact output and copy it.'],
      example: {
        input: 'body { color: red; margin: 0; }',
        output: 'body{color:red;margin:0}',
      },
      notes: [
        'Uses lightweight text rules rather than a full CSS parser. Review whitespace-sensitive values, strings and calc() expressions before using the result.',
      ],
    },
    'zh-Hans': {
      summary: '移除 CSS 注释并压缩空白。',
      steps: ['粘贴 CSS 源码。', '检查压缩结果并复制。'],
      example: {
        input: 'body { color: red; margin: 0; }',
        output: 'body{color:red;margin:0}',
      },
      notes: [
        '采用轻量文本规则而非完整 CSS 解析器；使用前请核对依赖空白的值、字符串与 calc() 表达式。',
      ],
    },
  },
  htmlMinifier: {
    en: {
      summary: 'Compact HTML while preserving pre, textarea, script and style blocks.',
      steps: ['Paste HTML source.', 'Review the reduced markup and copy it.'],
      example: {
        input: '<div>\n  <span>Hello</span>\n</div>',
        output: '<div><span>Hello</span></div>',
      },
      notes: [
        'Removes ordinary comments and collapses surrounding whitespace. Spaces between inline elements can affect rendering; embedded CSS and JavaScript are preserved rather than minified.',
      ],
    },
    'zh-Hans': {
      summary: '压缩 HTML，并保留 pre、textarea、script 与 style 块的内容。',
      steps: ['粘贴 HTML 源码。', '检查精简后的标记并复制。'],
      example: {
        input: '<div>\n  <span>Hello</span>\n</div>',
        output: '<div><span>Hello</span></div>',
      },
      notes: [
        '移除普通注释并合并外围空白；行内元素之间的空格可能影响显示，嵌入的 CSS 与 JavaScript 会保留，不会继续压缩。',
      ],
    },
  },
  dockerRunToCompose: {
    en: {
      summary: 'Translate a supported docker run command into a Compose YAML draft.',
      steps: [
        'Paste a docker run command with its image and supported options.',
        'Review service name, ports, environment, volumes and command in the generated YAML.',
      ],
      example: {
        input: 'docker run -d --name web -p 8080:80 nginx:alpine',
        output:
          'services:\n  web:\n    image: "nginx:alpine"\n    container_name: "web"\n    ports:\n      - "8080:80"',
      },
      notes: [
        'Supports common name, publish, env, volume and restart options; unsupported flags are rejected. It generates text only and never starts a container.',
      ],
    },
    'zh-Hans': {
      summary: '将支持的 docker run 命令转换为 Compose YAML 草稿。',
      steps: [
        '粘贴包含镜像与支持选项的 docker run 命令。',
        '检查生成 YAML 中的服务名、端口、环境变量、卷与启动命令。',
      ],
      example: {
        input: 'docker run -d --name web -p 8080:80 nginx:alpine',
        output:
          'services:\n  web:\n    image: "nginx:alpine"\n    container_name: "web"\n    ports:\n      - "8080:80"',
      },
      notes: [
        '支持常见的 name、publish、env、volume 与 restart 选项，遇到不支持的参数会报错；仅生成文本，不会启动容器。',
      ],
    },
  },
  gitignoreGenerator: {
    en: {
      summary: 'Combine common project templates into a .gitignore file.',
      steps: [
        'Enter template names such as node, python, go, rust, macos, vscode or jetbrains.',
        'Add custom rules on separate lines and copy the generated contents.',
      ],
      example: {
        input: 'Templates: node\nExtra rule: .env.local',
        output: 'Includes:\nnode_modules/\n.env.local',
      },
      notes: [
        'Use a .gitignore file in the relevant repository. Ignore rules do not stop tracking files that are already committed.',
      ],
    },
    'zh-Hans': {
      summary: '组合常见项目模板，生成 .gitignore 文件。',
      steps: [
        '输入 node、python、go、rust、macos、vscode 或 jetbrains 等模板名称。',
        '按行添加自定义规则，再复制生成的内容。',
      ],
      example: {
        input: '模板：node\n额外规则：.env.local',
        output: '包含：\nnode_modules/\n.env.local',
      },
      notes: ['需将 .gitignore 放入对应仓库；忽略规则不会自动停止跟踪已经提交的文件。'],
    },
  },
  semverCompare: {
    en: {
      summary: 'Compare two semantic version strings by precedence.',
      steps: [
        'Enter versions with three numeric parts, optionally followed by prerelease and build identifiers.',
        'Read whether the left version is lower, equal or higher.',
      ],
      example: {
        input: '1.0.0-beta.1 vs 1.0.0',
        output: '1.0.0-beta.1 < 1.0.0',
      },
      notes: [
        'A stable release ranks above its prereleases. Build metadata after + does not affect precedence; ranges such as ^1.0.0 and ~1.0.0 are not supported.',
      ],
    },
    'zh-Hans': {
      summary: '按照语义化版本优先级比较两个版本。',
      steps: [
        '输入包含三个数字部分的版本，可附预发布与构建标识。',
        '查看左侧版本小于、等于还是大于右侧版本。',
      ],
      example: {
        input: '1.0.0-beta.1 与 1.0.0',
        output: '1.0.0-beta.1 < 1.0.0',
      },
      notes: [
        '稳定版本高于其预发布版本；+ 后的构建信息不影响优先级，不支持 ^1.0.0、~1.0.0 等版本范围。',
      ],
    },
  },
  cssSpecificity: {
    en: {
      summary: 'Estimate the specificity of simple CSS selectors.',
      steps: [
        'Enter one or more selectors, separated by commas.',
        'Read the ID, class/attribute/pseudo-class and element/pseudo-element counts.',
      ],
      example: {
        input: '.card #title',
        output: '1,1,0',
      },
      notes: [
        'This is a simplified estimator. :where() contributes zero, while complex nested :is(), :not() and :has() expressions may need a standards-aware checker.',
      ],
    },
    'zh-Hans': {
      summary: '估算简单 CSS 选择器的优先级。',
      steps: ['输入选择器，多个选择器用逗号分隔。', '查看 ID、类/属性/伪类、元素/伪元素三组计数。'],
      example: {
        input: '.card #title',
        output: '1,1,0',
      },
      notes: [
        '这是简化估算器；:where() 不计优先级，复杂嵌套的 :is()、:not() 与 :has() 可能需要符合完整标准的检查器。',
      ],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
