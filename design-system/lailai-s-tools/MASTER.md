# lailai's Tools Design System

## Product Intent

laikit UI, extracted from lailai's Home, is the visual source of truth. Tools imports its components directly and keeps app CSS for content arrangement, domain-specific visualizations, and game surfaces. Existing shared components use their defaults.

Tools is a compact browser utility collection. The interface should disappear behind the task:
find a tool, complete one operation, and leave. Preserve the original product's quiet density.

## Visual Direction

- Use the system font stack and the existing blue accent.
- Keep the page flat, neutral, and content-first.
- Use solid backgrounds, fine separators, and restrained radii.
- Do not use gradients, translucent cards, oversized headings, or decorative illustrations.
- Do not move or lift whole cards on hover.
- Keep light, dark, and system themes visually equivalent.

## Layout

- Header height comes from `SiteHeader` and `--lk-header-height`.
- Brand appearance comes from the shared `Brand` component.
- Content width: `1120px` maximum.
- Page gutters and centering come from one outer `PageContainer`; every tool uses the same content edge.
- Catalogue grid: `repeat(auto-fill, minmax(min(100%, 300px), 1fr))`, with one column on mobile/touch.
- Catalogue gap: shared `--lk-space-3` (`12px`); section gap: `--lk-space-10` (`40px`).
- Main top spacing is `32px` on desktop and `24px` on mobile. Headings are `24–28px` with a concise description.
- The header spans the full viewport width. Desktop uses a persistent `224px` left sidebar below it,
  following Prispect's navigation layout.
- At `980px` and below, navigation opens in a left drawer and the header shows the brand and menu button.
- Primary breakpoints: `600px` and `980px`.

## Components

### Header

- `SiteHeader` and `SkipLink` own the common header layout and keyboard skip navigation.
- `LanguageButton` and `ThemeButton` share the Prispect header controls. Language state stays in Tools; appearance follows the system on load and system changes, with a temporary one-click light/dark choice through `ThemeProvider mode="system"`.
- The brand always belongs to the header; omit the current-view/tool context label. Keep the brand on
  the left and group search, language, theme, and the mobile menu on the right, following Prispect.
  Keep the title on one line and hide it only when the brand's available space is `8.5rem` or less.
- Header gutters are `24px` on desktop, `18px` at widths up to `980px`, and `12px` at widths up to
  `480px`; respect horizontal safe-area insets. Action gaps are `8px`, `2px` on mobile/touch devices,
  and `0px` at widths up to `640px`. Keep the shared button visuals and header height.
- The mobile menu and drawer close controls also use `IconButton variant="header"`.
- Search, language, and theme buttons are `32px` on desktop and `44px` at widths up to `980px` or on touch devices.
- Search uses `IconButton variant="header"`, the same base primitive as the language and theme controls, including borders, icon strokes, focus and press feedback.
- Theme changes immediately on click.
- Icon-only controls use the shared `Hint` from laikit UI through `IconButton`, `LanguageButton`, and `ThemeButton`. Supplemental text can use `Hint`; structured data points continue to use `Tooltip`.
- Do not place a segmented theme card in the header.
- Inputs, fields, selects, passwords, checkboxes, sliders, copy feedback, and errors come from laikit UI.
- `ToolLayout` composes `Stack`, `ButtonLink`, `Panel`, and `PanelBody` into a consistent tool workspace.
  It includes category breadcrumbs and the same favorite action as the catalogue.
- Catalogue cards use `Panel`, muted `IconBlock`, and `Badge`, with a flat border and no elevation.
- Single-choice modes, quantities, and test settings use the shared `Segmented`. Short groups remain
  horizontal; longer groups wrap into a grid on narrow containers. Long labels may use supported stacking.
- Action groups may wrap. Mixed field and slider rows align their labels and control centers.

### Search and Filters

- Search opens from the header icon or `⌘K`, `Ctrl+K`, and `/` on every route, following Prispect's command-menu interaction.
- Use shared `IconButton`, `Dialog`, `Input`, `ButtonLink`, and `EmptyState` components. Search stays local and derives its results from the tool registry.
- Focus the search input on open; arrow keys select a result, `Enter` opens it, and `Esc` closes the dialog and restores focus. Tool selection also updates recent tools.
- Keep All tools, Favorites, Recent, and eight tool categories in one sidebar navigation on every route.
- Compose links with shared `ButtonLink`, `Icon`, and theme tokens. Mark the selected view with
  `aria-current="page"`; on individual tool routes, mark its category with `aria-current="location"`.
