---
name: ArchitectIQ Landing
description: Dark glassmorphism design system for an AI-powered solution architecture generator. Deep near-black backgrounds with radial mesh gradients, frosted glass cards, and a warm accent gradient (red → orange → amber) that signals intelligence and urgency.

colors:
  # Backgrounds
  bg-base:       "#06060A"
  bg-raised:     "#0D0D14"
  bg-overlay:    "#111119"

  # Glass surfaces (alpha over bg-base)
  surface:       "#FFFFFF0A"
  surface-hover: "#FFFFFF0E"

  # Borders
  border:        "#FFFFFF14"
  border-hi:     "#FFFFFF24"
  border-focus:  "#E8472A66"

  # Text
  text-primary:  "#FFFFFF"
  text-secondary: "#FFFFFF73"
  text-tertiary: "#FFFFFF38"
  text-disabled: "#FFFFFF1F"

  # Accent — primary action, gradient start
  accent:        "#E8472A"
  accent-mid:    "#FF6B35"
  accent-warm:   "#FBBF24"

  # Semantic pipeline / status colours
  blue:          "#4F8EFF"
  violet:        "#A78BFA"
  yellow:        "#FBBF24"
  green:         "#34D399"
  pink:          "#F472B6"
  orange:        "#FB923C"
  cyan:          "#22D3EE"
  slate:         "#94A3B8"
  red:           "#EF4444"

  # macOS window chrome (decorative)
  chrome-close:  "#FF5F57"
  chrome-min:    "#FEBC2E"
  chrome-max:    "#28C840"

typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(48px, 6.5vw, 80px)"
    fontWeight: "900"
    lineHeight: "1.04"
    letterSpacing: "-3px"

  display-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(40px, 5.5vw, 68px)"
    fontWeight: "900"
    lineHeight: "1.08"
    letterSpacing: "-2.5px"

  heading-1:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(32px, 4vw, 50px)"
    fontWeight: "800"
    lineHeight: "1.12"
    letterSpacing: "-1.5px"

  heading-2:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: "700"
    lineHeight: "1.3"
    letterSpacing: "-0.4px"

  heading-3:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: "700"
    lineHeight: "1.4"
    letterSpacing: "-0.3px"

  body-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: "400"
    lineHeight: "1.7"
    letterSpacing: "0px"

  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "1.65"
    letterSpacing: "0px"

  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "1.55"
    letterSpacing: "0px"

  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: "600"
    lineHeight: "1"
    letterSpacing: "0.1em"
    fontFeature: "normal"

  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: "500"
    lineHeight: "1.4"
    letterSpacing: "0.12em"

  code:
    fontFamily: "JetBrains Mono, Menlo, monospace"
    fontSize: "12.5px"
    fontWeight: "500"
    lineHeight: "1.5"
    letterSpacing: "0px"

  code-sm:
    fontFamily: "JetBrains Mono, Menlo, monospace"
    fontSize: "11px"
    fontWeight: "400"
    lineHeight: "1.5"
    letterSpacing: "0px"

  stat-value:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: "800"
    lineHeight: "1"
    letterSpacing: "-1px"

rounded:
  none:   "0px"
  xs:     "6px"
  sm:     "8px"
  md:     "10px"
  lg:     "12px"
  xl:     "14px"
  2xl:    "16px"
  3xl:    "20px"
  full:   "9999px"

spacing:
  1:   "4px"
  2:   "8px"
  3:   "12px"
  4:   "16px"
  5:   "20px"
  6:   "24px"
  7:   "28px"
  8:   "32px"
  10:  "40px"
  12:  "48px"
  14:  "56px"
  16:  "64px"
  20:  "80px"
  24:  "96px"
  30:  "120px"
  content-max: "1100px"
  section-pad: "120px"

