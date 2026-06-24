---
name: design-taste-frontend
description: Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.
source: https://raw.githubusercontent.com/Leonxlnx/taste-skill/main/skills/taste-skill/SKILL.md
---

# tasteskill: Anti-Slop Frontend Skill

> Landing pages, portfolios, and redesigns. Not dashboards, not data tables, not multi-step product UI.
> Every rule below is contextual. First read the brief, then pull only what fits.

## 0. Brief inference

Before touching code or tweaking design values, infer what the user actually wants.

Read these signals first:

1. Page kind: landing, portfolio, redesign, editorial, blog.
2. Vibe words: minimalist, calm, Linear-style, Awwwards, brutalist, premium consumer, Apple-y, playful, serious B2B, editorial, agency-y, glassy, dark tech.
3. References: URLs, screenshots, named products, named competitors.
4. Audience: B2B procurement, design-conscious consumer, recruiter, public-sector user, etc.
5. Existing brand assets: logo, colors, type, photography, current UI.
6. Quiet constraints: accessibility, regulated industries, trust-first commerce, kids' products.

Before generating UI code, state a one-line design read:

> Reading this as: `<page kind>` for `<audience>`, with a `<vibe>` language, leaning toward `<design system or aesthetic family>`.

If the brief is ambiguous, ask exactly one clarifying question. Do not ask a multi-question dump.

Avoid LLM defaults: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism everywhere, infinite-loop micro-animations everywhere, Inter + slate-900.

## 1. Three dials

Set these after the design read:

- `DESIGN_VARIANCE: 8` — 1 = perfect symmetry, 10 = artsy chaos.
- `MOTION_INTENSITY: 6` — 1 = static, 10 = cinematic / physics.
- `VISUAL_DENSITY: 4` — 1 = airy gallery, 10 = cockpit / packed data.

Baseline: `8 / 6 / 4`. Override from the brief, not by asking the user to edit this file.

### Dial inference

- Minimalist / clean / calm / editorial / Linear-style: variance 5-6, motion 3-4, density 2-3.
- Premium consumer / Apple-y / luxury / brand: variance 7-8, motion 5-7, density 3-4.
- Playful / wild / Dribbble / Awwwards / experimental / agency: variance 9-10, motion 8-10, density 3-4.
- Landing page / portfolio / marketing site default: variance 7-9, motion 6-8, density 3-5.
- Trust-first / public-sector / regulated / accessibility-critical: variance 3-4, motion 2-3, density 4-5.
- Redesign preserve: match existing variance and density, motion +1.
- Redesign overhaul: variance +2, motion +2, density match existing.

## 2. Design system map

Use official packages when the brief maps to an established design system:

- Microsoft / enterprise SaaS: Fluent UI.
- Google-ish / Material product: Material 3.
- IBM-style enterprise analytics: Carbon.
- Shopify admin: Polaris.
- Atlassian / Jira-style product: Atlassian Design System.
- GitHub-style developer/community page: Primer.
- UK public sector: GOV.UK Frontend.
- US public sector: USWDS.
- Fast local-business / agency MVP: Bootstrap.
- Modern accessible React foundation: Radix Themes.
- Modern owned-component SaaS: shadcn/ui, customized and never default-looking.
- Tailwind-based modern SaaS / AI marketing: Tailwind utilities with dark variants.

Use one system per project. Do not mix design systems.

For aesthetics that are not systems, be honest and implement with native CSS, Tailwind, and maintained component libraries:

- Glassmorphism: backdrop-filter, layered borders, highlights, reduced-transparency fallback.
- Bento: CSS Grid with mixed cell sizes.
- Brutalism: native CSS, monospace, raw borders.
- Editorial: typography, asymmetric grid, generous whitespace.
- Dark tech: mono, restrained neon, terminal motifs.
- Aurora / mesh gradients: SVG or layered radial gradients.
- Kinetic typography: CSS animations, scroll-driven animation, GSAP only when justified.
- Apple Liquid Glass: web approximation only; there is no official web `liquid-glass.css`.

## 3. Architecture and conventions

Unless the design read selects a real design system:

