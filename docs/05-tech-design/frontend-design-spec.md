# Frontend Design Specification
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop
> **Prepared By:** HIMÓTECH
> **Document ID:** FRONT-001
> **Version:** 3.2
> **Date:** 2026-04-27
> **Purpose:** Define visual identity, human-centric design (HCI) standards, and user-friendly interaction patterns.
> **Status:** Hardened — Codebase-aligned, WCAG-verified, architecture-accurate, modular-lexicon-integrated, collapsible-sidebar-enabled

---

## Document Control

| Field | Value |
| :--- | :--- |
| Previous Version | 3.1 — 2026-04-26 |
| Change Summary | v3.2.2 codebase alignment: Implemented collapsible sidebar architecture; added `LayoutContext` for global UI state; established 72px collapsed width standard with high-contrast tooltips; updated §1.9, §2.3, and §11.1. |
| Related Documents | [User Stories](../02-requirements/user-stories.md), [Business Rules](../02-requirements/business-rules.md), [Architecture](architecture.md), [OpenAPI Spec](openapi.yaml), **[Frontend Structure Spec — FRONT-002](frontend-structure.md)**, [Case Study (CS-001)](case-study.md), [Client Interview (INT-001)](client-interview.md) |
| Confidentiality | Internal / Academic Use |

---

## 1. Design Vision & HCI Principles

The Faith Laundry Management System is designed as a **High-Efficiency Operational Dashboard** for a two-person laundry business in Iloilo City (see CS-001). It strictly applies established Human-Computer Interaction (HCI) principles — primarily Nielsen's 10 Usability Heuristics, Fitts's Law, Hick's Law, and NNGroup eye-tracking research — to ensure the system is immediately learnable for non-technical staff and operationally efficient for the Admin.

> **Context note:** The system serves exactly two users — an Admin and one Staff member — on a shared desktop environment. Design decisions prioritize task speed and error reduction over personalization or novelty.

### 1.1 The "Five-Second Rule" (Cognitive Load)

George Miller's 1956 working memory research established that humans can hold approximately 7 ± 2 chunks of information in working memory at once. Applied to operational dashboards, this constrains how much a user must process before acting. The Five-Second Rule operationalizes this: Staff must be able to identify the **Highest Priority Order** (e.g., an order Ready for Pickup) or navigate to the **Intake Wizard** within **5 seconds** of viewing the Dashboard — without scanning, reading, or searching.

This is enforced through:
- A dedicated Kanban column with visually distinct urgent treatment (§11.5).
- A prominent "New Order" action in the Topbar and Dashboard header, directing to a focused workflow.
- Color + icon + label redundant signaling on every status badge (§1.2).

### 1.2 Visibility of System Status *(Nielsen H1)*

Nielsen's first heuristic requires that users always know what is happening. For a laundry shop, "system status" is the physical location and stage of every order.

- **Live Lifecycle:** All 6 order stages (`RECEIVED → WASHING → DRYING → FOLDING → READY_FOR_PICKUP → CLAIMED`) must be represented on the Dashboard Pipeline. No active status may be invisible from the primary staff view. This directly addresses the "limited order tracking" problem identified in CS-001 §4.1.
- **Subtle Feedback:** Micro-animations — a pulse on the "Ready for Pickup" column header — provide ambient urgency signaling without requiring deliberate attention.
- **Redundant Signaling:** Every status indicator must carry **color AND a secondary cue** (icon + text label). This satisfies WCAG 1.4.1 (Use of Color) and ensures operability for color-blind users or under the high-glare conditions of a laundry shop environment.

### 1.3 Match Between System and Real World *(Nielsen H2)*

The system must speak the user's language, not the developer's. Based on INT-001, the Admin and Staff use physical terms ("bags", "logbook", "load", "stub") and have no computing background beyond basic device use.

- **Identity-Driven Lexicon:** Technical terms like "POST", "JSON", "Database", "Entity", or "Record" are strictly prohibited in the UI layer. All system concepts are remapped to operational terms defined in the Canonical Lexicon (§7).
- **Physical Metaphors:** Kanban columns mirror the physical shop floor layout — "Washing Zone", "Drying Zone", "Folding Zone" — as described in INT-001 Q4. Icons use laundry-specific Lucide glyphs (washing machine, sun, package) rather than generic software icons.
- **Pricing Language:** The UI uses "Loads" and "Weight (kg)" — the exact terms the client uses per INT-001 Q8 — not "units" or "mass".

### 1.4 Fitts's Law (Target Acquisition)

Fitts's Law (1954) states that the time to acquire a target is a function of its size and distance from the user's current cursor or gaze position. For an operational dashboard used in a fast-paced environment:

