# lailai's Tools Design System

## Product Intent

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

- Header height: `56px`.
- Brand logos have no border, ring, or decorative shadow.
- Content width: `1120px` maximum.
- Desktop page padding: `24px`; mobile page padding: `16px`.
- Home search width: `520px` maximum.
- Tool grid: `repeat(auto-fill, minmax(230px, 1fr))`.
- Card gap: `10px`; section gap: `44px`.
- Primary breakpoints: `600px` and `900px`.

## Components

### Header

- Show the avatar, product name, language button, and one compact theme button.
- The theme button is `34px` visually and `44px` on mobile.
- Theme choices appear only in an anchored menu.
- Do not place a segmented theme card in the header.
- Inputs and selects use the shared control geometry, custom select chevron, and unified states.

### Search and Filters

- Search is the primary control and remains centered.
- Favorites, recent tools, and categories are secondary controls below search.
- Do not wrap the complete filter area in a large card.
- Preserve filter state in the URL.

### Tool Cards

- Keep cards equal height with a two-line description clamp.
- Use one Lucide icon treatment and one favorite action.
- Hover may change border and background only.
- Keep the entire card keyboard reachable.

## Motion

- Use `140ms` control feedback.
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
- Verify `375px`, `768px`, `1024px`, and `1440px` widths.
- Verify both themes, keyboard navigation, no horizontal overflow, and no console errors.
