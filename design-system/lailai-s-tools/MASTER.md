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
- Page gutters and centering come from `PageContainer`; tool reading widths are `820px` or `980px`.
- Tool grid: `repeat(auto-fill, minmax(230px, 1fr))`.
- Card gap: shared `--lk-space-3` (`12px`); section gap: `44px`.
- Primary breakpoints: `600px` and `900px`.

## Components

### Header

- `SiteHeader` and `SkipLink` own the common header layout and keyboard skip navigation.
- `LanguageButton` and `ThemeButton` share the Prispect header controls. Language state stays in Tools; appearance follows the system on load and system changes, with a temporary one-click light/dark choice through `ThemeProvider mode="system"`.
- Tools supplies its brand link, search action, language switch, and theme control; header surfaces, gutters,
  responsive brand names, spacing, and touch targets use the shared defaults.
- Show the avatar, product name, search icon, language button, and one compact theme button.
- Search, language, and theme buttons are `32px` on desktop and `44px` at widths up to `980px` or on touch devices.
- Theme changes immediately on click.
- Icon-only controls use the shared `Hint` from laikit UI through `IconButton`, `LanguageButton`, and `ThemeButton`. Supplemental text can use `Hint`; structured data points continue to use `Tooltip`.
- Do not place a segmented theme card in the header.
- Inputs, fields, selects, passwords, checkboxes, sliders, copy feedback, and errors come from laikit UI.
- `ToolLayout` uses `PageContainer`, `Stack`, and `ButtonLink`; home cards and counts use `Card`, `IconBlock`, and `Badge`.
- Single-choice modes use `Segmented`; allow the shared narrow-screen stacking behavior when labels need it.
- Action groups may wrap. Mixed field and slider rows align their labels and control centers.

### Search and Filters

- Search opens from the header icon or `⌘K`, `Ctrl+K`, and `/` on every route, following Prispect's command-menu interaction.
- Use shared `IconButton`, `Dialog`, `Input`, `ButtonLink`, and `EmptyState` components. Search stays local and derives its results from the tool registry.
- Focus the search input on open; arrow keys select a result, `Enter` opens it, and `Esc` closes the dialog and restores focus. Tool selection also updates recent tools.
- Keep favorites, recent tools, and categories on the home page without an inline search field.
- Use the shared `Segmented` with `size="sm"` and `stackAt={0}` for All / Favorites / Recent;
  keep its shared surfaces and keyboard behavior, and let it fill the row on mobile.
- Empty filtered views explain the state and provide one action that restores all tools.
- Do not wrap the complete filter area in a large card.
- Preserve filter state in the URL; existing `q` links show a removable query filter.
- Wrap category buttons onto additional rows so every choice stays visible at narrow widths.

### Tool Cards

- Keep cards equal height with a two-line description clamp.
- Separate the icon row from the title and description with `--lk-space-3`; keep text spacing at
  `--lk-space-1` and card padding at `--lk-space-4`.
- Use one Lucide icon treatment and one favorite action.
- Align the favorite button with the icon row; use `44px` touch targets on mobile and touch devices.
- Hover may change border and background only.
- Keep the entire card keyboard reachable.

## Motion

- Use shared component feedback and transition tokens.
- Animate color, opacity, and small icon movement only.
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