- Prefer React or Next.js.
- In Next.js, default to Server Components.
- Put global state providers in explicit client components.
- Isolate components using Motion, scroll listeners, pointer physics, or browser APIs as client-component leaves.
- Prefer Tailwind v4 unless the existing project requires otherwise.
- For Tailwind v4, use `@tailwindcss/postcss` or the Vite plugin, not the old `tailwindcss` PostCSS plugin.
- Prefer Motion via `motion/react` for new animation work.
- Use `next/font` or self-host fonts with `font-display: swap`; do not production-link Google Fonts via `<link>`.
- Use local state for isolated UI only.
- Never use React state for continuous pointer, scroll, or physics values; use Motion values or equivalent.
- Check `package.json` before importing third-party libraries.

### Icons and emoji

- Preferred icon libraries: `@phosphor-icons/react`, `hugeicons-react`, `@radix-ui/react-icons`, `@tabler/icons-react`.
- Avoid `lucide-react` unless the project already uses it or the user asks for it.
- Do not hand-roll SVG icons.
- Use one icon family per project.
- Avoid emoji in code, markup, and visible UI text unless the requested vibe explicitly calls for it.

### Responsiveness

- Standard breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536.
- Contain page layouts with `max-w-[1400px] mx-auto` or `max-w-7xl`.
- Do not use `h-screen` for full-height hero sections; use `min-h-[100dvh]`.
- Prefer CSS Grid over flexbox percentage math.
- Explicitly define mobile collapse behavior for every multi-column layout.

## 4. Design engineering directives

### Typography

- Headlines default around `text-4xl md:text-6xl tracking-tighter leading-none` unless the brief says otherwise.
- Body text default around `text-base leading-relaxed max-w-[65ch]` with appropriate contrast.
- Do not default to Inter. Prefer Geist, Outfit, Cabinet Grotesk, Satoshi, or brand-appropriate fonts first.
- Inter is acceptable for neutral, standard, Linear-style, public-sector, or accessibility-first UI.
- Serif is strongly discouraged as a default. Use serif only when the brief names one or clearly calls for editorial, luxury, publication, manuscript, heritage, or vintage language.
- Do not insert a random serif word inside a sans headline just for visual interest; use italic or bold in the same family.
- Avoid defaulting to Fraunces or Instrument Serif.
- If italic display text includes descenders, ensure line-height and padding prevent clipping.

### Color

- Use at most one accent color.
- Avoid automatic AI purple / blue glow aesthetics.
- Keep one palette per project.
- Once an accent is chosen, use it consistently across the whole page.
- Do not default premium-consumer briefs to warm beige/cream + brass/clay/oxblood/ochre + espresso text.
- Rotate premium alternatives such as cold luxury, forest, black and tan, cobalt plus cream, terracotta plus slate, olive plus brick, or monochrome plus one saturated pop.

### Layout

- Avoid centered hero sections when `DESIGN_VARIANCE > 4`; prefer split, left-aligned, asymmetric, or scroll-structured layouts.
- Centered heroes are acceptable for editorial, manifesto, or launch-announcement briefs where the message itself is the design.
- Use cards only when elevation communicates hierarchy; otherwise use lines, grouping, or whitespace.
- Pick one radius system and stick to it.
- Navigation must render on one line on desktop and stay under roughly 80px high.
- Bento grids need rhythm and exactly as many cells as content requires.
- Avoid repeating the same section layout family across a page.
- Limit zigzag image/text alternation to two sections in a row.
- Use eyebrows sparingly: at most one eyebrow per three sections.
- Avoid split section headers by default; stack headline and explanation unless a real composition requires the split.
- Feature grids and bentos need real visual variation, not six white text cards.

### Interactive states

Always account for:

- Loading states.
- Empty states.
- Error states.
- Focus states.
- Active/tactile feedback.
- Button contrast.
- Form contrast.
- CTA labels fitting on one line at desktop.
- No duplicate CTA intent on the same page.

Forms should use labels above inputs, helper text when needed, errors below inputs, and never placeholder-as-label.

### Hero discipline

- Hero content must fit in the initial viewport.
- Desktop headline should usually be at most two lines.
- Subtext should be concise, ideally no more than 20 words and 3-4 lines.
- CTAs should be visible without scrolling.
- Hero top padding should not float content halfway down the viewport.
- Hero text stack should have at most four elements: optional eyebrow/brand strip, headline, subtext, CTAs.
- Move trust strips, pricing teasers, feature bullets, and logo walls below the hero.

### Visual assets

