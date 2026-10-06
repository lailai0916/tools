# Browser guard fixtures

`lucide.json` contains only the icons currently referenced by Tools and the parents of its three
legacy icon aliases. It comes from `@iconify-json/lucide` version `1.2.139`, by
[Lucide Contributors](https://github.com/lucide-icons/lucide), under the
[ISC license](https://github.com/lucide-icons/lucide/blob/main/LICENSE).

The browser guard intercepts Iconify requests with this exact response for both builds. Analytics is
replaced with an empty script. Any other external request is blocked and fails the guard. The fixture
is test input only; it is not imported into the production bundle.

`logo-provenance.json` records the source and compressed logo hashes, dimensions, original PNG
color/EXIF chunks, compression method, and byte savings. Only the embedded PNG's IDAT stream was
recompressed. The SVG layout, dimensions, and every decoded RGBA byte stayed identical. The guard
checks this pixel hash and the original color metadata for both builds in addition to page screenshots.

The guard's optional `--all-guides` mode reads the tool registry and visits every registered route in
English and Simplified Chinese. It checks HTTP 200, a populated guide, translated guide headings,
the page heading, and runtime errors, then compares the complete guide text against the baseline.
This adds no screenshots beyond the existing 14 representative views.

When the served build contains Vite's tool route manifest, the same mode also checks that each page
preloads its own tool entry, excludes unrelated tool entries, and requests each JS/CSS asset once.
The homepage and true 404 pages must contain no tool module preloads. Missing built assets fail
through their actual browser HTTP responses.
