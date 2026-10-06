# Repository instructions

## Project

`tools.lailai.one` is a privacy-respecting collection of browser-only developer utilities.
It uses Vite 7, React 18, strict TypeScript, React Router, CSS Modules, `@lailai0916/ui`, and a
lightweight English/Simplified-Chinese i18n layer. Node.js 20 or newer is required.

## Commands

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + Vite build + prerender
npm run preview
npm run check     # format + lint + typecheck + guides + workbench regressions
```

Run `npm run check` and `npm run build` before delivering code changes.
After building, run `npm run check:performance` to verify the initial JS/CSS ceilings in
`scripts/performance-budgets.json`. Optimization results are summarized in `perf/report.md`.
The deployment workflow checks the public homepage, entry assets, new and merged routes against
the exact build after syncing the server, and verifies retired paths return 404.

## Adding or changing tools

- `src/tools/registry.ts` is the single source of truth for the home grid, routes, and search.
- Prefer adding a related operation to an existing workspace over another catalogue entry.
  Validate conversions with known vectors; reject inputs that would be silently truncated or changed.
- Add a tool under `src/tools/<id>/index.tsx`, with `styles.module.css` when needed.
- Follow an existing tool and reuse `ToolLayout`, shared components, and `useI18n`.
- Add matching messages to both `src/i18n/en.ts` and `src/i18n/zh-Hans.ts`.
- Add a tool-specific English and Simplified-Chinese guide in `src/content/toolGuides/<category>.ts`.
  Check steps, examples and limitations against the actual tool behavior. `ToolLayout` renders the
  guide after the workspace; `npm run check:guides` checks registry coverage and complete content.
- Keep tools client-side. Text and secrets entered by users must not be sent to a server.
- Preserve real per-tool routes and prerendering so unknown paths keep returning a true 404.
  Keep merged routes in `src/tools/legacyRoutes.ts`, migrate saved IDs, and retain their search terms;
  retired tools must not leave unregistered directories or prerendered files.
- Reuse existing design tokens and interaction patterns instead of introducing one-off UI.
- Keep tool modules lazily loaded through the route map in `src/App.tsx`.

## Agent configuration

This `AGENTS.md` file is the runtime-neutral source of repository instructions. `CLAUDE.md`
is only a compatibility import. Claude-specific launch configuration remains in
`.claude/launch.json`; durable project knowledge belongs here.

Shared UI is maintained in `lailai0916/ui` and installed from npm. Import `theme.css` before
`styles.css`, use `--lk-*` tokens, and customize supported `data-lk` hooks rather than generated classes.