Landing pages and portfolios need real visuals.

Priority:

1. Use available image-generation tools for section-specific assets when appropriate.
2. Use real web images or stable placeholders when generation is unavailable.
3. If neither is possible, leave clearly labeled placeholders and tell the user what images are needed.

Avoid div-based fake screenshots. Use real screenshots, generated images, real component previews, editorial photography, or no preview.

Logo walls should use logos only, with accessible alt text. Do not add category labels under logos.

### Copy and content density

- Cut ruthlessly.
- A section should usually have a short headline, short paragraph, and one visual or CTA.
- Avoid data-dump sections.
- Long lists need better UI than plain bullets or endless divided rows.
- Do not fake precise numbers unless they come from real data or are clearly labeled mock/sample.
- Use one copy register per page.
- Before finishing, re-read every visible string and rewrite broken, unclear, hallucinated, or overly cute AI copy.
- Quotes should be short enough to scan, with proper attribution.
- Avoid em-dashes as stylistic filler in UI copy.

## 5. Motion

Motion must be motivated. Before adding animation, ask what it communicates: hierarchy, storytelling, feedback, or state transition.

- Honor `prefers-reduced-motion` for any meaningful motion.
- Animate only transform and opacity.
- Avoid animating layout properties such as top, left, width, or height.
- Use Motion for simple reveals and UI transitions.
- Use GSAP only for justified pinning, scrub, sticky-stack, or horizontal-pan effects.
- Avoid `window.addEventListener("scroll", ...)` for animation.
- Avoid React state for scroll progress or requestAnimationFrame loops.
- At most one marquee per page.
- If motion intensity is high, the page must actually show working, polished motion; otherwise lower the dial and ship a clean static page.

## 6. Performance and accessibility

- Respect reduced motion.
- Maintain WCAG contrast across text, buttons, forms, and overlays.
- Target LCP under 2.5s, INP under 200ms, CLS under 0.1.
- Reserve space for images, fonts, and embeds.
- Avoid expensive filters on scrolling containers.
- Use z-index intentionally and avoid arbitrary z-index spamming.
- Test both light and dark mode when dual-mode is relevant.

## 7. Dark mode protocol

Consumer-facing pages should generally support both modes unless the brief explicitly requires one.

- Pick one token strategy: Tailwind `dark:` variants or CSS variables.
- Respect `prefers-color-scheme` unless the brand insists.
- Maintain contrast, hierarchy, and brand fidelity in both modes.
- Avoid pure black and pure white as defaults; use off-black and off-white.

## 8. AI tells to avoid

Avoid these unless the brief explicitly asks for them:

- Neon outer glows by default.
- Pure black / pure white.
- Oversaturated accents.
- Excessive gradient text.
- Custom mouse cursors.
- Inter as automatic default.
- Oversized H1s that rely only on scale.
- Three identical feature cards.
- Generic names, avatars, startup names, and filler verbs.
- Hand-rolled SVG icons.
- Broken Unsplash links.
- Default shadcn/ui styling.
- Version labels, `Brand · No. 01` sub-eyebrows, section-number eyebrows, and unnecessary pagination labels.
- Repeated uppercase tracking labels above every section.
- Repeated bento/card/zigzag patterns.
- Placeholder copy that sounds poetic but says nothing.

## 9. Redesign protocol

For redesigns:

1. Audit the current UI before changing it.
2. Identify what must be preserved: structure, content, brand assets, behavior, data, SEO, URLs, analytics, accessibility constraints.
3. Decide whether the redesign is preserve, refresh, or overhaul.
4. Keep existing content and data unless explicitly asked to rewrite them.
5. Improve hierarchy, spacing, typography, interaction states, contrast, and responsiveness without inventing new business facts.

## 10. Pre-flight check

Before declaring UI/design work done, verify:

- Design read is stated.
- Dials match the brief.
- Imported packages exist or install commands were provided.
- Hero fits the viewport and CTAs are visible.
- Navigation fits on desktop.
- Mobile layouts are explicitly handled.
- Eyebrow count is within limits.
- Button and form contrast passes.
- Radius, palette, and theme are consistent.
- Motion respects reduced motion.
- Images are real, generated, provided, or clearly marked as needed.
- Copy has been self-audited.
- No existing code/data/templates/images/posts/stock information were changed unless the task explicitly requested it.

