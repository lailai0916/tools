# Tools performance brief

This performance pass applies [huashu-flash](https://github.com/alchaincyf/huashu-flash) to lailai's Tools. The baseline is commit `2c10afcaf6b411cda5bbacd43f939e820865f93a`.

## Scope and invariants

- Keep the current appearance, responsive layout, tool outputs, saved preferences, accessibility, SEO fields and analytics integration.
- Keep all tool inputs in the browser. Benchmark inputs are public fixed fixtures.
- Change Tools only; preserve Home, Academy and the published UI package.
- The user previously authorized publishing, pushing and deployment. Deploy only after functional guards, required repository checks and paired measurements pass. Do not change DNS, CDN or hosting configuration.

## Core operations

| Operation                     | Route                                 | Usable endpoint                                                                 |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| Open catalogue                | `/`                                   | Tool links are interactive and search accepts input and returns matching tools. |
| Encode text                   | `/text-codec`                         | Enter `Hello` and get `SGVsbG8=` from the active Base64 encoder.                |
| Format data                   | `/data-workbench`                     | Enter JSON and get its correctly formatted representation.                      |
| Generate QR                   | `/qrcode`                             | Enter a URL and receive a nonempty QR image.                                    |
| Decode repeated HTML entities | `/text-codec?format=html&mode=decode` | A complete realistic repeated input is decoded with unchanged output.           |
| Wrap and count text           | `/text-workbench`                     | Unicode segmentation and outputs match the baseline.                            |

## Measurement

- Production builds, Chromium, fresh browser context and disabled HTTP cache on every visit.
- Fast 4G: 20 ms latency, 4 MiB/s divided by 8 downstream, 3 MiB/s divided by 8 upstream. Apply CDP throttling to all actual HTTP requests, including the local server.
- Serve both builds with identical gzip compression and HTTP behavior.
- Main viewport: 1440 × 900, English and light theme. Confirm mobile and dark appearance with guards; report any additional performance profile separately.
- At least 10 observations per variant; final A/B order alternates AB/BA in each pair. Report p50, p75 and p95 and retain failed observations rather than silently filtering them.
- No builds or parallel browser tests during measurement. Keep laboratory results separate from live/CrUX data.
- Compare real interaction endpoints; an empty React root, skeleton or input without handlers does not count as usable.

## Goal, guards and rollback

Aim to halve the main usable p75 where the baseline supports it. Retain only measured improvements whose complexity is justified. Do not promise a fixed percentage before measuring.

Run existing workbench vectors, interactive browser smoke tests, desktop/mobile screenshot comparisons, SEO parity checks and production route/status checks. Track deterministic initial JavaScript/CSS bytes and dependency graph as regression budgets; noisy timings are reported with their profile and sample count.

Deployment uses the existing GitHub Actions workflow and its exact-build public verification. Rollback restores the prior deployed commit through a revert and the same workflow.

## Skill provenance

Source: [SKILL.md](https://github.com/alchaincyf/huashu-flash/blob/master/SKILL.md), measurement protocol and playbook, read on 2026-10-06. The Node benchmark adapts the skill's Python workflow to the existing Chromium/Playwright runtime without adding a production dependency.
