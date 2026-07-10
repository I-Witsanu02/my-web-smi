---
name: Clinical Clarity System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f88'
  primary: '#002046'
  on-primary: '#ffffff'
  primary-container: '#1b365d'
  on-primary-container: '#87a0cd'
  inverse-primary: '#aec7f7'
  secondary: '#006971'
  on-secondary: '#ffffff'
  secondary-container: '#97edf7'
  on-secondary-container: '#006d76'
  tertiary: '#192132'
  on-tertiary: '#ffffff'
  tertiary-container: '#2e3648'
  on-tertiary-container: '#979fb5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aec7f7'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2e476f'
  secondary-fixed: '#9af0fa'
  secondary-fixed-dim: '#7ed4dd'
  on-secondary-fixed: '#002023'
  on-secondary-fixed-variant: '#004f55'
  tertiary-fixed: '#dbe2fa'
  tertiary-fixed-dim: '#bfc6dd'
  on-tertiary-fixed: '#141b2c'
  on-tertiary-fixed-variant: '#3f4759'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for high-stakes clinical decision support. The brand personality is rooted in academic rigor and medical trustworthiness, positioning the software as an assistant to the practitioner rather than an autonomous replacement. 

The visual style follows a **Modern Corporate/Clinical** aesthetic. It prioritizes clarity, systematic organization, and the reduction of cognitive load. By utilizing a clean white foundation with structured navy accents, the system evokes the feeling of a professional medical workstation. The interface remains neutral to ensure that diagnostic images (X-rays) and heatmaps are the primary focus, while subtle "Glassmorphism" is used sparingly for overlays to maintain spatial context without cluttering the diagnostic field.

## Colors

This design system utilizes a hierarchical color palette designed for clinical environments where legibility under varying light conditions is critical.

- **Primary (Navy Blue):** Used for global navigation, structural headers, and primary branding elements. It conveys stability and authority.
- **Secondary (Teal):** Reserved for interactive accents, secondary buttons, and active states. It provides a distinct visual departure from structural elements.
- **Backgrounds:** A tiered system of whites and very light grays (`#F8FAFC`, `#FFFFFF`) to separate the diagnostic "canvas" from the surrounding UI controls.
- **Semantic Colors:** Strictly applied to age-variance indicators and data confidence scores. Success Green indicates development within normal ranges, Warning Amber for borderline deviations, and Alert Red for significant clinical anomalies requiring immediate review.

## Typography

The design system uses **Inter** for its exceptional legibility in data-dense environments and its neutral, professional tone. 

The scale emphasizes a strong vertical hierarchy. **Data-heavy views** (such as patient lists or bone age metrics) utilize tabular lining figures (`tnum`) to ensure numerical values align perfectly for quick comparison. Headers are kept concise and use a darker navy shade to anchor the content. Labels for clinical disclaimers and metadata utilize the `label-caps` style to differentiate supporting information from primary diagnostic data.

## Layout & Spacing

This design system employs a **Fixed-Fluid Hybrid Grid**. On desktop, a 12-column grid is used with a fixed max-width for the main content area to prevent line lengths from becoming unreadable on ultra-wide medical monitors. 

- **The Diagnostic Workspace:** A flexible center panel that expands to prioritize the X-ray image and heatmap.
- **Sidebars:** Fixed-width (280px - 320px) panels for patient history and "Explainable AI" analysis results.
- **Spacing Rhythm:** Based on a 4px baseline. Components generally use 16px or 24px padding to maintain an airy, clinical feel that prevents the UI from feeling cramped during stressful diagnostic sessions.

## Elevation & Depth

To maintain a clean, professional aesthetic, this design system avoids heavy shadows. Instead, it uses **Tonal Layering** and **Low-Contrast Outlines**.

1.  **Level 0 (Background):** Solid white or very light gray.
2.  **Level 1 (Cards/Containers):** White surface with a 1px border in a soft slate (`#E2E8F0`) and a very subtle ambient shadow (4px blur, 2% opacity).
3.  **Level 2 (Active Overlays/Modals):** Glassmorphism effect with a backdrop blur (12px) and a slightly more pronounced shadow (12px blur, 8% opacity) to indicate temporary focus.

This approach ensures that depth is used only to imply interaction hierarchy, never to distract from the flat plane of the medical imaging.

## Shapes

The shape language is "Rounded" (Level 2) to soften the clinical environment and make the software feel modern and approachable. 

Standard cards and data containers use a **12px radius**, while smaller elements like input fields and buttons use an **8px radius**. Tag-style indicators (chips) for "Explainable AI" features or risk levels use fully rounded (pill) shapes to distinguish them from actionable buttons.

## Components

### Buttons & Actions
- **Primary:** Solid Navy Blue with white text. Used for "Finalize Assessment" or "Confirm."
- **Secondary:** Outlined Teal. Used for "Add Note" or "Compare Previous."
- **Ghost:** No background, Navy text. Used for navigation within panels.

### Cards & Data Containers
Every card must feature a 12px corner radius. The header of the card should be separated by a subtle 1px divider if it contains patient identification data.

### Data Tables
Tables use high-contrast text against alternating white/off-white rows. Hover states should be a light teal tint (`#F0FDFA`) to track the eye across long data rows.

### Explainability Indicators (Heatmaps & Tags)
- **Heatmap Toggle:** A stylized switch with a "Neural" icon.
- **Confidence Chips:** Small pill-shaped tags showing a percentage (e.g., "94% Confidence").
- **Clinical Disclaimer:** A persistent, low-contrast footer or sidebar element in `label-caps` typography, emphasizing that the system is for decision support only.

### Icons
Use a custom medical set with consistent 2px stroke weights. Icons representing AI or Heatmaps should utilize the Secondary Teal color to indicate "System Intelligence" features.