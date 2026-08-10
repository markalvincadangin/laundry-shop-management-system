# Data Model Artifact: UI/UX Refinement & Responsive Layout Enhancement

**Feature**: [`specs/014-ui-ux-responsiveness`](../spec.md)
**Created**: 2026-08-10

## 1. UI Layout & Responsive State Primitives

### Responsive Layout Breakpoint State
- **Mobile Viewport** (`< 768px`):
  - Sidebar → Collapsible Touch Drawer Navigation.
  - Data Tables → Stacked Card Reflow View.
  - Tap Targets → Minimum 44px x 44px.
  - Page Padding → `px-4 py-3`.
- **Desktop Viewport** (`≥ 768px`):
  - Sidebar → Permanent Collapsible Left Rail.
  - Data Tables → Full Multi-Column Data Grid.
  - Page Padding → `px-6 py-6` or `px-8 py-8`.

---

## 2. Design System Color & Elevation Tokens

### Theme Tokens (HSL Tailored)
- `--background`: `0 0% 100%` (Light) / `222.2 84% 4.9%` (Dark)
- `--foreground`: `222.2 84% 4.9%` (Light) / `210 40% 98%` (Dark)
- `--primary`: `221.2 83.2% 53.3%` (Deep Laundry Blue)
- `--secondary`: `210 40% 96.1%` (Soft Ice Gray)
- `--accent`: `217.2 91.2% 59.8%` (Vibrant Aqua Highlight)
- `--destructive`: `0 84.2% 60.2%` (Coral Red)

### Touch Animation Tokens
- **Press Scale**: `active:scale-[0.97]` / `transition-transform duration-100 ease-out`
- **Hover Elevation**: `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`
- **Skeleton Pulse**: `animate-pulse bg-muted rounded-md`