- A fine separator divides saved views from tool categories, in both the sidebar and mobile drawer.
- All tools, Favorites, and Recent show counts; saved counts and card state share a reactive storage source.
  Update immediately after starring or opening a tool, across browser tabs, and in memory if storage is blocked.
- Keep `Copyright © 2026 lailai` at the bottom of the sidebar/drawer, linking lailai to `https://lailai.one`.
- The `fun` category is labelled Tests / 测试; its registry key and URLs stay stable.
- Page titles do not have a visible browser-only-tool count subtitle.
- Category counts derive from the registry. Selecting a category shows only its tools; Favorites and
  Recent show a single grid, with recent tools ordered by most recently opened.
- Compose the mobile drawer with shared `Dialog`. Trap focus, lock background scrolling, support Escape
  and backdrop dismissal, restore the trigger on close, and focus main content after a selection.
- Close the drawer on browser history navigation or when resizing to desktop.
- Empty filtered views explain the state and provide one action that restores all tools.
- Do not wrap the complete filter area in a large card.
- Preserve filter state in the URL; existing `q` links show a removable query filter.
- Category and view links are real URLs, preserving refresh, browser history, and opening in a new tab.
- Switching categories resets the saved view; switching saved views resets the category. Preserve legacy
  query filters until explicitly cleared, and continue accepting combined category/view links.
- The sidebar and drawer navigation scroll independently on short screens; mobile rows are at least `44px`.

### Tool Cards

- Keep cards equal height with a two-line description clamp and a `112px` minimum height.
- Place the `40px` icon beside the title and description, with a `12px` gap and `16px` card padding.
- Reserve a separate `44px` strip for the favorite action so its target cannot cover the link text.
- Use one Lucide icon treatment and one favorite action.
- Align the favorite button with the icon; use `44px` touch targets on mobile and touch devices.
- Hover may change border and background only.
- Keep the entire card keyboard reachable.

### Tool Workspaces

- `ToolGrid`, `ToolPane`, and `ToolResults` are Tools-specific compositions; primitive control styles
  continue to come from laikit UI. Tool CSS composes their layout rules instead of repeating them.
- Normal workspaces use a shared `Panel` with `24px` padding, reduced to `16px` below `560px` of content width.
- Pair input and output panes in a two-column grid with a `24px` gap; stack below `760px` of content width.
  Use container queries so the persistent sidebar is included in available-space calculations.
- Pane headings and their clear/reset/copy actions share one header row. Errors stay beside the relevant input.
- Code/text editors start at `240px`, or `176px` in narrow workspaces; single-line values use explicit rows or `TextField`.
- Calculation results use a single flat list with fine row separators, wrapping long values and stacking
  labels on narrow screens. Copy continues to return the original computed string.
- Domain previews, permission grids, and diff highlighting retain their meaningful specialized content.
  QR downloads use shared `ButtonLink` controls; text/code fields use the shared monospace setting.

### Test Workspaces

- Settings use shared `Segmented` inside a disabled fieldset during a run. Use the same borders,
  typography, spacing, and theme tokens as utility workspaces.
- Render full-size interaction boards with visible waiting, active, correct, incorrect, and completed states.
  Grid boards retain usable cells and scroll locally when a chosen grid cannot fit.
- Metrics, progress, charts, and reports stay flat. Pointer timing remains immediate, and applicable
  native game buttons also accept keyboard activation without double-counting pointer clicks.
- Ordinary actions use shared `Button`; game surfaces and stimulus colors are domain-specific.

## Motion

- Use shared component feedback and transition tokens.
- Animate color, opacity, and small icon movement; the navigation drawer may enter with a subtle horizontal slide.
- Press feedback may use `scale(0.92–0.98)` on the control itself.
- Respect `prefers-reduced-motion` globally.

## Copy

- English is the source language; Simplified Chinese mirrors every key.
- Labels name the operation directly.
- Descriptions explain input and output in one sentence.
- Avoid promotional copy, instructions that restate visible controls, and personality text.

## Accessibility and QA

- Text contrast must meet WCAG AA.
- Every control needs a visible focus state and accessible name.
- Mobile touch targets must be at least `44px`.
- Verify `320px`, `375px`, `768px`, `1024px`, and `1440px` widths in English and Simplified Chinese.
- Verify both themes, keyboard navigation, no horizontal overflow, and no console errors.
- Inspect screenshots and measure card spacing, equal heights, and icon alignment; include populated,
  empty, and filtered views. Overflow checks alone do not verify the layout.
