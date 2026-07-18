# Repository instructions

## Project

`tools.lailai.one` is a privacy-respecting collection of browser-only developer utilities.
It uses Vite 7, React 18, strict TypeScript, React Router, CSS Modules, and a lightweight
English/Simplified-Chinese i18n layer. Node.js 20 or newer is required.

## Commands

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + Vite build + prerender
npm run preview
npm run check     # format + lint + typecheck
```

Run `npm run check` and `npm run build` before delivering code changes.

## Adding or changing tools

- `src/tools/registry.ts` is the single source of truth for the home grid, routes, and search.
- Add a tool under `src/tools/<id>/index.tsx`, with `styles.module.css` when needed.
- Follow an existing tool and reuse `ToolLayout`, shared components, and `useI18n`.
- Add matching messages to both `src/i18n/en.ts` and `src/i18n/zh-Hans.ts`.
- Keep tools client-side. Text and secrets entered by users must not be sent to a server.
- Preserve real per-tool routes and prerendering so unknown paths keep returning a true 404.
- Reuse existing design tokens and interaction patterns instead of introducing one-off UI.

## Agent configuration

This `AGENTS.md` file is the runtime-neutral source of repository instructions. `CLAUDE.md`
is only a compatibility import. Claude-specific launch configuration remains in
`.claude/launch.json`; durable project knowledge belongs here.