components:
  nav:
    background: "rgba(6,6,10,0.85)"
    border: "{border}"
    borderRadius: "{rounded.xl}"
    backdropFilter: "blur(20px)"
    padding: "10px 20px"
    maxWidth: "{spacing.content-max}"
    shadow: "0 4px 40px rgba(0,0,0,0.4)"

  glass-card:
    background: "{surface}"
    backgroundHover: "{surface-hover}"
    border: "1px solid {border}"
    borderHover: "1px solid {border-hi}"
    borderRadius: "{rounded.2xl}"
    backdropFilter: "blur(12px)"
    padding: "28px"

  glow-border-card:
    base: "{glass-card}"
    gradientBorder: "linear-gradient(135deg, rgba(232,71,42,0.5), rgba(79,142,255,0.3), rgba(232,71,42,0.1))"
    gradientOpacityIdle: "0"
    gradientOpacityHover: "1"
    gradientTransition: "opacity 0.3s"

  btn-primary:
    background: "linear-gradient(135deg, {accent}, {accent-mid})"
    color: "{text-primary}"
    borderRadius: "{rounded.md}"
    padding: "13px 26px"
    fontSize: "15px"
    fontWeight: "600"
    shadowHover: "0 8px 32px rgba(232,71,42,0.4), 0 0 0 1px rgba(232,71,42,0.2)"
    transformHover: "translateY(-1px)"

  btn-ghost:
    background: "transparent"
    backgroundHover: "transparent"
    border: "1px solid {border}"
    borderHover: "1px solid {border-hi}"
    color: "{text-secondary}"
    colorHover: "{text-primary}"
    borderRadius: "{rounded.md}"
    padding: "13px 26px"
    fontSize: "15px"
    fontWeight: "600"
    transformHover: "translateY(-1px)"

  badge:
    borderRadius: "{rounded.full}"
    padding: "5px 12px"
    fontSize: "12px"
    fontWeight: "600"
    letterSpacing: "0.01em"

  section-label:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: "600"
    letterSpacing: "0.1em"
    textTransform: "uppercase"
    color: "{text-tertiary}"

  tab-btn:
    background: "transparent"
    backgroundActive: "rgba(255,255,255,0.08)"
    borderRadius: "{rounded.sm}"
    padding: "7px 14px"
    fontSize: "13px"
    fontWeight: "600"
    color: "{text-tertiary}"
    colorActive: "{text-primary}"

  pipeline-card:
    width: "340px"
    background: "rgba(255,255,255,0.03)"
    border: "1px solid rgba(255,255,255,0.09)"
    borderRadius: "{rounded.3xl}"
    shadow: "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)"

  logo-mark:
    size: "28px"
    borderRadius: "{rounded.sm}"
    background: "linear-gradient(135deg, {accent}, {accent-mid})"

  mesh-blob:
    filter: "blur(80px)"
    borderRadius: "{rounded.full}"

  section-divider:
    height: "1px"
    width: "60%"
    background: "linear-gradient(90deg, transparent, {border}, transparent)"

  stat-pill:
    valueFontSize: "28px"
    valueFontWeight: "800"
    valueColor: "{text-primary}"
    labelFontSize: "12px"
    labelColor: "{text-tertiary}"
    gap: "4px"
---

## Overview

ArchitectIQ Landing uses a **dark glassmorphism** aesthetic inspired by tools like Linear, Vercel, and Resend — purpose-built for a technical B2B audience of solution architects, CTOs, and consultants. The design communicates intelligence, precision, and speed.

The fundamental visual metaphor is **depth through light, not darkness**. Rather than simply stacking dark boxes, layered frosted glass panels float above a near-black void. Radial gradient mesh blobs provide ambient colour that bleeds through the glass — giving each section a subtle sense of atmosphere without competing with content.

A fine-grain noise texture (SVG `feTurbulence`, ~4% opacity) overlays the entire viewport. This prevents the background from reading as flat digital black and gives the surface a tactile, premium quality reminiscent of high-end print media and OLED displays.

