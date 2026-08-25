<div align="center">
  <h1>lailai's Tools</h1>
  <p><strong>English</strong> · <a href="README.zh-Hans.md">简体中文</a></p>
  <p>
    <img src="https://img.shields.io/github/actions/workflow/status/lailai0916/tools/deploy.yml?style=flat-square" alt="deployment" />
    <img src="https://img.shields.io/github/last-commit/lailai0916/tools?style=flat-square" alt="last commit" />
    <img src="https://img.shields.io/github/languages/top/lailai0916/tools?style=flat-square" alt="top language" />
    <img src="https://img.shields.io/github/repo-size/lailai0916/tools?style=flat-square" alt="repo size" />
    <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" alt="code style" />
    <img src="https://img.shields.io/github/license/lailai0916/tools?style=flat-square" alt="license" />
  </p>
</div>

## Project Introduction

A privacy-respecting collection of 140 browser-based developer tools at
[tools.lailai.one](https://tools.lailai.one). No account is required, and tool inputs stay
on the user's device. A self-hosted, cookieless Umami instance counts page views.

## Project Features

🧰 **140 browser tools** — conversion, text, cryptography, Web, development, maths and
generation utilities share one searchable registry.

🔒 **Local processing** — pasted text and generated values are handled by browser APIs
instead of being submitted to an application server.

🌐 **Bilingual interface** — English is the default language and every tool includes a
Simplified Chinese interface.

⚡ **Direct routes** — route-level code splitting keeps individual tools lightweight, and
prerendering gives every tool a real shareable page.

## Getting Started

```bash
git clone https://github.com/lailai0916/tools.git
cd tools
npm install
npm run dev
```

Run the complete local gate before submitting changes:

```bash
npm run check
npm run build
```

## Project Structure

```bash
tools/
├── design-system/                  # Tools interface specification
├── public/                         # Static assets
├── scripts/                        # Prerendering and deployment scripts
├── src/                            # Application source
│   ├── components/                 # Shared interface components
│   ├── hooks/                      # Shared React hooks
│   ├── i18n/                       # English and Chinese dictionaries
│   ├── pages/                      # Top-level pages
│   ├── styles/                     # Global styles and design tokens
│   └── tools/                      # Individual browser tools
├── index.html                      # Application entry page
├── package-lock.json               # Locked dependency graph
├── package.json                    # Scripts and dependencies
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite configuration
```

## Adding a Tool

The registry at `src/tools/registry.ts` is the single source for the home grid, routes and
search.

1. Create `src/tools/<id>/index.tsx` and an optional `styles.module.css`.
2. Reuse `ToolLayout`, shared components and `useI18n`.
3. Add the tool to `src/tools/registry.ts`.
4. Add matching copy to `src/i18n/en.ts` and `src/i18n/zh-Hans.ts`.

## Deployment

Pushing to `main` builds and deploys `dist/` to the Caddy origin server. Every tool route
is prerendered to an HTML file so unknown paths return a real 404 response.

## License

This project's code is licensed under [MIT License](https://github.com/lailai0916/tools/blob/main/LICENSE).
