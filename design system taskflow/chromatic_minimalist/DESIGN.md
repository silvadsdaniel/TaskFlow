---
name: Chromatic Minimalist
colors:
  surface: '#faf9ff'
  surface-dim: '#d8d9e4'
  surface-bright: '#faf9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fe'
  surface-container: '#ecedf8'
  surface-container-high: '#e6e7f3'
  surface-container-highest: '#e0e2ed'
  on-surface: '#181b23'
  on-surface-variant: '#414754'
  inverse-surface: '#2d3039'
  inverse-on-surface: '#eff0fb'
  outline: '#727786'
  outline-variant: '#c1c6d7'
  surface-tint: '#0059c5'
  primary: '#0058c3'
  on-primary: '#ffffff'
  primary-container: '#0070f3'
  on-primary-container: '#ffffff'
  inverse-primary: '#aec6ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#722ce3'
  on-tertiary: '#ffffff'
  tertiary-container: '#8c4dfd'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#004397'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#faf9ff'
  on-background: '#181b23'
  surface-variant: '#e0e2ed'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  display-md-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system focuses on extreme functional minimalism where color is not merely decorative, but the primary cognitive engine for organization. The brand personality is efficient, precise, and high-energy, aimed at power users who value density and rapid visual scanning. 

The aesthetic blends **Minimalism** with **High-Contrast** accents. By keeping the interface structural elements neutral and understated, the semantic colors for "Work," "Personal," "Family," and "Shopping" become the dominant focal points. The interface should feel like a high-performance tool: sharp, responsive, and devoid of unnecessary ornamentation.

## Colors
The palette is divided into a neutral foundation and a set of highly saturated semantic accents. 

**Neutral Foundation:**
- **Light Mode:** Pure white (#FFFFFF) backgrounds with soft grey borders and jet-black text.
- **Dark Mode:** Deep black (#0A0A0A) backgrounds with subtle grey borders and off-white text.

**Semantic Accents:**
- **Work (Blue):** #0070F3 — Used for professional commitments.
- **Personal (Green):** #10B981 — Used for health and self-improvement.
- **Family (Purple):** #7C3AED — Used for household and shared tasks.
- **Shopping (Amber):** #F59E0B — Used for commerce and logistics.

In both modes, inactive states use neutral tones, while active states utilize the full saturation of the category colors to drive user attention.

## Typography
The system utilizes **Geist** to maintain a technical, developer-centric aesthetic that emphasizes precision. To maintain a strict minimalist hierarchy, only weights **400 (Regular)** and **500 (Medium)** are permitted. 

Headlines use negative letter-spacing to appear tighter and more impactful at larger sizes. Body text is optimized for legibility with a generous 1.5 line-height. Labels are always set in Medium weight to distinguish them from flow text, often used in uppercase for category indicators or interactive buttons.

## Layout & Spacing
The layout follows a **fluid grid** logic with a strict 4px baseline. 

- **Desktop:** 12-column grid with a max-width of 1200px.
- **Mobile:** Single column with 16px side margins.

Spacing is used to group related tasks. For example, tasks within the same category should have `sm` (8px) spacing, while different category groups should be separated by `lg` (24px). Horizontal padding in cards and containers is fixed at `md` (16px) to ensure a consistent vertical rhythm.

## Elevation & Depth
This design system avoids traditional box shadows to maintain a "flat-plus" minimalist look. Depth is communicated through:

1.  **Low-Contrast Outlines:** Surfaces are defined by 1px solid borders. In light mode, these are light grey; in dark mode, they are a muted charcoal.
2.  **Tonal layering:** Primary surfaces (the app background) are the lowest layer. Secondary surfaces (task cards) use the same background color but are defined by their borders. 
3.  **Active Elevation:** When an item is dragged or focused, it does not gain a shadow; instead, its border color changes to the primary accent color or increases in opacity.

## Shapes
The shape language is controlled and modern. 
- **Standard elements:** (Cards, Inputs) use a 0.5rem (8px) radius.
- **Large elements:** (Modals, Feature containers) use a 0.75rem (12px) radius. 
- **Small elements:** (Chips, Tags) use a full pill-shape (999px) or 4px depending on context.

The 12px limit ensures the interface remains structured and professional, avoiding the overly "bubbly" appearance of consumer-grade apps.

## Components
### Category Chips
- **Inactive State:** 1px neutral border, transparent background. Features a 6px solid circular dot of the category color to the left of the text.
- **Active State:** Background fill matches the category color (e.g., solid Blue). Text and icons switch to a high-contrast dark neutral (#0A0A0A) for maximum legibility.

### Buttons
- **Primary:** Solid black in light mode, solid white in dark mode. No shadows.
- **Secondary:** 1px neutral border with transparent background.

### Task Cards
- A 1px border surrounds the card. 
- The left edge features a 4px vertical "intent bar" colored by the task's category. 
- Background remains the same as the page background to maintain a "wireframe" aesthetic.

### Input Fields
- Minimalist underline or 1px all-around border.
- Focus state is indicated by the border changing to the Primary Blue color, with no outer glow.

### Checkboxes
- Custom 20px squares with 4px corner radius.
- When checked, they fill with the specific category color of the task rather than a universal "success" green.