<div align="center">
  <h1>lailai's Tools</h1>
  <p><a href="README.md">English</a> · <strong>简体中文</strong></p>
  <p>
    <img src="https://img.shields.io/github/actions/workflow/status/lailai0916/tools/deploy.yml?style=flat-square" alt="部署状态" />
    <img src="https://img.shields.io/github/last-commit/lailai0916/tools?style=flat-square" alt="最后提交" />
    <img src="https://img.shields.io/github/languages/top/lailai0916/tools?style=flat-square" alt="主要语言" />
    <img src="https://img.shields.io/github/repo-size/lailai0916/tools?style=flat-square" alt="仓库大小" />
    <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" alt="代码风格" />
    <img src="https://img.shields.io/github/license/lailai0916/tools?style=flat-square" alt="许可证" />
  </p>
</div>

## 项目简介

[tools.lailai.one](https://tools.lailai.one) 上注重隐私的浏览器开发工具集，共有 140
项工具。网站无需账号，工具输入只在用户设备上处理；自托管、无 Cookie 的 Umami 实例仅统计
页面访问量。

## 项目特性

🧰 **140 项浏览器工具** —— 覆盖转换、文本、密码学与 Web。也包含开发、数学与生成工具。
全部使用同一份可搜索 registry。

🔒 **本地处理** —— 粘贴的文本与生成值由浏览器 API 处理。数据不提交至应用服务器。

🌐 **双语界面** —— 默认使用英文，每项工具都提供完整的简体中文界面。

⚡ **独立路由** —— 按路由拆包控制单项工具的体积。预渲染为每项工具提供可分享的真实页面。

## 快速开始

```bash
git clone https://github.com/lailai0916/tools.git
cd tools
npm install
npm run dev
```

提交改动前运行完整的本地门禁：

```bash
npm run check
npm run build
```

## 项目结构

```bash
tools/
├── design-system/                  # Tools 界面规范
├── public/                         # 静态资源
├── scripts/                        # 预渲染与部署脚本
├── src/                            # 应用源代码
│   ├── components/                 # 共享界面组件
│   ├── hooks/                      # 共享 React Hook
│   ├── i18n/                       # 中英文字典
│   ├── pages/                      # 顶层页面
│   ├── styles/                     # 全局样式与设计 token
│   └── tools/                      # 独立浏览器工具
├── index.html                      # 应用入口页面
├── package-lock.json               # 锁定的依赖关系
├── package.json                    # 脚本与依赖
├── tsconfig.json                   # TypeScript 配置
└── vite.config.ts                  # Vite 配置
```

## 添加工具

`src/tools/registry.ts` 是首页网格、路由和搜索的单一数据源。

1. 创建 `src/tools/<id>/index.tsx`，按需添加 `styles.module.css`；
2. 复用 `ToolLayout`、共享组件与 `useI18n`；
3. 在 `src/tools/registry.ts` 注册工具；
4. 在 `src/i18n/en.ts` 和 `src/i18n/zh-Hans.ts` 添加对应文案。

## 部署

推送到 `main` 后，工作流会构建并把 `dist/` 部署到由 Caddy 托管的源站。每项工具的路由
都会预渲染为 HTML 文件，因此未知路径会返回真实的 404 响应。

## 许可协议

本项目代码采用 [MIT 许可协议](https://github.com/lailai0916/tools/blob/main/LICENSE)。
