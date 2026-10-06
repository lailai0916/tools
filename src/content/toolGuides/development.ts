import type { LocalizedToolGuide, ToolGuideKey } from './types';
export const developmentGuides = {
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
  crontabParser: {
    en: {
      summary: 'Explain a standard five-field cron expression field by field.',
      steps: [
        'Enter minute, hour, day of month, month and day of week, separated by spaces.',
        'Read the human-readable explanation and the breakdown of each field.',
      ],
      example: {
        input: '0 9 * * 1-5',
        output: 'Runs at 09:00 on Monday, Tuesday, Wednesday, Thursday, Friday.',
      },
      notes: [
        'Supports numeric fields, *, lists, ranges and positive safe-integer steps on * or a range. Scalar/step forms such as 5/2, seconds, years, named months and Quartz extensions are not supported. Your scheduler determines the time zone.',
        'Steps select values within each field, rather than fixed elapsed intervals. Following Unix Cronie semantics, date and weekday both must match if either field starts with * (including */2); otherwise either may match.',
      ],
    },
    'zh-Hans': {
      summary: '逐字段解释标准五字段 cron 表达式。',
      steps: ['按分钟、小时、日、月、星期顺序填写，以空格分隔。', '查看自然语言说明与各字段含义。'],
      example: {
        input: '0 9 * * 1-5',
        output: '每周一、周二、周三、周四、周五 09:00 执行。',
      },
      notes: [
        '支持数字字段、*、列表、范围，以及 * 或范围上的正安全整数步长；不支持 5/2 这样的单值步长、秒、年份、月份名称或 Quartz 扩展，实际时区由调度器配置。',
        '步长在字段范围内选取值，不表示固定时间间隔；遵循 Unix Cronie 规则，日期或星期字段以 * 开头时（包括 */2），两者都须匹配，否则满足其中之一即可。',
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
        'Option values must be nonempty; a following flag cannot substitute for a value. Command arguments after the image are preserved, including empty quoted arguments.',
        'The input is tokenized without executing shell variables or commands. Dollar signs are escaped as $$ in Compose so literal values and container-shell variables are not expanded on the host.',
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
        '参数值不能为空，不能用后续选项代替；镜像后的命令参数会保留，包括带引号的空参数。',
        '只拆分输入参数，不执行 shell 变量或命令；Compose 中的美元符号转义为 $$，防止字面值和容器 shell 变量被宿主机提前展开。',
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
        'Custom rules are preserved verbatim, including leading spaces and escaped trailing spaces. An all-whitespace custom field adds no section.',
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
      notes: [
        '需将 .gitignore 放入对应仓库；忽略规则不会自动停止跟踪已经提交的文件。',
        '自定义规则按原文保留，包括前导空格和转义的末尾空格；仅含空白的输入不会添加自定义段落。',
      ],
    },
  },
} as const satisfies Partial<Record<ToolGuideKey, LocalizedToolGuide>>;