The accent palette runs **warm** — red (#E8472A) → orange (#FF6B35) → amber (#FBBF24) — applied as a gradient on hero headlines, primary buttons, and the logo mark. This warmth distinguishes ArchitectIQ from the cold-blue defaults of developer tools and signals urgency and energy without being aggressive.

---

## Colors

### Background stack
Three background levels create the depth hierarchy:
- `bg-base` (#06060A) — the deepest layer; almost black with a barely perceptible blue tint
- `bg-raised` (#0D0D14) — alternating section background; slightly lighter, clearly distinct at full opacity
- Glass surfaces sit above these using `rgba(255,255,255,0.04)` — they read as their own layer due to backdrop blur, not because they are lighter

### Alpha-based text
All text except headings is expressed in white with alpha, never in grey hex values. This keeps text chromatically neutral (it picks up the hue of whatever is behind it) and guarantees the scale reads correctly on both `bg-base` and `bg-raised` backgrounds without needing separate token sets:
- Primary: `rgba(255,255,255,1.0)` — headings, active states, prices
- Secondary: `rgba(255,255,255,0.45)` — body copy, descriptions
- Tertiary: `rgba(255,255,255,0.22)` — labels, captions, placeholder states
- Disabled: `rgba(255,255,255,0.12)` — inactive tabs, muted metadata

### Alpha-based borders
Borders follow the same alpha pattern: `rgba(255,255,255,0.08)` at rest, `rgba(255,255,255,0.14)` on hover. The visual weight of a card border is entirely determined by background contrast, making these values feel consistent everywhere.

### Semantic pipeline colours
Each of the five pipeline stages carries its own hue — blue → violet → yellow → green → pink — forming a legible progression in the animated pipeline card. These same colours are reused as feature card accent tints throughout the page: every feature card's icon box uses a 7% alpha tint of its stage colour as background, with a 15% alpha border of the same hue. This creates an invisible coherence between the hero demo and the features section.

### Accent gradient
The primary action gradient (`#E8472A → #FF6B35`) appears on:
1. The logo mark (square icon, 135° angle)
2. The `btn-primary` background
3. Hero headline mid-line ("15 minutes.") as a three-stop gradient extended to amber
4. The CTA section headline ("architecture?")
5. The `glow-border` card hover gradient (desaturated, paired with blue)

Never use the accent colour as a flat fill for large backgrounds. It only appears as a gradient or as a small accent element (badge dot, status indicator).

---

## Typography

Two typefaces — **Inter** and **JetBrains Mono** — cover all use cases.

**Inter** handles all prose, headings, labels, and UI text. The weight scale is wide: 300 (decorative contrast only), 400 (body), 500 (nav links), 600 (buttons, labels), 700 (card headings), 800 (section headings), 900 (display headlines). Using 900 weight at 80px with −3px letter-spacing is the signature of the hero section — no other element approaches this compression.

**JetBrains Mono** appears exclusively in three contexts:
1. The animated pipeline card — stage labels and detail lines
2. The output showcase — stack table layer/technology columns
3. Section labels that reference technical identifiers (e.g. stage numbers `[01]`)

The rule: if the content is *about code or technical data*, use mono. If it is UI chrome or prose, use Inter.

### Responsive headline scaling
All display and heading sizes use `clamp()` — the font grows fluidly from mobile through desktop. Letter-spacing tightens proportionally: display headlines use −3px, section headings use −1.5px. At smaller sizes the tightening would be unreadable, so `clamp` ensures the minimum size is large enough that negative tracking remains appropriate.

### The "contrast line" technique
Hero headlines use a three-weight contrast to direct the eye:
- Line 1: white, weight 900 — "Architecture in"
- Line 2: accent gradient, weight 900 — "15 minutes."
- Line 3: `rgba(255,255,255,0.35)`, weight 300 — "Not 5 days."

This makes the hero scannable in under one second: the gradient line is the claim, the dimmed line is the contrast, the first line is context.

### Section label pattern
Every section opens with a `section-label` — 12px, 600 weight, 0.1em letter-spacing, uppercase, `text-tertiary` colour. This echoes editorial magazine section tags and prevents sections from blurring together during scroll.

---

## Layout

The page uses a **single-column full-bleed** layout with all content constrained to a `1100px` max-width container centred with `margin: 0 auto`. Section vertical padding is uniformly `120px` top and bottom. This generous padding — much larger than typical SaaS landing pages — enforces breathing room between sections and prevents the dense card grids from feeling cramped.

### Hero grid
The hero section uses a `1fr auto` two-column grid. Left column holds copy, right column holds the pipeline card. Gap is `80px`. On viewports below `lg` (Tailwind breakpoint, 1024px), the pipeline card is hidden entirely — the hero becomes single-column with copy centred.

### Card grids
Feature, scenario, and how-it-works card grids all use `repeat(auto-fit, minmax(Xpx, 1fr))` — they reflow automatically without explicit breakpoints. Gap is consistently `12px` or `16px` (not `24px` like traditional SaaS grids) — tighter gaps reinforce that cards are siblings in a set, not independent elements.

### Section dividers
Sections are separated by a centred 60%-width horizontal gradient line (`transparent → border-colour → transparent`). This is softer than a full-width border and maintains the sense that content floats rather than being rigidly separated.

### The `1100px` decision
Most landing pages use `1200px` or `1280px` max-width. `1100px` keeps the pipeline card and copy section comfortably side-by-side while making the text column narrower (≈480–500px readable width), which is optimal for paragraph readability.

---

## Elevation & Depth

Depth is achieved through four techniques, not shadows alone:

### 1. Backdrop blur (glass layers)
Cards use `backdrop-filter: blur(12px)`. The nav uses `blur(20px)`. The pipeline card uses no blur (it is an opaque dark panel sitting above the blurred hero background). Blur radius communicates proximity: higher blur = closer to the viewer.

### 2. Mesh gradient blobs
Large radial gradient circles (400–600px diameter, 80px blur) are positioned behind hero sections and the scenarios section. They use extremely low opacity (6–12%) so they are felt, not seen — adding colour temperature to the void without competing with content. The hero has three blobs: accent-red top-left, blue top-right, violet centre-bottom.

### 3. Box shadow stack
The pipeline card uses a two-layer shadow: an outer `0 32px 64px rgba(0,0,0,0.5)` (deep depth) plus an inner `inset 0 1px 0 rgba(255,255,255,0.06)` (simulates light catching the top edge). This inner highlight is the key technique that makes the card feel physically present rather than painted on.

### 4. Noise texture
The global SVG noise overlay (body::before, position: fixed, z-index: 9999, pointer-events: none) adds micro-texture at 50% opacity. It prevents the dark background from reading as a flat vector surface and aligns the visual quality with high-end OLED displays and print-quality dark mode UIs.

### Elevation scale (conceptual)
| Layer            | Technique                              |
|------------------|----------------------------------------|
| Background       | bg-base, mesh blobs behind             |
| Section bg       | bg-raised (no border)                  |
| Glass card       | surface + blur(12px) + border          |
| Elevated panel   | rgba(0.03) + border + deep box-shadow  |
| Floating nav     | bg-base 85% + blur(20px) + shadow      |

---

## Shapes

Border radii follow a strict scale. The choices are intentional — not every radius in the scale is used; the specific values in use are:

- `6px` — tag badges, severity labels, small status chips
- `8px` — nav links on hover, tab buttons
- `10px` — primary and ghost buttons
- `12px` — icon boxes within feature cards
- `14px` — floating nav pill
- `16px` — all glass cards (`.glass`, `.glow-border`)
- `20px` — the pipeline card, the output showcase panel
- `9999px` — hero badge pill, semantic status badges

The progression from 16px (standard card) to 20px (featured panel) signals hierarchy: rounder = more prominent. The nav pill at 14px sits between button and card on the scale.

### No sharp corners
The design has zero sharp corners. Even table rows and dividers have no `border-radius: 0` applied to visible container elements. Sharpness is reserved for 1px border lines, never for container shapes.

---

## Components

### Nav
Floats above the page as a pill — it does not span full width. Background starts at 50% opacity and transitions to 85% when the user scrolls past 24px. The blur is always on to prevent harsh background bleed on scroll. Logo uses a 28×28px gradient square icon mark at `rounded.sm` (8px), not a text-only wordmark.

### Glass card (`.glass`)
The base interactive surface. Background is `rgba(255,255,255,0.04)` — this exact value ensures the card reads as distinct from both `bg-base` and `bg-raised` without being too opaque. On hover, background lifts to `0.055` and border lightens from `0.08` to `0.14` opacity. No transform on hover — this avoids competing with the `glow-border` hover gradient.

### Glow-border card (`.glow-border`)
Extends `.glass` with a pseudo-element that insets −1px and applies a three-stop gradient border on hover. The gradient is `accent-red → blue → faded accent-red` at 135°. At idle state, `opacity: 0` — the border appears to be a standard `1px solid transparent`. On hover the gradient fades in at `opacity: 1` over 0.3s. This effect is only applied to How It Works and Features cards — high-information surfaces where the user pauses.

### Pipeline card
A standalone component that does not use `.glass` — it has its own opaque surface (`rgba(255,255,255,0.03)`) and deep box-shadow. The macOS window chrome (three coloured dots: red, yellow, green) is purely decorative, signalling that this is a terminal/application window rather than a content card. Stage indicators use per-stage semantic colours that animate: idle (white 4% + 10% border) → active (stage colour 13% + full colour border + pulse dot) → done (green 15% + green border + checkmark).

### Output showcase panel
Mirrors the pipeline card's macOS window chrome. Tab buttons use the `.tab-btn` style — transparent at rest, `rgba(255,255,255,0.08)` active. Status chips (Live pricing, Validated) use the same alpha-tint pattern as feature icon boxes but with semantic green and blue hues. The content area (`min-height: 300px`) prevents layout shift when switching tabs.

### Button hierarchy
Two button variants, no more:
- `btn-primary` — gradient fill, used for primary CTAs ("Generate architecture"). The shadow appears only on hover, preventing visual weight at idle. Arrow SVG icon is inline in the button, not a Unicode character.
- `btn-ghost` — transparent with border, used for secondary actions ("See example output"). Border lightens on hover; no shadow ever.

### Section label
A micro-label appears above every section's headline — uppercase, 600 weight, 0.1em tracking, `text-tertiary` colour. These labels ("How it works", "Features", "Example output") are navigation anchors for the eye. They should be written in sentence case internally but rendered uppercase via CSS.

### Scenario cards
Use `.glass` base only (no `glow-border`). Hover state is handled by inline `onMouseEnter`/`onMouseLeave` handlers that inject a per-card colour glow: `box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px {card-color}20`. Each card's tag badge uses `{color}15` background and `{color}28` border — the same opacity ratios as feature icon boxes, maintaining system coherence.

---

## Do's and Don'ts

**Do** use white-alpha for all text other than display headlines. Never introduce grey hex values — they break on alternating backgrounds.

**Do** keep the accent gradient to gradient contexts only. A solid `#E8472A` fill is only correct for the live-status pulse dot.

**Do** use `clamp()` for all headline sizes. Avoid `@media` breakpoints for typography — the clamp handles it.

**Do** place mesh blobs with `position: absolute` inside `overflow: hidden` sections. Blobs that escape their section break the grid.

**Do** write section labels in sentence case in source. The `text-transform: uppercase` is applied by the `.section-label` class, not in copy.

**Don't** use `border-radius` values outside the defined scale. The gap between 16px (card) and 20px (panel) is intentional hierarchy — do not fill it with intermediate values like 18px.

**Don't** add `box-shadow` to `.glass` cards unless they are the elevated panel variant. Glass cards float; they should not appear to cast shadows on the background.

**Don't** use the mono typeface (JetBrains Mono) for UI labels, section headers, or button text. Mono is reserved strictly for technical data and pipeline/terminal contexts.

**Don't** increase backdrop blur beyond 20px. The nav uses 20px (maximum) because it overlays the most visual complexity. Cards use 12px. Increasing blur beyond these values creates performance issues on mobile and visual mud.

**Don't** animate the mesh blobs. They are static ambient elements. Motion on blobs would create distraction behind content during scroll.

**Don't** use coloured text other than accent gradient on headlines and semantic status colours. All body copy, labels, and secondary text must be white-alpha — never coloured text for prose decoration.
