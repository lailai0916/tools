<div align="center">
  <h1>lailai's Tools</h1>
  <p><a href="README.md">English</a> | 简体中文</p>
  <p>
    <img src="https://img.shields.io/github/actions/workflow/status/lailai0916/tools/deploy.yml?style=flat-square" alt="部署状态" />
    <img src="https://img.shields.io/github/last-commit/lailai0916/tools?style=flat-square" alt="最后提交" />
    <img src="https://img.shields.io/github/languages/top/lailai0916/tools?style=flat-square" alt="主要语言" />
    <img src="https://img.shields.io/github/repo-size/lailai0916/tools?style=flat-square" alt="仓库大小" />
    <img src="https://img.shields.io/github/license/lailai0916/tools?style=flat-square" alt="许可证" />
  </p>
</div>

[tools.lailai.one](https://tools.lailai.one) 上面向开发者的浏览器工具集。所有工具都在
本地浏览器中运行，不需要账号，粘贴的文本不会离开设备。页面访问量使用自托管、无
Cookie 的 Umami 统计。

## 工具

共 $76$ 个工具，分为 $7$ 类。`src/tools/registry.ts` 是单一数据源，首页网格、路由与
搜索都由它生成。

|  分类  | 数量 |                              示例                              |
| :----: | :--: | :------------------------------------------------------------: |
|  转换  | $16$ | JSON 格式化、进制、Base64、时间戳、JSON ⇄ YAML、温度与数据大小 |
|  文本  | $16$ |  大小写、正则、文本差异、统计、排序、Slug、Unicode 与摩斯电码  |
| 密码学 | $7$  |        SHA、HMAC、AES-GCM、JWT、TOTP、密码强度与 CRC-32        |
|  Web   | $9$  | URL、查询参数、Basic Auth、User-Agent、IP、MIME 与 HTTP 状态码 |
|  开发  | $8$  | JSON 转 TypeScript、CSS 渐变、阴影、单位、Crontab 与 Meta 标签 |
|  数学  | $8$  |   表达式、百分比、统计、GCD / LCM、质因数、筛法、组合与模幂    |
|  生成  | $12$ |    UUID、ULID、Nano ID、密码、随机值、二维码、MAC 与占位图     |

## 技术栈

- Vite 7、React 18 与严格模式 TypeScript。
- `react-router` 为每个工具提供可直接访问的真实路由。
- CSS Modules 与从 [lailai.one](https://lailai.one) 同步的设计 token。
- 自建轻量 i18n，默认英文，完整支持简体中文。
- 大部分工具仅使用浏览器原生 API；额外依赖仅有 `qrcode`、`diff` 与 `js-yaml`。

## 本地开发

```bash
git clone https://github.com/lailai0916/tools.git
cd tools
npm install
npm run dev
```

提交前运行：

```bash
npm run build
npm run check
```

## 添加工具

1. 在 `src/tools/<id>/index.tsx` 创建工具，需要样式时添加 `styles.module.css`；
2. 复用 `ToolLayout`、共享组件与 `useI18n`；
3. 在 `src/tools/registry.ts` 添加注册项；
4. 在 `src/i18n/en.ts` 与 `src/i18n/zh-Hans.ts` 添加等价文案。

首页、路由与搜索都从 registry 派生，不要在其他位置重复维护工具列表。

## 部署

推送到 `main` 后，工作流构建 `dist/` 并通过 rsync 发布到由 Caddy 托管的源站。每条路由
都会预渲染为真实 `.html`，未知路径返回真实 $404$，而非 soft $200$。

## 许可

采用 [MIT License](LICENSE)。
