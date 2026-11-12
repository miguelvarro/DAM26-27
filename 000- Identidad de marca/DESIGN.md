# Miguel Portfolio — Design System v1.1

> Source of truth for the frontend visual redesign. The objective is a restrained, distinctive developer portfolio: technical minimalism with editorial character. This document defines visual decisions; it is not permission to rewrite business logic.
>
> **v1.1 (2026-11-05):** aligned with the brand manual v2026.3. Brand orange is Forja `#FF6B00` with `#C23A00` for text; typography is Archivo + JetBrains Mono; the logo SVG is final and has a reduced variant for 16–32 px.

## 1. Art direction

- **Keywords:** precise, editorial, confident, useful, human, quietly distinctive.
- **Visual influences:** Vercel's restraint, Linear's product clarity, Swiss editorial hierarchy. Do not copy their layouts or trademarks.
- **Signature:** a geometric, one-ink M logo, controlled burnt-orange accents, strong typography, excellent spacing, real project imagery.
- **Avoid:** decorative grids, multicolour gradients, glassmorphism, glow, floating particles, excessive shadows, ubiquitous cards, random rounded pills, animation for its own sake, generic marketing copy.
- **Guiding test:** every decorative choice must support hierarchy, brand recognition, usability or information. If not, remove it.

## 2. Brand and logo

- Primary mark: **approved flat M geometry**, delivered as `mv-simbolo.svg`. It is constructed, not traced: module `x` = width of the M leg, every piece is `x` thick, gap `g = x/4` everywhere (vertical and diagonal), all angles 45°.
- Reduced variant `mv-simbolo-pequeno.svg` for 16–32 px (favicon, app icons, avatars, email signature): no side wings, one chevron, gap `x/2`. From 48 px up, use the full mark. Both tested at 16, 24, 32, 48 and 128 px.
- One solid colour per variant; no bevel, gradient, highlight, glow, shadow or pseudo-3D effects.
- Mark colour: Forja `#FF6B00` on light and dark surfaces; one-ink `#111111` on light or on Forja. Logos are exempt from text contrast rules, but Forja is never used for text on light backgrounds (2.7:1).
- Clear space: at least 0.5× the symbol height around the mark for standalone use; minimum `x` in compact UI such as an app header.
- Do not distort, crop, rotate, or add effects.
- The source SVG, not a generated raster, is the production master.

## 3. Colour tokens

### Light (default)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FAFAF8` | Page background |
| `--surface` | `#FFFFFF` | Elevated content only when useful |
| `--text` | `#111111` | Primary text |
| `--muted` | `#626262` | Secondary text (check against background) |
| `--border` | `#E7E7E4` | Dividers and subtle borders |
| `--accent` | `#FF6B00` | Forja: logo, large brand surfaces, primary button background |
| `--on-accent` | `#111111` | Text over Forja (6.6:1). White fails (2.9:1) |
| `--accent-text` | `#C23A00` | Links, coloured text, focus ring (5.2:1 on `--bg`) |

### Dark

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#111111` | Page background |
| `--surface` | `#1B1B1B` | Elevated content |
| `--text` | `#FAFAF8` | Primary text |
| `--muted` | `#A3A3A3` | Secondary text |
| `--border` | `#303030` | Dividers and subtle borders |
| `--accent` | `#FF6B00` | Forja: logo, brand surfaces, primary button background |
| `--on-accent` | `#111111` | Text over Forja (6.6:1) |
| `--accent-text` | `#FF6B00` | Links and coloured text (6.6:1 on `--bg`) |

- Never use pure orange for extended body text. Prioritise contrast; check WCAG AA: 4.5:1 for normal text, 3:1 for large text and meaningful interface graphics.
- Do not rely on colour alone for information or status.
- Keep semantic status colours separate from the brand palette only where status actually exists.

## 4. Typography

- Primary: **Archivo** (variable, Google Fonts, OFL); fallback `"Arial Narrow", system-ui, sans-serif`. Normal width for UI and body text; expanded width (`font-stretch: 118–125%`) only for short headlines and the name.
- Technical labels and code: **JetBrains Mono** (OFL); fallback `ui-monospace, SFMono-Regular, monospace`.
- Long-form reading only (articles, documentation, the brand manual): **Source Serif 4** may replace Archivo for running text. Never in UI, navigation or buttons.
- Body text: 16–18 px / 1.55–1.7; maximum readable line length roughly 65–75 characters.
- Headline: desktop `clamp(2.75rem, 6vw, 5.5rem)`, line-height 1.03–1.12, weight 550–650. Mobile `clamp(2.3rem, 10vw, 3.5rem)`.
- H2: `clamp(1.8rem, 3.3vw, 3rem)`; line-height 1.12–1.2.
- Eyebrows and small technical tags: 12–13 px, mono, slightly increased letter-spacing; avoid whole paragraphs in uppercase.
- Use no more than two font families and three major text weights per page.

## 5. Layout and spacing

