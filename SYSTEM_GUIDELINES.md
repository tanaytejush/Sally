# System Guidelines — Sally · Your Well‑being Buddy

Use this file to guide future work on Sally’s interface, tone, and behavior. Keep the experience calm, supportive, minimal, and accessible.

TIP: More context isn’t always better. Keep rules specific and actionable.

---

## General Guidelines
- Prefer responsive layouts using Flexbox and Grid; avoid absolute positioning unless necessary.
- Keep components focused and small; collocate files per component (`/components/Name/*`).
- Use semantic HTML and accessible roles/labels first; add ARIA only when needed.
- Keep copy supportive and non‑clinical. Avoid advice that sounds diagnostic or prescriptive.
- Limit dependencies; prefer native web APIs and CSS over heavy UI libraries.
- Keep assets light: inline SVG icons, optimize images, avoid large libraries.
- Follow a 4px spacing scale; avoid “magic numbers”.
- Use CSS variables for tokens; don’t hard‑code colors, radii, or shadows inline.

## Accessibility
- Respect color contrast (WCAG AA): body text ≥ 4.5:1 where applicable.
- Ensure full keyboard support: focus states on interactive controls, Enter/Space activate buttons.
- Use `aria-live="polite"` for new chat messages (already in `ChatWindow`).
- Provide `alt` text for images (Sally avatar), and `aria-label` on icon buttons (Send).
- Minimum touch targets 44×44px; ensure sufficient spacing between controls.
- Prefer reduced motion: keep animations subtle; honor `prefers-reduced-motion`.

## Design System Guidelines

### Design Tokens (CSS variables)
Defined in `src/styles.css` under `:root`. Use or extend these tokens:
- Colors
  - `--bg-1: #f6fbff` (sky), `--bg-2: #fff7f2` (peach)
  - `--text: #253047`, `--muted: #6b7280`
  - `--card: rgba(255,255,255,0.66)`, `--card-border: rgba(142,160,202,0.25)`
  - `--bubble-sally: #eef1ff`, `--bubble-user: #ffffff`, `--bubble-border: #e7ebf5`
  - `--accent: #8aa1f2` (periwinkle), `--accent-2: #aee8d8` (mint)
- Radii
  - `--radius-lg: 18px`, `--radius-xl: 22px` (use consistently for surfaces and bubbles)
- Shadow
  - `--shadow: 0 10px 30px rgba(25,42,70,0.08)` (subtle, soft)

### Typography
- Base font: Nunito (300/400/600/700), fallbacks to system sans‑serif.
- Base size: 16px; chat bubbles 15–16px; headings scale responsively.
- Headings weight 700; body 400/600; line-height ~1.5; avoid tight tracking.

### Layout & Spacing
- Page padding: clamp(16px, 3vw, 28px); generous white space.
- Spacing scale: 4, 8, 12, 16, 24, 32 px.
- Max content width ~980px; chat bubble max width ~72% (86% on small screens).

### Color & Vibe
- Pastels and airy gradients; keep overall tone soft and welcoming.
- Sally bubbles: light lavender/blue; User bubbles: white/very light gray.
- Use subtle borders with low‑chroma tints; avoid harsh outlines.

### Motion
- Transitions 150–250ms, ease‑out; no bouncy or attention‑grabbing effects.
- Typing indicators (if added) should be subtle and respect reduced‑motion.

### Icons
- Use inline SVG; inherit `currentColor`; stroke width ~1.5–1.6.
- Provide `aria-label` or screen reader text for icon‑only controls.

## Component Guidelines

### Header
- Title text: “What’s on your mind today?” (keep phrasing)
- Subtitle: “Sally · Your Well‑being Buddy”
- Avatar: 40×40, circular, soft gradient; subtle shadow.

### Relationship Toggle
- Options: Brother, Sister, Husband, Wife, Girlfriend, Boyfriend (no dropdown).
- Presentation: segmented pill group; single selection; active state has gentle elevation.
- Layout: allow wrap to two lines on small screens; keep tap targets ≥ 44×44px.
- Purpose: adapt Sally’s supportive style to the selected relationship while keeping healthy boundaries.

### Chat Window
- Vertical stack with 10–12px gaps; auto‑scroll to last message.
- Sally messages left‑aligned (soft lavender/blue); user right‑aligned (white/neutral).
- Rounded bubbles (≥16px radius), soft borders, minimal shadow.
- Announce new messages with `aria-live="polite"`; avoid focus jumps.

### Message Bubble
- Max width ~72% of container; readable line length.
- Preserve line breaks; wrap long words; no horizontal scroll.
- Avoid embedding complex widgets; keep content text‑centric.

### Composer
- Placeholder: “Type your thoughts…”
- Behavior: Enter to send; Shift+Enter for new line.
- Send button: circular/pill with plane or heart icon; clear focus state.

## Content & Tone (Sally’s Voice)
- Supportive and listening‑first only. Prioritize reflective listening over solutions.
- Warm, validating, strengths‑based: “Thank you for sharing…”, “Your feelings make sense…”.
- Avoid medical claims, diagnoses, guarantees, and prescriptive advice. Do not judge or minimize feelings.
- Ask gentle, optional questions to explore (“Would it help to share more about…?”). Offer options, not directives.
- Inclusive language; avoid assumptions; be culturally sensitive and respectful.
- Keep responses concise (1–2 short paragraphs) with calm pacing.

### Role‑Adapted Style (must)
Sally adapts tone to the selected relationship while remaining non‑clinical and kind:
- Brother: steady, protective support; “I’ve got your back.”
- Sister: gentle, nurturing encouragement; “I’m by your side.”
- Husband / Wife: partner‑like warmth and teamwork; “We’ll face this together.”
- Girlfriend / Boyfriend: affectionate, caring reassurance; “I’m here with you.”

Always maintain healthy boundaries; no overpromising or dependency language.

## Implementation Conventions
- React 18 with functional components and hooks; prefer controlled inputs.
- State minimalism: keep transient UI state local; lift only when necessary.
- File organization
  - `src/components/*` for UI; `src/assets/*` for images/icons; `src/styles.css` for tokens + global styles.
- Testing (when added):
  - Unit test utilities; component tests for interaction (send, toggle, focus).
- Performance: lazy‑load optional features; keep bundle lean; compress SVGs.

## Do / Don’t
- Do: keep UI airy, gentle, and accessible.
- Do: use tokens and consistent spacing/radii.
- Don’t: add loud colors, harsh shadows, or dense layouts.
- Don’t: use dropdowns for two or fewer options; prefer direct choices.
- Don’t: ship features that change Sally’s core supportive nature.

---

Change management: If you need to deviate from these rules, add a short rationale in this file under a new “Decisions” section and link to the relevant code.