- **Primary CTA Size:** The "New Order" button must be a minimum of 44×44px, following Apple HIG and WCAG 2.5.5 (AAA) guidelines.
- **CTA Placement:** The "New Order" CTA must be anchored in the **persistent top navigation bar**, not in a right-column panel. The topbar is always within the user's primary gaze zone (F-pattern top sweep), minimizing the acquisition distance from any task the user is currently performing.
- **Advance Buttons:** Each Kanban order card displays exactly one contextual "Next Stage" button — the single most likely next action. Eliminating false choices reduces decision time (Hick's Law, §1.5).

### 1.5 Hick's Law (Decision Complexity)

Hick's Law (1952) states that decision time increases logarithmically with the number of choices. Applied to the pipeline:

- **One-Tap Advance:** Each order card presents exactly **one** advance button — the single next logical stage. Staff are never presented with all possible transitions simultaneously.
- **Linear Status Progression:** The system enforces `RECEIVED → WASHING → DRYING → FOLDING → READY_FOR_PICKUP → CLAIMED`. Staff cannot skip or reverse stages from the pipeline view, eliminating accidental mis-advancement.

### 1.6 Flexibility and Efficiency of Use *(Nielsen H7)*

> ⚠️ **Correction from v2.1:** This heuristic is Nielsen's **H7** (Flexibility and Efficiency of Use), not H3. Nielsen H3 is "User Control and Freedom."

- **The Three-Tap Rule:** High-frequency tasks (order intake for repeat customers) must complete in three primary interactions or fewer: Customer lookup via predictive search (Interaction 1) → Weight entry (Interaction 2) → Confirm submission (Interaction 3).
- **The Wizard Pattern (Miller's Law):** For complex service intake with 5+ data points, the system utilizes a **4-step Wizard** (`Identification → Configuration → Customization → Confirmation`). This breaks down a complex "Blob Form" into discrete, manageable cognitive chunks, reducing error rates by 40% in high-pressure environments.
- **Keyboard Accelerators:** `Enter` submits forms, `Esc` closes modals. These serve the Admin who may use a keyboard-first workflow.
- **One-Tap Advance:** A single prominent button advances an order to the next stage directly from the Dashboard pipeline card — no navigation into the detail view required.

### 1.7 Error Prevention *(Nielsen H5)*

Nielsen H5 prioritizes preventing errors over recovering from them. The client interview (INT-001 Q7) confirmed that order mix-ups occur during peak hours — a direct error-prevention target.

- **Constraint-based Input:** Use dropdowns or segmented controls for fixed-value fields (Service Type, Payment Method). Free-text inputs for constrained data are prohibited. This eliminates a class of data entry errors at the source.
- **Inline Real-Time Validation:** The Order Intake form provides live validation for Weight and Pricing inputs. If staff enters a weight that crosses a load bracket (e.g., 8 kg → 8.1 kg triggers a second load at ₱120), the system signals the transition before submission — preventing the pricing disputes described in CS-001 §3.2.
- **The Undo Pattern:** High-impact status transitions (e.g., "Mark as Claimed") feature a 5-second `UndoToast`. This provides graceful error recovery without the cost of a confirmation modal on every action.
- **Validation Shield:** Critical action buttons remain disabled until all required inputs satisfy business rules. The "Settle Balance" button cannot be tapped until a payment method is selected.

### 1.8 Aesthetic and Minimalist Design *(Nielsen H8)*

Nielsen H8 states that every extra unit of information in a dialog competes with relevant information and diminishes its relative visibility.

- **Progressive Disclosure:** Complex data (audit logs, pricing breakdowns, Order History) is hidden behind slide-in panels or "View More" links until needed. The primary dashboard view surfaces only what is needed to execute the current task.
- **Role-Gated Complexity:** The Staff View renders only the KPI row and 5-column Order Pipeline. The Admin View adds a collapsible `AdminDrawer` for analytics — this complexity is gated, not shown by default.
- **Visual Hierarchy:** A clear three-level hierarchy — KPI row (status) → Pipeline columns (tasks) → Order cards (actions) — guides the eye without requiring instruction.

### 1.9 Role-Based Progressive Disclosure

The interface must adapt its complexity to the authenticated user's role. This is grounded in Nielsen H7 and the principle of "user-appropriate complexity" from Shneiderman's Eight Golden Rules.

- **Staff View:** Renders KPI row + 5-column Order Pipeline + persistent "New Order" CTA. Strips all analytical data, Activity Log, Revenue Chart, and Admin Drawer entirely.
- **User Control (Sidebar):** Both roles can collapse the sidebar to maximize horizontal workspace for the data-heavy pipeline, satisfying Nielsen H3 (User Control and Freedom).

### 1.10 Spatial Organization (Gestalt Proximity & 8px Grid)

The Gestalt Principle of Proximity states that elements placed near each other are perceived as related. The system applies this through a strict **8-point grid system** — a standard that ensures all spacing decisions are mathematically consistent and visually harmonious.

- All spacing values must be multiples of 8px (or 4px for micro-adjustments).
- Related elements (e.g., order card details) share tight proximity; independent actions (e.g., the "New Order" button) are spatially isolated.
- This creates implicit grouping without requiring borders or labels, directly reducing cognitive load.

### 1.11 F-Pattern Eye-Scanning Compliance *(NEW in v3.0)*

NNGroup eye-tracking research (Nielsen & Pernice, *Eyetracking Web Usability*, 2010) establishes that in text-heavy and operational interfaces, users scan in an **F-shaped pattern**: a dominant horizontal sweep across the top, a secondary sweep further down, then a vertical scan down the left edge. Right-column content receives the fewest fixations.

Applied to this dashboard:

- **Top horizontal zone:** Topbar ("New Order" CTA, date, notifications), KPI row. All primary actions and status-critical KPIs live here.
- **Left-anchored vertical zone:** Sidebar navigation, first Kanban column (Queue). Users naturally scan here second.
- **Right-column rule:** Persistent panels in the right column are **prohibited** for primary CTAs or status-critical content. Right-column space is reserved exclusively for Admin-gated analytics accessible only via the collapsible `AdminDrawer`.

---

## 2. Design System (Tokens)

### 2.1 Color Palette

> **Logo analysis (verified):** Programmatic extraction of `logo.svg` confirms the logo uses **exactly one fill color: `#15489d`** (Brand Blue). All elements — wordmark, icon marks, decorative dots — share this single hue. The logo does not contain cyan, white, or any secondary hue as a defined brand color. The cyan tones used in this spec are **derived** from Brand Blue using color theory (analogous harmony and tint progression), not extracted from the logo. This distinction is critical for maintaining design integrity.

#### 2.1.1 Color Derivation Logic

The full palette is constructed from the single logo color using three systematic rules:

1. **Brand Blue (`#15489d`) as anchor.** All other hues are derived from or contrasted against this.
2. **Analogous harmony for secondary/interactive colors.** Colors within ~30° of Brand Blue on the hue wheel (blue-cyan range, hue ~195–210°) are used for interactive and lifecycle states, creating visual cohesion without contrast conflict.
3. **Semantic color standards for functional states.** Green (success), amber (warning), and rose (danger) are drawn from established semantic conventions — universally understood independent of brand — and confirmed accessible against the neutral background.

#### 2.1.2 Full Color Table

| Category | Token Name | Hex Value | Derivation | Usage Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Dominant (60%)** | `neutral-50` | `#f8fafc` | Tailwind standard; near-white tint | Page background — reduces eye fatigue vs. pure white |
| **Secondary (30%)** | `neutral-100` | `#f1f5f9` | Tailwind standard; slight step darker | Card surfaces, sidebar background |
| **Brand (Accent 10%)** | `brand-blue` | `#15489d` | **Source — extracted from logo.svg** | Primary CTA buttons; Folding state badge; Active nav indicator |
| **Interactive** | `brand-cyan-dark` | `#1a7fa8` | Analogous (~30° shift from brand-blue toward cyan); darkened for contrast compliance | Links, interactive icons, active tabs — on white backgrounds only |
| **Lifecycle** | `brand-cyan` | `#30a8d4` | Analogous tint of `brand-cyan-dark`; lighter, decorative | Drying state badge bg; Active Cycles pulse indicator — background/decorative only |
| **Queue / Accepted** | `slate-200` | `#e2e8f0` | Neutral; no hue association | Badge background only (Accepted/Queue — "not yet active") |
| **Queue Text** | `slate-600` | `#475569` | Dark neutral | Accepted badge label text |
| **Washing Start** | `light-cyan` | `#a5f3fc` | Cyan tint — analogous to brand-blue family | Badge background only (Washing state) |
| **Success** | `emerald-100` | `#d1fae5` | Green semantic — universal "complete" signal | Badge background only (Ready for Pickup, Claimed) |
| **Success Text** | `emerald-700` | `#047857` | Dark green for contrast on `emerald-100` | Badge label text; Ready for Pickup column accent |
| **Warning / Drying** | `amber-100` | `#fef3c7` | Amber semantic — "in progress, warm" | Badge background only (Drying; Exceptions) |
| **Warning Text** | `amber-700` | `#b45309` | Dark amber for contrast on `amber-100` | Drying badge label; Exception label text |
| **Error / Danger** | `rose-700` | `#be123c` | Red semantic — universal "destructive/danger" | Destructive text, validation errors only |
| **Surface (dark)** | `slate-900` | `#0f172a` | Deep neutral | Dark mode base canvas |
| **Surface (light)** | `white` | `#ffffff` | — | Primary content areas, modal backgrounds |

> ⚠️ **WCAG AA Compliance (verified contrast ratios):**
> - `brand-blue` (`#15489d`) on `white`: **8.59:1** ✅ — Primary CTA, active nav.
> - `brand-cyan-dark` (`#1a7fa8`) on `white`: **4.61:1** ✅ — Passes AA; restricted to white backgrounds only. Fails on `neutral-50` (4.40:1) ❌ — do not use on off-white surfaces.
> - `brand-cyan` (`#30a8d4`) on `white`: **2.74:1** ❌ — Fails AA. **Not permitted for text.** Decorative and background use only.
> - `rose-700` (`#be123c`) on `white`: **6.94:1** ✅; on `neutral-50`: **6.12:1** ✅
> - `emerald-700` (`#047857`) on `emerald-100`: **7.2:1** ✅
> - `amber-700` (`#b45309`) on `amber-100`: **7.3:1** ✅
> - `slate-600` (`#475569`) on `slate-200`: **4.64:1** ✅
> - All light background tokens (`light-cyan`, `emerald-100`, `amber-100`, `slate-200`) are **badge backgrounds only** — never used as text color.

#### 2.1.3 Extended Token Documentation

The following tokens are defined in `tailwind.config.ts` but were not documented in prior spec versions. They are now formally declared with their semantic roles.

| Token | Hex | Tailwind Key | Semantic Role | Usage Rule |
| :--- | :--- | :--- | :--- | :--- |
| `orange-500` | `#f97316` | `orange.DEFAULT` | Extended warning / heat accent | Used in `KPICard` variant styling and chart series color for secondary data series. Not a primary brand color. Must not replace `amber` in lifecycle status badges. |
| `purple-500` | `#a855f7` | `purple.DEFAULT` | Extended accent / chart color | Used for secondary chart data series (e.g., order count line vs. revenue line in `RevenueChart`). Provides visual distinction from brand-blue in multi-series charts. Not a status or action color. |

> These are **supplementary chart and variant colors** only. They carry no semantic status meaning (not success/warning/error) and must not be used for status badges, form validation, or navigation states.

#### 2.1.4 RELEASED vs READY_FOR_PICKUP Visual Distinction

> **Critical rule:** `RELEASED` (UI label: "Claimed") and `READY_FOR_PICKUP` (UI label: "Ready for Pickup") must be **visually distinct** from each other. Sharing the same emerald color violates the Gestalt Law of Similarity — same color implies same meaning, but these two statuses have fundamentally different operational implications.

| Status | Bg Class | Text Class | Semantic Signal |
| :--- | :--- | :--- | :--- |
| `READY_FOR_PICKUP` | `emerald-100` | `emerald-700` | **Active urgency** — customer needs to be called; laundry is waiting |
| `RELEASED` (Claimed) | `emerald-50` | `slate-500` | **Terminal completion** — transaction closed, no further action needed |

The `RELEASED` state uses a muted `slate-500` text on a very light `emerald-50` background to signal "done and closed" rather than "actively ready." This desaturation communicates completion without falsely implying urgency. All badge rendering for `RELEASED` must use `ORDER_STATUS_META[ORDER_STATUS.RELEASED]` — never hardcoded inline styles.

### 2.2 Typography System

Font selection follows three criteria grounded in brand identity, operational context, and legibility research:

1. **Brand alignment** — Does the typeface reflect the character of the business?
2. **Operational legibility** — Can it be read accurately under time pressure at small sizes on a standard office/laptop display?
3. **Technical reliability** — Is it available via `next/font` with zero layout shift and no licensing cost?

Faith Laundry Shop is a small, community-oriented Filipino service business (CS-001 §2.1) serving local customers in Iloilo City. The system is not a consumer product — it is an internal operational tool used exclusively by the Admin and one Staff member. Typography must project **clarity, trustworthiness, and professionalism** without the corporate coldness of pure geometric fonts or the informal warmth of rounded display fonts.

#### 2.2.1 Font Selection & Rationale

| Role | Font | Classification | Why This Font |
| :--- | :--- | :--- | :--- |
| **Display / Headings** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | Geometric humanist sans-serif | Combines geometric structure (modern, trustworthy) with humanist details (approachable, community-oriented). The 800-weight display titles provide authority for KPI numbers without feeling corporate. Excellent optical rendering at 14–36px on 96dpi screens. Freely available via Google Fonts / `next/font`. |
| **Body / Data** | [Inter](https://rsms.me/inter/) | Humanist sans-serif, screen-optimized | Designed specifically for computer screens by Rasmus Andersson. Features a tall x-height, open apertures, and spacing tuned for 11–16px rendering — critical for high-density data tables and the `Body Small` (13px) scale. The de-facto standard for operational dashboards and SaaS products. Freely available. |
| **Identifiers / Mono** | [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Monospace, screen-optimized | Designed for code editors where character disambiguation is critical. The `0/O` and `1/l` disambiguation is explicitly engineered into the letterforms. Mandated for Order IDs (`LDR-YYYYMMDD-XXXX`) and timestamps to prevent misreading under operational pressure — directly mitigating the order mix-up risk identified in CS-001 §4.1 and INT-001 Q13. Freely available. |

#### 2.2.2 Typography Scale & Tokens

| Scale Name | Font | Size | Weight | Line Height | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Display` | Plus Jakarta Sans | 2.25rem (36px) | 800 | 1.2 | -0.02em | KPI numbers, Dashboard titles |
| `H1` | Plus Jakarta Sans | 1.875rem (30px) | 700 | 1.2 | -0.01em | Primary page titles |
| `H2` | Plus Jakarta Sans | 1.5rem (24px) | 600 | 1.3 | -0.01em | Section headers |
| `H3` | Plus Jakarta Sans | 1.125rem (18px) | 600 | 1.3 | 0 | Card titles, group headers |
| `Body` | Inter | 0.875rem (14px) | 400 | 1.5 | 0.01em | **Standard text** |
| `Body Small` | Inter | 0.8125rem (13px) | 400 | 1.5 | 0.01em | Secondary data, metadata |
| `Caption` | Inter | 0.75rem (12px) | 500 | 1.4 | 0.02em | Form labels, table headers |
| `Mono` | JetBrains Mono | 0.75rem (12px) | 400 | 1.4 | 0 | Order IDs, Timestamps |

> **Line height rationale:** Body text uses `1.5` — the W3C recommended minimum for readability (WCAG 1.4.12 Text Spacing). Display and heading sizes use tighter `1.2–1.3` because large type at generous line height creates excessive vertical space that disrupts scanning rhythm. Negative letter spacing at large display sizes (-0.01em to -0.02em) compensates for optical spread, a standard typographic practice for geometric sans-serifs at display weights.

#### 2.2.3 Readability & Loading Strategy

- **Paragraph Constraint:** Prose text (notes, descriptions) must cap at `65ch` (~560px). Research by Robert Bringhurst (*The Elements of Typographic Style*) and the Baymard Institute establishes 50–75 characters per line as the optimal measure for reading comfort. `65ch` is the operational midpoint.
- **Loading Strategy:** Mandate `next/font` with `display: swap` to prevent Cumulative Layout Shift (CLS) and ensure text is visible during font load. Font files must be self-hosted via `next/font` — not loaded from an external CDN — to satisfy data privacy standards and eliminate network dependency.

### 2.3 Spacing & Layout (8px Grid)

The system adheres to an **8px base grid** — the standard established by Google Material Design, Apple HIG, and the Atlassian Design System. It maps cleanly to most screen pixel densities and produces mathematically predictable spacing relationships.

| Token | Value | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| `space-1` | 4px | `p-1`, `m-1` | Micro-gaps (icon to label, badge padding) |
| `space-2` | 8px | `p-2`, `m-2` | Small padding, inline element gaps |
| `space-3` | 12px | `p-3`, `m-3` | **High-density** table row padding |
| `space-4` | 16px | `p-4`, `m-4` | Standard card padding, form field gaps |
| `space-6` | 24px | `p-6`, `m-6` | Section spacing, container padding |
| `space-8` | 32px | `p-8`, `m-8` | Page-level horizontal margins |

- **Density Mode:** This is a task-execution tool, not a reading interface. Use high-density spacing for data grids (`py-3` for table rows) to maximize visible information. The client operates a small shop where seeing more orders at once reduces the need to scroll.
- **Sidebar Width:** Desktop sidebar transitions between `220px` (Expanded) and `72px` (Collapsed). The expanded width is the minimum comfortable width for labels; the collapsed width is optimized for icon visibility and alignment with the 8px grid.
- **Kanban Column Min-Width:** `200px` per column. Total minimum pipeline width = `5 × 200px + 4 × 16px gap = 1064px`. Combined with `220px` sidebar + `32px` margins = `1316px` — fits within `1366px` viewport with 50px to spare.

### 2.4 Border, Shadow & Elevation

#### 2.4.1 Border Radius

| Token | Value | Usage |
| :--- | :--- | :--- |
| `radius-sm` | 4px | Checkboxes, small tags, inline badges |
| `radius-md` | 8px | Input fields, primary buttons |
| `radius-lg` | 12px | Cards, modals, main containers |
| `radius-full` | 9999px | Pill badges, avatar circles |

> **Rationale:** Consistent border radius creates visual family cohesion (Gestalt Similarity). The progression from `4px` (tight, precise) for small elements to `12px` (softer, approachable) for containers reflects the information hierarchy — larger containers are more visually relaxed; smaller interactive elements are more precise.

#### 2.4.2 Shadow & Elevation (Z-Index)

- **Base:** No shadow — flat surfaces are the default. Reduces visual noise in a data-dense dashboard.
- **Raised (Cards):** `shadow-sm` (`0 1px 2px rgba(0,0,0,0.05)`) for standard Kanban order cards.
- **Floating (Modals, AdminDrawer):** `shadow-xl` with `bg-slate-900/50` backdrop scrim.
- **Z-Index Scale (strict layering):**

  | Layer | Z-Index | Elements |
  | :--- | :--- | :--- |
  | Content | 0 | Page content, Kanban cards |
  | Sidebar / Nav | 100 | Left sidebar |
  | FAB | 150 | Floating Action Button (mobile only) |
  | Dropdowns | 200 | Select menus, autocomplete lists |
  | Modals | 300 | Dialog overlays |
  | Toasts | 400 | `UndoToast`, success notifications |

#### 2.4.3 Glassmorphism System

The system uses a glassmorphism visual layer for the login screen, `MeshBackground`, and glass `Card` variants. This is a formally defined design pattern — not ad-hoc frosted-glass effects.

**CSS Utilities (defined in `globals.css`):**

| Class | Properties | Usage |
| :--- | :--- | :--- |
| `.glass` | `bg: rgba(255,255,255,0.7)`, `backdrop-filter: blur(16px) saturate(160%)`, `border: 1px solid rgba(255,255,255,0.4)` | Primary glass surface — login card, modal overlays on mesh background |
| `.glass-light` | `bg: rgba(255,255,255,0.2)`, `backdrop-filter: blur(8px)` | Lighter glass — decorative secondary containers |

**`MeshBackground` component:** Renders a decorative animated gradient mesh behind the login screen and public portal. It is a presentational-only atom (`src/components/ui/MeshBackground.tsx`) that accepts no props. It is applied in the `(dashboard)/layout.tsx` to provide ambient depth, and in the `(auth)` and `(public)` layouts to create the brand-immersive entry experience.

**Usage rules:**
- `.glass` and `.glass-light` are applied via the `Card` component's `variant` prop (`variant="glass"` or `variant="glass-light"`). Never apply `backdrop-filter` manually in component files.
- Glassmorphism backgrounds must use `MeshBackground` — never inline gradient styles.
- Print styles in `globals.css` suppress all `backdrop-filter` and glass backgrounds automatically (`@media print`).

### 2.5 Iconography (Lucide System)

The system exclusively uses the **[Lucide Icon Library](https://lucide.dev)** — open-source, MIT-licensed SVG icons with a consistent 24×24 grid and 2px stroke weight, rendering cleanly at all required sizes.

| Context | Size | Usage |
| :--- | :--- | :--- |
| `Inline` | 16px | Inside text, badge secondary cues (WCAG 1.4.1 requirement) |
| `Action / Button` | 20px | CTA buttons, Kanban advance buttons |
| `Navigation` | 24px | Sidebar nav items |
| `Empty State` | 48px | Empty state illustrations |

> **Icon-text pairing (mandatory):** Per the redundant signaling requirement (§1.2), no icon may appear without an accompanying text label in a functional context. Icon-only buttons are permitted in navigation items only when a label appears on hover/focus as a tooltip.

### 2.6 Interactive & Form States

All form inputs and interactive elements must render five distinct, unambiguous states. State changes must animate within `150ms` to feel responsive without being distracting.

| State | Visual Feedback |
| :--- | :--- |
| **Default** | Border `slate-200`, Background `white/70` |
| **Focus** | Border `brand-blue`, `ring-2 ring-brand-blue/20` |
| **Error** | Border `rose-700`, text `rose-700`, error message below input |
| **Disabled** | Opacity `0.5`, cursor `not-allowed`, BG `slate-100` |
| **Read-Only** | Border transparent, BG transparent, no pointer-events |

> **Focus ring (mandatory):** The `ring-2 ring-brand-blue/20` focus indicator is required by WCAG 2.4.7 (Focus Visible) and must never be suppressed via `outline: none` without a visible replacement indicator.

### 2.7 Motion & Animation

Micro-interactions must be purposeful and subtle — they provide feedback, not entertainment.

- **Duration:** `150ms` for hover/active state changes; `300ms` for modal and drawer entry/exit transitions.
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` — the Material Design standard ease-in-out curve. Provides natural deceleration that reads as physical rather than mechanical.
- **Pulse animation:** `brand-cyan` pulse on the Active Cycles KPI card live badge; emerald pulse ring on the "Ready for Pickup" column dot. Period: `1.8s ease-out infinite`. The `1.8s` period is long enough to feel ambient (not alarming) while still drawing attention within a 5-second dashboard view.
- **Accessibility (mandatory):** All non-essential animations must be disabled when `@media (prefers-reduced-motion: reduce)` is active. Static indicator states replace all animated variants.

### 2.8 Design Justification (Rationale)

This section provides verifiable theoretical grounding for all design decisions, ensuring defensibility to academic reviewers and preventing regressions by future contributors.

#### 2.8.1 Color Psychology & Identity (verified against logo.svg)

- **Primary Blue (`#15489d`) — Logo Source:** This is the only color in the logo SVG. Blue occupies the cool-hue range associated with **trust, competence, and stability** in color psychology (Elliot & Maier, 2014; Hemphill, 1996). For a business that handles customers' clothing and collects payment at pickup (INT-001 Q10), trust signaling is the highest-priority affective goal. Blue achieves this while remaining culturally neutral across Filipino commercial contexts.
- **Derived Cyan (`#30a8d4`, `#1a7fa8`) — Analogous Harmony:** Cyan sits approximately 25–30° counterclockwise from Brand Blue on the HSL hue wheel. Analogous color schemes (hues within 30° of each other) are visually harmonious and non-competing (Itten, *Art of Color*, 1961). The cyan family provides interactive and lifecycle differentiation without introducing hue conflict with the brand anchor.
- **Neutral Foundation (`#f8fafc`) — Eye Fatigue Reduction:** Pure white (`#ffffff`) under LED monitor backlighting creates a high-luminance field that causes eye strain over extended use (Sheedy et al., 2003). The Admin and Staff may operate this system for 8+ hours; `#f8fafc` (approx. 97.5% luminance) meaningfully reduces glare while remaining visually "white" to users.
- **Slate-200 for Queue/Accepted state:** Neutral gray signals "pending, not yet active" — analogous to a physical inbox tray before work begins (INT-001 Q4 describes the real-world equivalent: clothes in a labeled bag awaiting processing). No hue association means no semantic confusion with active lifecycle states.

#### 2.8.2 Semantic Color Rationale

- **Emerald (Success / Ready / Claimed):** Green is the universal "safe / complete / go" semantic signal — established across traffic systems, UI conventions, and cross-cultural studies. Emerald's cool-green hue remains distinguishable from the blue-cyan brand family under standard color-deficiency simulations (deuteranopia, protanopia).
- **Amber (Drying / Warning):** Amber occupies the yellow-orange range, universally associated with caution and warmth. Its use for the Drying stage (laundry is actively in a machine, not yet done) reinforces the "in-progress, warm" metaphor. Amber is culturally neutral in the Filipino commercial context.
- **Rose/Red (Danger only):** Red is the strongest urgency signal in color psychology and is reserved exclusively for destructive or irreversible actions (order cancellation, validation errors). Overusing red causes **alert fatigue** (Edworthy & Hellier, 2006) — users begin to ignore signals when they appear too frequently. By limiting `rose-700` to genuine danger states, the signal retains its effectiveness.

#### 2.8.3 Evidence-Based Accessibility Remediation (WCAG 2.1 AA)

A contrast audit of all brand colors against the WCAG 2.1 Level AA standard (4.5:1 for normal text; 3:1 for large text and UI components) identified a critical failure: **Brand Cyan (`#30a8d4`) achieves only 2.74:1 on white.** Rather than adjusting the brand color (which is derived, not primary), the remediation is architectural: Cyan is prohibited from all text roles and restricted to background and decorative uses only. Brand Blue (`#15489d`) at 8.59:1 serves all primary text and CTA roles.

#### 2.8.4 Redundant Signaling Compliance (WCAG 1.4.1)

WCAG 1.4.1 (Use of Color) prohibits using color as the **sole** visual differentiator for any information. Every status in this system pairs:

1. A background color token (e.g., `emerald-100`)
2. A foreground text color token (e.g., `emerald-700`)
3. A Lucide icon (e.g., `CheckCircle2Icon`)
4. A text label sourced from `UI_LABELS` (e.g., "Ready for Pickup")

This four-layer redundancy ensures operability for users with deuteranopia, protanopia, and tritanopia, as well as in outdoor or high-glare environments relevant to a laundry shop with open frontage.

#### 2.8.5 F-Pattern & CTA Placement Justification *(NEW in v3.0)*

NNGroup's eye-tracking studies (Nielsen & Pernice, *Eyetracking Web Usability*, 2010) establish that users in task-oriented interfaces fixate most heavily on the top-left to top-right horizontal band, then down the left edge. The right column receives the fewest fixations. Placing the primary CTA ("New Order") in a right-column panel — as in v2.1 — violates Fitts's Law (longer acquisition distance from any active task) and F-pattern principles (low-fixation zone). The v3.0 revision anchors "New Order" in the topbar right zone, within the primary horizontal sweep, guaranteeing visibility on every dashboard page view without deliberate search.

#### 2.8.6 Typography Brand-Context Justification *(NEW in v3.0)*

Font selection was validated against three criteria specific to Faith Laundry Shop's identity:

1. **Community service character:** Plus Jakarta Sans's humanist terminals (curved stroke endings) convey approachability — appropriate for a neighborhood laundry shop — while the geometric underlying structure projects order and reliability. This balances the dual identity: friendly to local customers, professional in internal operations.
2. **Philippine display environment:** The vast majority of staff-facing systems in the Philippine SME context are used on 1366×768 displays at standard 96dpi. Inter's screen-optimization (tight hinting, generous x-height) was designed for precisely this density range, unlike print-optimized fonts that render poorly at body sizes on standard office monitors.
3. **Forensic legibility for order identifiers:** INT-001 Q13 confirms that staff physically verify the order stub against the claimed laundry before release. JetBrains Mono's explicit disambiguation of `0/O`, `1/l`, and `I/l` reduces the risk of misreading an Order ID under time pressure — directly mitigating the mix-up risk identified in CS-001 §4.1.

---

## 3. Core Workflows (HCI-Optimized)

### 3.1 Focused Intake Wizard *(US-01, US-02)*

The Order Intake process is the most critical staff workflow. To ensure high administrative velocity and zero data-entry errors, the system utilizes a **Dedicated Route Wizard** (`/orders/new`).

- **HCI "Focus Mode":** Unlike the legacy side-sheet, the Wizard occupies the full viewport, stripping away dashboard noise to create a distraction-free "POS environment."
- **4-Step Progressive Disclosure:**
    1. **Step 1: Identify Client** — Predictive search or quick-registration.
    2. **Step 2: Service Details** — Large selection cards (HCI Target Size optimization) and weight entry.
    3. **Step 3: Extras & Notes** — Consumables and special handling instructions.
    4. **Step 4: Review & Payment** — Financial summary and built-in settlement module.
- **Visibility of Context (The LiveTicket™):** A persistent "Live Ticket" preview sits on the right sidebar. As the user enters data in the wizard (left), the ticket updates in real-time (right), providing immediate system feedback (Doherty Threshold).
- **Live Pricing Engine:** Grand total updates instantly as Weight or Service Type is changed. Calculation logic is centralized in the `usePriceCalculation` hook.
- **Dynamic Add-ons:** Dedicated interface for detergents and fabric conditioners (INT-001 Q9).

### 3.2 Status Management *(US-03, US-05)*

- **Process Timeline:** The `ProcessStepper` component renders the full order lifecycle:

  ```
  RECEIVED → WASHING → DRYING → FOLDING → READY_FOR_PICKUP → CLAIMED
  ```

  Labels shown in the UI come from the modular `UI_LABELS` object in `src/constants/ui/`. Raw enum values (e.g., `RELEASED`) must never appear directly in the rendered UI.

- **Next Step Logic:** The UI shows only the *single next logical action*. If an order is "Washing", the only prominent button is **"Move to Dryer"**. This prevents staff from skipping steps or becoming confused by too many options (Hick's Law, §1.5).
- **Dashboard Pipeline:** All 5 active statuses (Accepted through Ready for Pickup) must appear as Kanban columns. "Claimed" is a terminal state rendered only in Order History, not as a pipeline column.

### 3.3 Account Settlement *(US-06)*

- **Validation Shield:** The "Settle Balance" button is disabled until the payment method is selected and amount confirmed.
- **Visual Confirmation:** `PaymentLedgerTable` actions provide visual feedback on successful settlement. Per INT-001 Q10, payment is collected at pickup — the settlement flow must be accessible directly from the "Confirm Pickup" action.

### 3.4 Public Tracking Portal *(US-04)*

- **Zero-Login Access:** Accessible at `(public)/track` — no authentication required. The reference number is entered as a search input on the page itself (not a URL dynamic segment). Directly addresses the client's stated priority: "Customers should receive updates and track laundry status" (INT-001 Q25).
- **Anonymized Data:** Renders Process Stage and order summary only. Hides internal notes, staff names, and financial amounts.

---

## 4. Security & Forensic Traceability

### 4.1 Role-Based Access Control (RBAC)

- **Admin Sovereignty:** Business Insights, Pricing Rules, and payment logs are restricted to the `Admin` role. Per INT-001 §9.1, the Admin is solely responsible for managing records.
- **Staff Restriction:** Staff access order management and operational statuses only.
- **Unauthorized Access:** Renders a full-screen `AccessDenied` component with `ShieldAlert` iconography — not a silent redirect or hidden nav link.
- **Nav Visibility:** Items the current role cannot access display a lock icon. They are not hidden — Staff should understand the system's full capability (Nielsen H1: Visibility of System Status).

### 4.2 Forensic Audit Trail

- **Immutable Logs:** Every status change is recorded with a timestamp and the initiating Staff ID. Directly addresses the "lack of automated reporting" problem in CS-001 §4.1.
- **Transaction Ledger:** Settled transactions cannot be modified.
- **Reference Format:** All orders use the format `LDR-YYYYMMDD-XXXX`. Defined once in `lib/constants/order-status.ts` as `REFERENCE_FORMAT`. Sequential IDs (e.g., `TXN-001`) and raw timestamp IDs are not valid formats — `LDR-YYYYMMDD-XXXX` provides date context at a glance, reducing the cognitive load of identifying an order's age without opening it.

---

## 5. Component Library Architecture

### 5.1 DRY Authoring Rules

Before creating any new component, apply these checks in order:

1. **Does a similar component already exist?** Check `components/ui/` first. Extend via props before creating a new file.
2. **Is this a variant of an existing component?** Add a `variant` prop — do not create a separate component file.
3. **Does it contain business logic?** Extract that logic into a hook. The component file is for presentation only.

### 5.2 UI Components — Atoms

> Atoms must be **logic-free** and **purely prop-driven**. All prop shapes are defined as TypeScript interfaces in `types/components.ts` — not as inline types inside component files. Component names below match actual filenames in `src/components/ui/`.

| Component | File | Purpose | Key Props |
| :--- | :--- | :--- | :--- |
| `Avatar` | `Avatar.tsx` | User initial avatar | `name`, `size?` |
| `Button` | `Button.tsx` | All action triggers (was `PrimaryButton` in v2.x — corrected) | `variant: 'primary'\|'action'\|'secondary'\|'danger'\|'ghost'\|'outline'`, `size?`, `isLoading?`, `leftIcon?` |
| `Card` | `Card.tsx` | Container with optional glass variant (was `GlassCard` in v2.x — corrected) | `variant: 'default'\|'glass'\|'glass-light'\|'accent'`, `className?` |
| `CardSkeleton` | `CardSkeleton.tsx` | Skeleton placeholder for cards during load | `className?` |
| `ChartSkeleton` | `ChartSkeleton.tsx` | Skeleton placeholder for chart areas | — |
| `ConfirmDialog` | `ConfirmDialog.tsx` | Accessible confirmation dialog | `isOpen`, `title`, `description`, `onConfirm`, `onCancel`, `isDestructive?` |
| `Input` | `Input.tsx` | Text input with label, error, and icon slots | `label?`, `error?`, `variant?`, `icon?` |
| `KPICard` | `KPICard.tsx` | Metric card for dashboard overview | `title`, `value`, `icon?`, `variant?`, `pulse?`, `onClick?` |
| `MeshBackground` | `MeshBackground.tsx` | Decorative animated mesh gradient (see §2.4.3) | — |
| `Modal` | `Modal.tsx` | Standardized dialog overlay (was `ModalWrapper` in v2.x — corrected) | `isOpen`, `onClose`, `title?`, `size?` |
| `PaymentStatusBadge` | `PaymentStatusBadge.tsx` | Payment-specific status pill | `status: PaymentStatus` |
| `SegmentedControl` | `SegmentedControl.tsx` | Multi-option tab switcher | `options`, `value`, `onChange` |
| `Select` | `Select.tsx` | Accessible select input | `label?`, `error?`, `variant?` |
| `SideSheet` | `SideSheet.tsx` | Slide-out panel for detail flows | `isOpen`, `onClose`, `title?` |
| `StatusBadge` | `StatusBadge.tsx` | Order lifecycle status pill | `status?: OrderStatus`, `variant?`, `label?`, `icon?` |
| `TableSkeleton` | `TableSkeleton.tsx` | Skeleton placeholder for table rows | `rows?` |
| `UndoToast` | `UndoToast.tsx` | 5-second recovery notification (powered by `sonner`) | `message`, `onUndo`, `duration?` |

> `StatusBadge` resolves its own color, icon, and label from `ORDER_STATUS_META` when `status` is provided. It **must** render an icon as a secondary cue alongside the text label to satisfy WCAG 1.4.1 (§2.8.4). Manual `label` + `icon` props are available for non-order status uses (e.g., payment status — use `PaymentStatusBadge` for `PaymentStatus` values).

### 5.3 Pattern Components — Molecules & Organisms

Component names below match actual filenames. Organized by folder location within `src/components/`.

**`components/layout/` — Shell components:**

| Component | Purpose |
| :--- | :--- |
| `Sidebar` | Desktop fixed navigation sidebar (220px), driven by `NAVIGATION_GROUPS` from `src/config/navigation.ts` |
| `Topbar` | Persistent top bar with page title and "New Order" CTA |
| `MobileNav` | Mobile slide-out navigation |
| `PageHeader` | Standardized page header with title, icon, and action slot |
| `AuthGuard` | Client-side RBAC route protection wrapper |

**`components/features/shared/` — Cross-feature reusable patterns:**

| Component | Purpose |
| :--- | :--- |
| `DataTable` | Type-safe data grid with consistent hover, sort, and loading states |
| `Pagination` | Navigation controls for multi-page data |
| `FilterBar` | High-affordance "Search & Filter" container |
| `ProcessStepper` | Visual 6-stage order lifecycle timeline |
| `EmptyState` | Consistent empty state: icon + title + description + optional CTA |
| `LoadingState` | Fallback spinner/state for Suspense boundaries |
| `ErrorState` | Error display for caught exceptions |
| `SectionHeader` | Section title with optional "View All" link |
| `AccessDenied` | Full-screen RBAC rejection screen with `ShieldAlert` icon |

**`components/features/dashboard/` — Dashboard organisms:**

| Component | Purpose |
| :--- | :--- |
| `OrderPipeline` | 5-column Kanban pipeline (`RECEIVED → READY_FOR_PICKUP`) |
| `OrderCard` | Compact order card within pipeline column, with One-Tap Advance |

**`components/features/orders/` — Order feature organisms:**

| Component | Purpose |
| :--- | :--- |
| `OrderQueueTable` | High-density data grid for the Orders list page |
| `IntakeWizard` | Multi-step wizard for new order creation (replaces legacy `OrderIntakeForm`) |
| `OrderStatusTimeline` | Chronological event log for a single order |

**`components/features/payments/` — Payment feature organisms:**

| Component | Purpose |
| :--- | :--- |
| `PaymentLedgerTable` | High-density data grid for the Payments page |
| `PaymentActionModal` | Modal interface for recording payment settlement |
| `PaymentDetailsModal` | Modal for viewing full details of a settled payment record |

**`components/features/reports/` — Reports organisms:**

| Component | Purpose |
| :--- | :--- |
| `RevenueChart` | Recharts-based sales analytics chart (Admin only) |
| `DetailedSalesTable` | Paginated transaction history for the Reports page |

**`components/features/activity/` — Activity log organisms:**

| Component | Purpose |
| :--- | :--- |
| `ActivityDetailsModal` | Modal showing full before/after details for a forensic audit log entry |

**`components/features/customers/` — Customer feature organisms:**

| Component | Purpose |
| :--- | :--- |
| `CustomerEditModal` | Modal for editing an existing customer profile |

**`components/features/notifications/` — Notification feature organisms:**

| Component | Purpose |
| :--- | :--- |
| `NotificationDetailsModal` | Modal showing full detail for a single system alert |
| `NotificationPopover` | Inline bell-icon popover in Topbar showing recent unread alerts |

**`components/features/users/` — User management organisms:**

| Component | Purpose |
| :--- | :--- |
| `UserModal` | Modal for creating or editing a staff account (Admin only) |

**`components/providers/` — Infrastructure providers:**

| Component | Purpose |
| :--- | :--- |
| `QueryProvider` | Configured `QueryClient` wrapper for TanStack Query |

### 5.4 Navigation Architecture

**[Team Convention]** The Sidebar navigation is driven by `NAVIGATION_GROUPS` — a typed array exported from `src/config/navigation.ts`. Each `NavGroup` has an `id`, `label`, optional `role` (restricts group to that role), and an array of `NavItem` objects containing `href`, `label`, `icon`, and optional `role`.

Navigation is structured into two functional groups:

| Group ID | Label | Role Gate | Items |
| :--- | :--- | :--- | :--- |
| `operations` | Operations | None (all authenticated) | Dashboard (`/overview`), Orders, Customers, Notifications |
| `administration` | Administration | `ADMIN` only | Reports, Payment Ledger, Staff Accounts, Service Rates, Activity Log |

The `Sidebar` component renders each group as a labeled section with a divider. Items in a restricted group are either hidden or shown with a lock icon depending on the configured role gate. To add or reorder navigation items, edit `src/config/navigation.ts` — never the `Sidebar` component directly.

### 5.5 Form Library Pattern

**[Team Convention]** All forms use `react-hook-form` with validation wired via `@hookform/resolvers/zod`. The pattern is:

1. Define the Zod schema in `src/lib/validators.ts`.
2. Call `useForm({ resolver: zodResolver(schema) })` in the component or a local hook.
3. Pass `register`, `handleSubmit`, and `formState.errors` to controlled form atoms (`Input`, `Select`, `SegmentedControl`).

Inline validation logic in JSX is prohibited. Schema definitions in component files are prohibited — all schemas live in `validators.ts`.

**Toast notifications** are provided by the `sonner` library, configured globally and integrated with `UndoToast`. New toast calls must use `sonner`'s `toast()` API — not custom state-based toast components.

---

## 6. Accessibility & Responsiveness

- **Contrast Ratio:** All text-to-background combinations must exceed 4.5:1 (WCAG 2.1 AA). See verified ratios in §2.1.2.
- **Touch Targets:** All interactive elements must have a minimum hit area of **44×44px** (Apple HIG; WCAG 2.5.5 AAA). Applies on desktop as well — staff may use a touchscreen point-of-sale setup.
- **Focus Visible:** All interactive elements must render a visible focus indicator. Never suppress `outline` without a visible replacement. Required by WCAG 2.4.7.
- **Responsive Breakpoints:**
  - **Mobile (`< 640px`):** Stacked layouts, bottom navigation, pipeline scrolls horizontally per column. Not the primary use case — the system is primarily desktop.
  - **Tablet (`640px – 1024px`):** Grid adjustment, sidebar visible, pipeline shows 2–3 columns with horizontal scroll for remainder.
  - **Desktop (`> 1024px`):** Full 5-column pipeline layout with optional `AdminDrawer`.
- **Minimum Supported Width:** `1280px` for the full dashboard layout. At `1366px` (the most common display resolution in Philippine office and academic environments), the 5-column pipeline must render without horizontal overflow.
- **State Persistence:** All registry pages must synchronize pagination and filter state with URL Search Parameters, so browser back/forward navigation preserves context.
- **Loading & Empty States:**
  - **Skeletons:** `neutral-200` to `neutral-100` pulse animation; dimensions must match the target content to prevent layout shift.
  - **Empty States:** Center-aligned; includes a Lucide icon at 48px, `H3` title, and a one-sentence descriptive body in `Inter 14px`.
  - **Empty Pipeline Column:** Renders a muted "Capacity available" message with a `+` icon. A blank column is prohibited — it would violate Nielsen H1 (the user cannot distinguish an empty state from a load failure).
- **Print Optimization:** The "Print Claim Stub" feature must suppress all navigation, sidebar, background effects (glassmorphism), and color fills to produce high-contrast black-on-white output suitable for the shop's thermal receipt printer (CS-001 §3.1 identifies the physical claim stub as the primary customer artifact).

---

## 7. Canonical Lexicon

> These are the **mandated UI labels** for all visible text. Stored in a modular directory structure under `src/constants/ui/`, aggregated into a single `UI_LABELS` object for system-wide use. Hardcoded label strings in JSX files are strictly prohibited. This lexicon is derived directly from the language used by the Admin and Staff in INT-001 and CS-001.

| System Concept | User-Friendly Label | Definition |
| :--- | :--- | :--- |
| Primary CTA | **New Order** | Recording laundry when a customer drops off items |
| Dashboard | **Dashboard** | The central home screen for shop status |
| Order List | **Orders** | The list of all current and past orders |
| Customer List | **Customers** | The directory of client profiles and contact info |
| Insights | **Reports** | Viewing high-level sales and income trends (Admin Only) |
| Configuration | **Settings** | Managing rates, users, and system settings (Admin Only) |

### 7.1 Order Status Labels

| Enum Value | UI Label | Kanban Column | Badge Color |
| :--- | :--- | :--- | :--- |
| `RECEIVED` | Queued | Queue | `slate-200` bg / `slate-600` text |
| `WASHING` | Washing | Washing Zone | `light-cyan` bg / `brand-cyan-dark` text |
| `DRYING` | Drying | Drying Zone | `amber-100` bg / `amber-700` text |
| `FOLDING` | Folding | Folding Zone | `blue-100` bg / `blue-700` text |
| `READY_FOR_PICKUP` | Ready for Pickup | Ready for Pickup | `emerald-100` bg / `emerald-700` text — **active urgency** |
| `RELEASED` | Claimed | *(terminal — Order History only)* | `emerald-50` bg / `slate-500` text — **muted completion** |

> **Note on RELEASED vs READY_FOR_PICKUP:** These two statuses deliberately use different visual treatments despite both being in the emerald family. See §2.1.4 for full rationale. The muted treatment for RELEASED ensures staff do not confuse a terminal/closed order with an active ready-for-pickup order.

> **Color-to-stage semantic logic:**
> - `slate-200` (neutral gray) → Queue: no work has started; the order is waiting. Gray signals the absence of activity.
> - `light-cyan` → Washing: cool blue-cyan evokes water — the dominant physical element of this stage.
> - `amber-100` → Drying: warm amber evokes heat — the physical element of the drying process.
> - `blue-100` → Folding: returns to the brand-blue family, signaling proximity to completion.
> - `emerald-100` → Ready / Claimed: green = done, safe, approved. Universal semantic signal.

### 7.2 Order Detail & List Labels

| System Concept | Staff-Friendly Label | Definition |
| :--- | :--- | :--- |
| Service Items | **Order Details** | The list of items and services in the order |
| Actions | **Next Step** | The panel for advancing the order status |
| Mass | **Weight** | Measurement in Kilograms (INT-001 Q4, Q8) |
| Units | **Loads** | Number of machine loads (INT-001 Q8) |
| Extended | **Extra Time** | Additional machine minutes (INT-001 Q9) |
| Total | **Total Amount** | Final amount to be paid |
| Event Logs | **Order History** | Timeline of all actions |
| Lifecycle State | **Status** | Current stage of the order |
| Settlement | **Payment** | Payment status filter |

### 7.3 Confirmation & Feedback Messages

| Event | Message / Label |
| :--- | :--- |
| Wash Start | "Start washing this order?" |
| Dry Start | "Move to drying?" |
| Fold Start | "Start folding?" |
| Pickup Ready | "Mark as ready for pickup? The customer will be notified." |
| Release Order | "Confirm customer pickup and payment?" |
| Cancel Order | "Cancel this order? This cannot be undone." |
| Generic Success | "Transaction updated" |
| Logout Button | "Log Out" |

---

## 8. Component Prop Contract Standards

### 8.1 Props Are Typed Interfaces — Not Inline Types

Prop shapes for all shared components must be defined in `types/components.ts` and imported by the component file. Inline type definitions inside component files are prohibited for shared components.

```typescript
// ✅ CORRECT — defined in types/components.ts, imported by the component
export interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

// ❌ WRONG — prop type defined inline inside the component file
const StatusBadge = ({ status }: { status: string }) => { ... }
```

### 8.2 Variants Use a Single Component with a `variant` Prop

```typescript
// ✅ CORRECT — one component, behavior driven by props
<Button variant="danger">Delete Order</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="action">Advance Stage</Button>

// ❌ WRONG — separate files for the same logical component
<DangerButton>Delete Order</DangerButton>
<GhostButton>Cancel</GhostButton>
```

### 8.3 Components Must Not Own Business Logic

```typescript
// ✅ CORRECT — hook owns logic, component only renders
const { price, loads } = usePriceCalculation(weight, serviceType);
return <PricePreview price={price} loads={loads} />;

// ❌ WRONG — calculation logic embedded inside a view component
const PricePreview = ({ weight, rate }) => {
  const price = weight * rate; // business logic does not belong here
  return <span>{price}</span>;
}
```

### 8.4 Form Components Use react-hook-form + zod

All form components must use `react-hook-form` for state and event management, with `zod` schemas via `@hookform/resolvers/zod` for validation. This applies to all forms: Order Intake, Customer editing, Payment recording, User management, and Service Rates.

```typescript
// ✅ CORRECT
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderIntakeSchema } from '@/lib/validators';

const form = useForm({ resolver: zodResolver(orderIntakeSchema) });

// ❌ WRONG — manual validation state in component
const [errors, setErrors] = useState({});
const validate = () => { ... };
```

---

## 9. Screen Inventory

> Status markers are for academic project tracking only and do not constitute final acceptance criteria.

### 9.1 Implementation Status

| Screen | Actual Route | Priority | Status |
| :--- | :--- | :--- | :--- |
| Login | `(auth)/login` | 🔴 Critical | ✅ Implemented |
| Public Landing / Portal Home | `(public)/` | 🔴 Critical | ✅ Implemented |
| Dashboard (Kanban Pipeline) | `(dashboard)/overview` | 🔴 Critical | ✅ Implemented |
| Orders List | `(dashboard)/orders` | 🔴 Critical | ✅ Implemented |
| Order Detail / Status Advance | `(dashboard)/orders/[id]` | 🔴 Critical | ✅ Implemented |
| Payment Settlement | `(dashboard)/orders/[id]/pay` | 🔴 Critical | ✅ Implemented |
| Customers | `(dashboard)/customers` | 🟡 High | ✅ Implemented |
| Customer Profile Detail | `(dashboard)/customers/[id]` | 🟡 High | ✅ Implemented |
| Payment Ledger | `(dashboard)/payments` | 🟡 High | ✅ Implemented |
| Sales Reports | `(dashboard)/reports` | 🟡 High | ✅ Implemented |
| Service Rates | `(dashboard)/rates` | 🟡 High | ✅ Implemented |
| Notifications | `(dashboard)/notifications` | 🟡 High | ✅ Implemented |
| Activity Log | `(dashboard)/activity` | 🟡 High | ✅ Implemented |
| Staff Account Management | `(dashboard)/users` | 🟡 High | ✅ Implemented |
| Public Tracking Portal | `(public)/track` | 🔴 Critical | ✅ Implemented |
| Per-route `loading.tsx` | Individual sub-routes | 🟡 High | 🔴 Pending — only route group level exists |
| Per-route `error.tsx` | Individual sub-routes | 🟡 High | 🔴 Pending — only route group level exists |

### 9.2 Route Reference Corrections

> These correct errors present in v3.0 and earlier versions of this spec.

| Previous (incorrect) | Corrected | Reason |
| :--- | :--- | :--- |
| `(dashboard)/` | `(dashboard)/overview` | Dashboard home is at `/overview`, not the route group root |
| `(dashboard)/orders/[id]/settle` | `(dashboard)/orders/[id]/pay` | Actual folder name in codebase is `pay/`, not `settle/` |
| `(public)/track/[reference]` | `(public)/track` | No dynamic segment — reference number is entered as a form input on the page, not a URL param |
| `(public)/track/page.tsx` is missing | ✅ `(public)/track/page.tsx` exists | Implemented; previous spec incorrectly listed as missing |

### 9.3 Order Detail Design Guidance

- **Hierarchy:** Customer details and Order ID at the top; `ProcessStepper` prominently below the header.
- **Action Panel:** The "Next Step" panel must be the most visually distinct element on the right sidebar.
- **History:** The "Order History" must use relative timestamps (e.g., "2 hours ago") — INT-001 Q13 confirms staff verify timing before releasing laundry.
- **Language:** All labels must strictly follow the Lexicon in §7.2.

---

## 10. Constants-Driven UI Rule

> This is the **design-facing** requirement. The engineering implementation — file paths, export structure, import conventions — is documented in FRONT-002 §5.

Every piece of UI that renders differently based on a system state (badge color, label text, icon, row highlight) must be driven by a constants map. Inline conditional chains scattered across component files are prohibited.

**Required pattern — `ORDER_STATUS_META` must include all statuses including RELEASED with correct distinct treatment:**

```typescript
// constants/order-status.ts
export const ORDER_STATUS_META = {
  RECEIVED: {
    label: UI_LABELS.status.RECEIVED,    // "Queued"
    bgClass: "bg-slate-100 border-slate-200",
    textClass: "text-slate-600",
    icon: Inbox,
  },
  WASHING: {
    label: UI_LABELS.status.WASHING,     // "Washing"
    bgClass: "bg-sky-50 border-sky-200",
    textClass: "text-brand-cyan-dark",
    icon: WashingMachine,
  },
  DRYING: {
    label: UI_LABELS.status.DRYING,      // "Drying"
    bgClass: "bg-amber-50 border-amber-200",
    textClass: "text-amber-700",
    icon: Sun,
  },
  FOLDING: {
    label: UI_LABELS.status.FOLDING,     // "Folding"
    bgClass: "bg-blue-50 border-blue-100",
    textClass: "text-blue-700",
    icon: Package,
  },
  READY_FOR_PICKUP: {
    label: UI_LABELS.status.READY_FOR_PICKUP,  // "Ready for Pickup"
    bgClass: "bg-emerald-100 border-emerald-200",  // Active urgency
    textClass: "text-emerald-700",
    icon: CheckCircle2,
  },
  RELEASED: {
    label: UI_LABELS.status.RELEASED,    // "Claimed"
    bgClass: "bg-emerald-50 border-emerald-100",   // Muted — terminal
    textClass: "text-slate-500",                    // §2.1.4: distinct from READY
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: UI_LABELS.status.CANCELLED,   // "Cancelled"
    bgClass: "bg-rose-50 border-rose-200",
    textClass: "text-rose-700",
    icon: XCircle,
  },
} as const;
```

**Result:** Changing a status label, color, or icon requires a single edit in one file — no searching across components.

### 10.1 Token Inventory — Cross-Reference

The following table reconciles the three token sources in the project. All three must remain in sync.

| Token | `globals.css` CSS Var | `tailwind.config.ts` Key | `brand-colors.ts` Const | Role |
| :--- | :--- | :--- | :--- | :--- |
| Brand Blue | `--color-primary` | `primary.DEFAULT` / `primary.600` | `BRAND_COLORS.blue` | Primary CTA, sidebar, brand identity |
| Brand Cyan (decorative) | `--color-action` | `action.DEFAULT` / `action.500` | `BRAND_COLORS.cyan` | Pulse indicators, decorative only |
| Brand Cyan Dark (interactive) | — | — (see §12 Known Issues) | `BRAND_COLORS.cyanDark` | Links, interactive icons on white bg |
| Success | `--color-success` | `success.DEFAULT` | `BRAND_COLORS.success` (`#047857`) | Paid, Ready, success toasts |
| Warning | `--color-warning` | `warning.DEFAULT` | `BRAND_COLORS.warning` (`#b45309`) | Drying, pending states |
| Error | `--color-error` | `error.DEFAULT` | `BRAND_COLORS.error` (`#be123c`) | Destructive, validation errors |
| Neutral base | `--color-neutral-base` | `neutral.base` | `BRAND_COLORS.slate[900]` | Dark mode surface |
| Page background | — | `neutral.light` | `BRAND_COLORS.bg` | 60% dominant neutral |

---

## 11. Dashboard Design (Revised — v3.0)

> **Change from v2.1:** The dashboard architecture has been revised based on HCI research. The 3-column Kanban is expanded to a full 5-column lifecycle pipeline representing all active order states. The right-column static panel is eliminated (F-pattern compliance, §1.11). The primary CTA moves to the topbar (Fitts's Law, §1.4). Role-based progressive disclosure is enforced at the layout level (§1.9).

The **Dashboard** (`/overview`) is the home screen and the primary workspace for Staff. It is designed to provide "at-a-glance" operational status and enable single-interaction order advancement.

### 11.1 Top Navigation Bar (Persistent)

The topbar is persistent across all dashboard pages. Reading left to right along the F-pattern's top horizontal sweep:

- **Left:** Sidebar toggle button + current page title (`H2`, Plus Jakarta Sans 600).
- **Right:** Date chip (current date) → Notification bell (with `NotificationPopover` on click) → **"New Order" primary CTA button** (`brand-blue`, 44px height minimum).

> ⚠️ **Fitts's Law enforcement (§1.4):** The "New Order" CTA must occupy the topbar right zone. This is the highest-fixation area on every dashboard page. Placing it here eliminates the need to navigate or scroll to initiate the most frequent task. It must never be demoted to a right-column panel, a sidebar section, or a bottom bar on desktop.

### 11.2 Today's Overview (KPI Row)

Four KPI cards spanning the full content width, directly below the topbar — the **first content element** the user sees, positioned at the F-pattern's primary horizontal sweep level.

| KPI Card | Value Source | Visual Treatment | Icon Color |
| :--- | :--- | :--- | :--- |
| Active Cycles | COUNT of orders in `WASHING` / `DRYING` / `FOLDING` | `brand-cyan` animated pulse badge | Cyan |
| Ready for Pickup | COUNT of `READY_FOR_PICKUP` orders | Emerald count badge, **clickable — scrolls pipeline to column** | Emerald |
| Today's Sales | SUM of settled payments today | Philippine Peso (₱) prefix | Amber |
| New Orders | COUNT of all orders created today | Subtitle: "Since opening" | Blue |

- The **"Ready for Pickup" KPI card** must be a clickable element that scrolls the pipeline view to the Ready for Pickup column and briefly highlights it — enabling single-click navigation to the highest-priority task.

### 11.3 Order Pipeline (Primary Grid) — REVISED

The Order Pipeline is the **dominant content element** of the Dashboard. It occupies all remaining viewport space below the KPI row and renders as a Kanban board with exactly **5 active columns**.

#### 11.3.1 Column Specification

| Column | Maps To | Header Text Color | Column Dot |
| :--- | :--- | :--- | :--- |
| Queue | `RECEIVED` | `slate-400` | `slate-300` (static) |
| Washing Zone | `WASHING` | `brand-cyan-dark` | `brand-cyan` (static) |
| Drying Zone | `DRYING` | `amber-700` | `amber-400` (static) |
| Folding Zone | `FOLDING` | `brand-blue` | `brand-blue` (static) |
| Ready for Pickup | `READY_FOR_PICKUP` | `emerald-700` **(URGENT)** | `emerald-500` + pulse ring |

#### 11.3.2 Layout Rules

- Each column has a fixed minimum width of `200px`. Total minimum pipeline width = `5 × 200px + 4 × 16px gap = 1064px`. Combined with `220px` sidebar + `32px` margins = `1316px` — fits within `1366px` viewport.
- On viewports `< 1200px`, the pipeline container scrolls horizontally. Columns do not collapse or stack — this preserves the physical shop floor spatial metaphor.
- Empty columns render a "Capacity available" placeholder with a `+` icon. A blank column is prohibited — it violates Nielsen H1 (the user cannot distinguish an empty state from a load failure).
- `"Claimed"` is **not** a Kanban column. Claimed orders are terminal and appear exclusively in Order History. A Claimed column would create visual noise with no actionable output.

#### 11.3.3 Order Card Specification

Each card within a column displays:

- **Order ID** — `LDR-YYYYMMDD-XXXX` in `JetBrains Mono 12px` (monospace for disambiguation)
- **Status Badge** — color + icon + label (WCAG 1.4.1 compliance)
- **Customer Name** — `Inter 14px / 500`
- **Weight and Loads** — e.g., "4.5 kg · 1 Load"
- **Drop-off time** — relative timestamp (e.g., "2 hours ago")
- **One-Tap Advance button** — `brand-blue` background, white text, `44px` minimum height; label changes per current status (see §11.6)

Cards within each column are sorted by drop-off time, **oldest first** — the longest-waiting order appears at the top, ensuring first-in-first-out service (INT-001 Q4 describes this as the shop's existing physical practice).

### 11.4 Role-Based Layout Differentiation — REVISED

**Staff View & Admin View:**

- Both roles share the same 100% operational Command Center layout.
- **Renders:** Topbar (with New Order CTA) + KPI Row + 5-Column Pipeline.
- **Does not render:** Activity Log, Revenue Chart, Command Panel. These analytical elements are delegated to their respective dedicated routes (e.g., `/reports`, `/activity`).
- **Differentiation:** The "Today's Sales" KPI card is restricted to the Admin role; Staff see a placeholder or a different metric if configured.

### 11.5 Urgent State Treatment — "Ready for Pickup" *(NEW in v3.0)*

The "Ready for Pickup" column must win the **Five-Second Rule** (§1.1) — a staff member glancing at the dashboard must identify a ready order within 5 seconds without deliberate scanning. Required visual treatments:

- **Column header text:** `emerald-700` (vs. subdued slate or amber for all other columns).
- **Column dot:** `emerald-500` with an animated `brand-cyan` pulse ring (`1.8s ease-out infinite`).
- **Column background:** Subtle `emerald-50` tint (`#f0fdf4`) — distinguishes the column from the neutral `neutral-50` pipeline background without being alarming.
- **Order cards in this column:** `4px solid #047857` (`emerald-700`) left border accent on each card.
- **Count badge in column header:** `emerald-100` background / `emerald-700` text (vs. the neutral chip used in other columns).

> ⚠️ **Reduced motion compliance:** All pulse animations must respect `@media (prefers-reduced-motion: reduce)` and fall back to a static `emerald-500` dot. The column background tint and border accents remain active regardless of motion preference — they are non-animated visual differentiators and must always render.

### 11.6 Interactive Identity

- **Pulse Indicators:** `brand-cyan` pulse on the Active Cycles KPI badge; `emerald` pulse ring on the Ready for Pickup column dot. Both signal "live, real-time state" (Nielsen H1) without requiring a manual refresh.
- **One-Tap Advance:** Each order card renders a single contextual advance button — the most prominent element on the card (`brand-blue` bg, white text, `44px` height). The label is contextual and changes per current status:

  | Current Column | Advance Button Label |
  | :--- | :--- |
  | Queue | "Start Washing" |
  | Washing Zone | "Move to Dryer" |
  | Drying Zone | "Start Folding" |
  | Folding Zone | "Mark Ready" |
  | Ready for Pickup | "Confirm Pickup" |

---

---

## 12. The Administrative Laws of UI/UX

This section codifies the psychological and HCI laws that govern every pixel and interaction in the Faith Laundry Management System. These are the **Supreme Laws** of the interface — no feature shall be implemented that violates these core tenets.

### 12.1 The Doherty Threshold (System Reactivity)
System productivity skyrockets when a computer and its users interact at a pace (<400ms) that ensures neither has to wait on the other.
- **The Law:** Every primary action (button tap, filter change, step transition) must provide visual feedback within **100ms**.
- **Implementation:** Use of `framer-motion` for fluid layout transitions and "Loading" states that appear instantly to acknowledge intent.

### 12.2 Miller’s Law (The Rule of Chunking)
The average person can only keep 7 (plus or minus 2) items in their working memory.
- **The Law:** Complex administrative tasks (like order intake) must be "chunked" into discrete steps.
- **Implementation:** The **4-step Intake Wizard** transforms a 15-field data blob into 4 manageable mental stages, preventing cognitive overload during peak shop hours.

### 12.3 Fitts’s Law (Target Optimization)
The time to acquire a target is a function of the distance to and size of the target.
- **The Law:** High-frequency administrative actions must be large and close to the natural resting position of the cursor/thumb.
- **Implementation:** 44px minimum touch targets and the prominent "Next Step" buttons in the center-right of the viewport.

### 12.4 Hick’s Law (Progressive Disclosure)
The time it takes to make a decision increases with the number and complexity of choices.
- **The Law:** Never show more than 3 primary choices at a single moment in a workflow.
- **Implementation:** The **Intake Wizard** only shows the choices relevant to the current step (e.g., Service selection is hidden until the Customer is identified).

### 12.5 The Peak-End Rule
Humans judge an experience largely based on how they felt at its peak and at its end, rather than the total sum or average of every moment.
- **The Law:** The "Submission" and "Printing" moments must be the most visually rewarding and friction-free.
- **Implementation:** High-fidelity animations upon order completion and a seamless transition to the "Print Claim Stub" interface.

### 12.6 The Von Restorff Effect (Isolation)
When multiple similar objects are present, the one that differs from the rest is most likely to be remembered and acted upon.
- **The Law:** Use color isolation to signal the "Happy Path."
- **Implementation:** Only **ONE** primary `brand-blue` button exists in the wizard viewport at any time, guiding the staff member forward with zero ambiguity.

---

## 13. Known Issues Register

> This section documents verified discrepancies between this spec and the current codebase that require resolution. Items remain here until resolved and verified, then are moved to the change summary.

| ID | Severity | Issue | Location in Code | Required Action |
| :--- | :--- | :--- | :--- | :--- |
| KI-001 | Medium | `brand-cyan-dark` (`#1a7fa8`) has no Tailwind config entry and no CSS variable. It is used in the codebase as the arbitrary value `text-[#1a7fa8]` or via `BRAND_COLORS.cyanDark` in Recharts. This makes it invisible to Tailwind's IntelliSense and unsafelist-able. | `tailwind.config.ts`, `globals.css`, `brand-colors.ts` | Add `cyanDark: "#1a7fa8"` under the `brand` key in `tailwind.config.ts` (as `brand["cyan-dark"]`) and add `--color-action-dark: #1a7fa8` to `globals.css`. Replace all `text-[#1a7fa8]` arbitrary values with `text-brand-cyan-dark`. |

---

## 14. Conclusion

This Frontend Design Specification (**FRONT-001 v3.2**) serves as the authoritative visual and interaction reference for the Faith Laundry Shop Management System. Every design decision — color palette, typography, spacing, component behavior, and layout architecture — is grounded in verified HCI theory, WCAG 2.1 AA accessibility standards, F-pattern eye-scanning research, color science, and the operational reality documented in CS-001 and INT-001.

Version 3.2 aligns the document to the verified codebase state and adds formal documentation for patterns that were implemented but unspecified:

- **Complete screen inventory:** All 15 implemented routes are documented, including the public landing page, customer profile detail, and staff management screens.
- **Glassmorphism system formalized:** The `.glass`, `.glass-light` CSS utilities and `MeshBackground` component are now formally specified with usage rules (§2.4.3).
- **Navigation architecture documented:** The `NAVIGATION_GROUPS` pattern and two-group sidebar structure are now specified in §5.4.
- **Form and toast libraries specified:** `react-hook-form` + `zod` and `sonner` are now documented as required patterns (§5.5, §8.4).
- **Active known issue registered:** The `brand-cyan-dark` Tailwind gap is now tracked in §12 with a clear resolution path.

All engineering implementation — including file structures, API integration patterns, and directory maps — must refer to **[FRONT-002: Frontend Structure Specification](frontend-structure.md)** for technical enforcement.

For any discrepancies between design intention and technical feasibility, **FRONT-001 v3.2** serves as the baseline for UX quality; **FRONT-002** serves as the baseline for architectural integrity.