- Max content width: `1120px`; readable article text: `720px` or narrower.
- Desktop: 12-column invisible layout grid; tablet: 6; mobile: 4. **Do not display the grid as a background.**
- Side gutters: mobile 20px, tablet 32px, desktop 48px (adapt to screen width).
- Spacing scale in px: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`; derive values from CSS custom properties.
- Section vertical spacing: ~96–128px desktop; 56–80px mobile, adjusted to content.
- Components must align with shared container edges; avoid arbitrary offsets and symmetrical card grids for every section.
- Use asymmetry intentionally: one strong heading column plus adjacent explanatory copy can add editorial character.

## 6. Components

### Header
- Quiet, compact brand-left / navigation-right.
- Up to four primary navigation items; visible keyboard focus; mobile menu must be keyboard accessible.
- Sticky only if it improves navigation; no floating glass panel.

### Hero
- Role + clear positioning statement + short supporting sentence + primary action to projects.
- Avoid generic claims such as 'revolutionising digital experiences'.
- A restrained typographic composition should carry the section; logo accent may be subtle.

### Project index
- Prefer editorial project rows / feature sections rather than identical cards.
- Each project must show **name, problem, your contribution, key stack, link/status**, and real screenshot if available.
- Alternate emphasis or image alignment when beneficial; maintain consistent metadata.
- Don't invent metrics, clients, features, uptime or results.

### Project detail
- Context → problem → approach → architecture/implementation → outcome → lessons.
- Make role explicit and describe use of AI tools truthfully when relevant.
- Distinguish working live demos from local demos; never claim a demo is live without verification.

### Buttons & links
- One solid primary treatment; one discreet secondary treatment; clearly visible hover/focus/disabled states.
- Default border radius 6px; allow 8px for panels only where necessary.
- Use action verbs; avoid decorative arrow icons on every piece of text.

### Surfaces
- Use solid backgrounds; 1px subtle borders when structure requires them.
- Shadows generally none; if used, very low contrast and on genuinely elevated overlays.
- Do not put every paragraph inside a card.

### Icons
- Use Lucide consistently; 18–20px for regular UI, consistent optical stroke.
- Icons support labels and should not substitute for clear wording.

## 7. Motion and interaction

- Hover / state transitions: 150–220 ms; section reveals only when genuinely additive, ~250–400 ms.
- Prefer opacity and transform; avoid scroll hijacking, parallax, dramatic 3D transitions.
- Respect `prefers-reduced-motion`; keep content accessible without animations.
- Keyboard and pointer behavior must match; visible focus indicators are mandatory.

## 8. Responsive and accessibility

- Design mobile-first at 360px, check 375, 768, 1024, 1440 widths; no horizontal overflow.
- Minimum touch targets approximately 44×44 CSS px where possible.
- Semantic HTML, heading hierarchy, labels, alt text, accessible nav, contrast validation.
- Ensure language switch/theme switch (if retained) persists appropriately and works without visual glitches.
- Use responsive image sizes, next-gen formats when appropriate, lazy loading below the fold, meaningful width/height to prevent layout shifts.

## 9. Content voice

- Spanish, professional but plainspoken; specific and concise.
- Emphasise shipping functional products, full-stack craftsmanship, and practical AI integrations.
- Describe individual responsibilities precisely; don't disguise AI assistance or inflate personal contributions.
- Prefer 'Desarrollo aplicaciones web e integraciones de IA' to unsupported superlatives.
- Current/about text must be verified with the owner before modifying biography, status or employment details.

## 10. Suggested site architecture

1. Header with compact identity and navigation.
2. Hero: positioning + selected work CTA.
3. Selected projects, visually led by actual product interfaces.
4. About / approach, concise and credible.
5. Technical capabilities grouped by actual use, not arbitrary percentage progress bars.
6. Contact / availability with clear next step.
7. Restrained footer.

Dark/light mode may be maintained, but **light is the recommended default**. Both variants must use the same spacing and visual hierarchy.

## 11. Implementation guardrails for Claude Code

1. **Audit first; don't edit until plan is presented.** Inspect frameworks, routes, components, CSS, assets, breakpoints, API calls, forms, and theme state.
2. Preserve backend, endpoints, request/response shapes, authentication, integrations, accessibility, and existing working behavior. Ask before breaking changes.
3. Create a token layer (CSS custom properties or theme configuration). No scattered magic hex colours, spacing, or radius values.
4. Refactor incrementally by page/component; use existing framework and naming conventions unless there is a strong reason to change.
5. No new dependencies without an explanation and approval.
6. Do not invent project descriptions, results, screenshots, badges or contact details.
7. Never use a stock image or AI illustration to imply a working software screenshot.
8. Run build/tests/lint available in repo. Verify navigation, interactions, forms, responsiveness, console errors and keyboard use.
9. Review actual screenshots in both themes and at mobile + desktop breakpoints. Identify visual inconsistencies and fix them, instead of declaring design finished from code inspection alone.
10. At each step report: files changed, reason, functionality preserved, visual changes, checks passed, remaining risks.

## 12. Acceptance checklist

- [ ] Distinctive, credible hierarchy without decorative AI visual clichés.
- [ ] All layout spacing uses defined tokens; edges line up.
- [ ] Colour contrast and keyboard focus checked.
- [ ] No decorative background grid, glow, gradient, or glassmorphism.
- [ ] Actual project content and images are accurate.
- [ ] Works at 360/375/768/1024/1440 px, both light and dark.
- [ ] Reduced motion supported.
- [ ] No broken routes/API integration or removed features.
- [ ] Tests/build/lint pass (or blockers explicitly documented).
- [ ] Uses `mv-simbolo.svg` from 48 px and `mv-simbolo-pequeno.svg` from 16 to 32 px.

## 13. First instruction to Claude Code

Read `DESIGN.md` completely and treat it as the source of truth for visual decisions. First AUDIT the existing frontend and return: (a) file/component map, (b) UX and visual anti-patterns, (c) proposed page layout, (d) token/component migration strategy, (e) regression risks, (f) step-by-step implementation plan. Do NOT modify code yet. Keep the existing backend, integrations, routes and functionality intact. Do not use gradients, decorative grids, glassmorphism or glow. Only after reviewing the plan will we implement the redesign incrementally.
