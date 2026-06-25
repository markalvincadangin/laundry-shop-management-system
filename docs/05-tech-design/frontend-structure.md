# Frontend Engineering & Structure Specification
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop
> **Prepared By:** HIMÓTECH
> **Document ID:** FRONT-002
> **Version:** 2.3
> **Date:** 2026-04-27
> **Purpose:** Standardize the Next.js project structure and engineering patterns
> **Status:** Hardened — Next.js 15 Alignment — Modular Lexicon Integrated

---

## Document Control

| Field | Value |
| :--- | :--- |
| Previous Version | 2.2 — 2026-04-25 |
| Change Summary | v2.3.1 codebase alignment: Systematic reorganization of `src/constants/ui` into a modular architecture; transitioned from a single `ui-labels.ts` to a grouped directory structure (`shared`, `forms`, `meta`, etc.); updated directory map and engineering standards to reflect this change. |
| Related Documents | [Frontend Design Spec — FRONT-001](frontend-design-spec.md), [User Stories](../02-requirements/user-stories.md), [OpenAPI Spec](openapi.yaml) |
| Confidentiality | Internal / Academic Use |

---

## Grounding Note — Official Next.js Conventions

> Everything in this document is labeled as either **[Next.js Official]** or **[Team Convention]**.
>
> - **[Next.js Official]** means this is defined by the Next.js framework itself (sourced from `nextjs.org/docs/app/getting-started/project-structure`, last updated 2026-04-21). It is not our choice — it is how the framework works.
> - **[Team Convention]** means this is a deliberate decision made by HIMÓTECH for this project. It is enforced by team agreement, not by the framework. It can be changed by team decision.
>
> This distinction matters. Never cite a team convention as if it were a framework requirement, and never ignore an official convention because it seems optional.

---

## 1. Official Next.js Top-Level Structure

**[Next.js Official]** The following top-level folders and files have special meaning to the framework. Their names and behavior are defined by Next.js and must not be repurposed.

### 1.1 Official Top-Level Folders

| Folder | Framework Role |
| :--- | :--- |
| `app/` | App Router — the only place for routing, layouts, and pages |
| `public/` | Static assets served directly at the root URL (e.g., `/logo.svg`) |
| `src/` | Optional. Wraps all application code; keeps config files at root clean |

> **[Team Convention]** We use the `src/` folder. All application code lives under `src/`. Configuration files (`next.config.mjs`, `tsconfig.json`, `package.json`, `.env*`, `eslint.config.mjs`) remain at the project root.

### 1.2 Official Top-Level Files

| File | Purpose |
| :--- | :--- |
| `next.config.mjs` | Next.js configuration (ESM format) |
| `tsconfig.json` | TypeScript configuration |
| `.env.local` | Environment variables (Local secrets, never committed) |
| `eslint.config.mjs` | ESLint configuration |
| `next-env.d.ts` | Auto-generated TypeScript declarations |

> **Note:** `middleware.ts` is a planned future enhancement for server-side RBAC (see §4).

---

## 2. Official Routing — The `app/` Directory

**[Next.js Official]** The `app/` directory uses file-system based routing. Folders define URL segments. A route is only publicly accessible when a `page.tsx` or `route.ts` file exists in that folder.

### 2.1 Official Routing Files

Every route segment may include any of the following special files:

| File | Extension | Purpose |
| :--- | :--- | :--- |
| `layout` | `.tsx` | Shared UI wrapping a segment and its children |
| `page` | `.tsx` | The public UI for a route — makes the route accessible |
| `loading` | `.tsx` | React Suspense boundary — renders while the page loads |
| `error` | `.tsx` | React error boundary — catches runtime errors in the segment |
| `not-found` | `.tsx` | Renders when `notFound()` is thrown in the segment |
| `global-error` | `.tsx` | Catches errors in the root layout |
| `route` | `.ts` | API endpoint for this segment |
| `template` | `.tsx` | Like layout, but re-renders on navigation (rarely needed) |
| `default` | `.tsx` | Fallback UI for parallel routes |

> **[Team Convention]** Every route segment in this project MUST include `page.tsx`. The `loading.tsx` and `error.tsx` files are **optional and functional**.
> - **Bubbling by Default:** If a segment does not require a specialized loading skeleton or custom error recovery logic, omit these files. They will automatically bubble up to the nearest parent boundary (e.g., the root `(dashboard)/loading.tsx`).
> - **When to use locally:** Add `loading.tsx` only to provide a page-specific Skeleton Screen (see FRONT-001 §10). Add `error.tsx` only if the segment requires a unique "Reset" or "Back to..." recovery action.
> - This selective approach ensures architectural DRY compliance while maintaining forensic-grade UX resilience.

### 2.2 Route Groups — Official Convention

**[Next.js Official]** Wrapping a folder name in parentheses — `(folderName)` — creates a route group. The folder name is omitted from the URL path. Route groups allow shared layouts without URL nesting.

**[Team Convention]** We use three route groups to separate user experiences:

| Route Group | URL Scope | Layout |
| :--- | :--- | :--- |
| `(auth)/` | `/login` | No sidebar — full-screen centered card |
| `(dashboard)/` | `/overview`, `/orders`, `/customers`, `/notifications`, `/payments`, `/rates`, `/reports`, `/users`, `/activity` | Sidebar layout with role-based nav |
| `(public)/` | `/`, `/track` | Minimal public view — no auth, no sidebar |

### 2.3 Private Folders — Official Convention

**[Next.js Official]** Prefixing a folder with an underscore — `_folderName` — marks it as a private implementation detail. The routing system ignores it entirely. Files inside private folders are never publicly accessible as routes, even if they contain a `page.tsx`.

**[Team Convention]** We use private folders to colocate non-routable utilities next to the routes that use them, for example `(dashboard)/_components/` for dashboard-specific UI not shared globally.

---

## 3. Project File Organization Strategy

**[Next.js Official]** Next.js is explicitly **unopinionated** about where non-routing code lives. The framework does not prescribe folder names like `components/`, `hooks/`, or `lib/` — those have no special framework significance. The official docs offer three equally valid strategies:

1. Store all project files outside of `app/` (routing only in `app/`)
2. Store all project files inside `app/`
3. Split by feature — shared code at the root of `app/`, feature code colocated with its routes

**[Team Convention]** We follow **Strategy 1: project files outside of `app/`**. The `src/app/` directory is strictly for routing. All application code lives in folders alongside `app/` inside `src/`.

This choice was made for two reasons:
- It keeps the `app/` directory clean and readable — only routing files live there.
- It makes shared code (components, hooks, services) easy to find without navigating the route tree.

---

## 4. Project Folder Reference

**[Team Convention]** The following folders are defined and enforced by HIMÓTECH for this project. They are not Next.js framework conventions.

| Folder | Role | What goes here |
| :--- | :--- | :--- |
| `src/app/` | **Routing + Styles** | Layouts, pages, loading, error, `globals.css`, and `providers.tsx` |
| `src/components/` | **UI Library** | Atoms, molecules, organisms (grouped by `ui/`, `layout/`, `features/`) |
| `src/actions/` | **Server Actions** | **[Post-MVP]** `'use server'` data mutation functions |
| `src/hooks/` | **Shared logic** | Custom hooks used by more than one component |
| `src/services/` | **API Layer** | Authoritative data fetching layer (Axios/TanStack Query) |
| `src/constants/` | **Single Source** | Statuses, roles, brand colors, and the modular UI lexicon (`ui/`) |
| `src/lib/` | **Utilities** | Formatting, validation, and the `api-client.ts` instance |
| `src/config/` | **App Configuration** | Navigation structure (`navigation.ts`) and other app-level config constants |
| `src/components/providers/` | **Infra Providers** | Thin wrappers for external libraries (e.g., QueryProvider) |
| `src/contexts/` | **Domain State** | Context definitions, hooks, and complex state logic (AuthContext) |
| `src/types/` | **Type definitions** | Global TypeScript interfaces and generated API types |
| `src/tests/` | **Test Suite** | Unit and integration tests mirroring the `src/` structure (Vitest) |
| `src/templates/` | **File Templates** | Canonical `loading.tsx` and `error.tsx` templates for new route segments |
| `public/` | **Static assets** | Located at root per official Next.js convention |

---

## 5. Full Directory Map

**[Team Convention]** The following is the complete annotated directory layout for this project.

```
faith-laundry-frontend/
│
├── src/
│   │
│   ├── app/                          # [Next.js Official] Routing
│   │   ├── layout.tsx                # Root layout — html, body, providers
│   │   ├── providers.tsx             # Global provider aggregation (QueryProvider + AuthProvider)
│   │   ├── globals.css               # Tailwind + Design Tokens (FRONT-001)
│   │   ├── not-found.tsx             # Root-level 404
│   │   │
│   │   ├── (auth)/                   # Route group — no sidebar
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx           # Group-level boundary
│   │   │   ├── error.tsx             # Group-level boundary
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/              # Route group — sidebar layout
│   │   │   ├── layout.tsx            # Sidebar + Topbar + AuthGuard wrapper ("use client" — uses usePathname)
│   │   │   ├── loading.tsx           # Group-level boundary
│   │   │   ├── error.tsx             # Group-level boundary
│   │   │   │
│   │   │   ├── overview/
│   │   │   │   └── page.tsx          # Dashboard Home (KPI row + Order Pipeline)
│   │   │   │
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Order Queue View
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Order detail + Advance Process
│   │   │   │       └── pay/
│   │   │   │           └── page.tsx  # Settle Balance interface
│   │   │   │
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx          # Customer Registry
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Customer Profile Detail
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx          # Alerts and Notifications
│   │   │   ├── payments/
│   │   │   │   └── page.tsx          # Transaction Ledger (Admin)
│   │   │   ├── rates/
│   │   │   │   └── page.tsx          # Service/Pricing Config (Admin)
│   │   │   ├── reports/
│   │   │   │   └── page.tsx          # Sales Reports / Business Intelligence (Admin)
│   │   │   ├── users/
│   │   │   │   └── page.tsx          # Staff Account Management (Admin)
│   │   │   └── activity/
│   │   │       └── page.tsx          # Forensic Audit Log (Admin)
│   │   │
│   │   └── (public)/                 # Route group — no auth, no sidebar
│   │       ├── layout.tsx
│   │       ├── loading.tsx
│   │       ├── error.tsx
│   │       ├── page.tsx              # Public landing / portal home
│   │       └── track/
│   │           └── page.tsx          # Public order lookup (ref entered as form input)
│   │
│   ├── components/                   # UI Library
│   │   │
│   │   ├── ui/                       # Atomic building blocks
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── CardSkeleton.tsx
│   │   │   ├── ChartSkeleton.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── MeshBackground.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── PaymentStatusBadge.tsx
│   │   │   ├── SegmentedControl.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── SideSheet.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── TableSkeleton.tsx
│   │   │   ├── UndoToast.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                   # Shell components
│   │   │   ├── AuthGuard.tsx         # Client-side RBAC route protection wrapper
│   │   │   ├── MobileNav.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx            # Persistent top bar with page title + "New Order" CTA
│   │   │   └── index.ts
│   │   │
│   │   ├── features/                 # Domain-specific organisms
│   │   │   ├── activity/
│   │   │   │   ├── ActivityDetailsModal.tsx
│   │   │   │   └── index.ts
│   │   │   ├── customers/
│   │   │   │   ├── CustomerEditModal.tsx
│   │   │   │   └── index.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   ├── OrderPipeline.tsx
│   │   │   │   └── index.ts
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationDetailsModal.tsx
│   │   │   │   ├── NotificationPopover.tsx
│   │   │   │   └── index.ts
│   │   │   ├── orders/
│   │   │   │   ├── NewOrderSideSheet.tsx
│   │   │   │   ├── OrderIntakeForm.tsx
│   │   │   │   ├── OrderQueueTable.tsx
│   │   │   │   ├── OrderStatusTimeline.tsx
│   │   │   │   └── index.ts
│   │   │   ├── payments/
│   │   │   │   ├── PaymentActionModal.tsx
│   │   │   │   ├── PaymentDetailsModal.tsx
│   │   │   │   ├── PaymentLedgerTable.tsx
│   │   │   │   └── index.ts
│   │   │   ├── reports/
│   │   │   │   ├── DetailedSalesTable.tsx
│   │   │   │   ├── RevenueChart.tsx
│   │   │   │   └── index.ts
│   │   │   ├── users/
│   │   │   │   └── UserModal.tsx
│   │   │   └── shared/
│   │   │       ├── AccessDenied.tsx
│   │   │       ├── DataTable.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       ├── ErrorState.tsx
│   │   │       ├── FilterBar.tsx
│   │   │       ├── LoadingState.tsx
│   │   │       ├── Pagination.tsx
│   │   │       ├── ProcessStepper.tsx
│   │   │       ├── SectionHeader.tsx
│   │   │       └── index.ts
│   │   │
│   │   └── providers/                # Infrastructure Providers
│   │       └── QueryProvider.tsx
│   │
│   ├── config/                       # App-level configuration
│   │   └── navigation.ts             # NAVIGATION_GROUPS — grouped nav structure for Sidebar
│   │
│   ├── hooks/                        # Shared hooks — used by 2+ components
│   │   ├── useActivity.ts
│   │   ├── useCustomerLookup.ts
│   │   ├── useCustomers.ts
│   │   ├── useDebounce.ts
│   │   ├── useNotifications.ts
│   │   ├── useOrders.ts
│   │   ├── usePayments.ts
│   │   ├── usePriceCalculation.ts
│   │   ├── useRates.ts
│   │   ├── useRegistry.ts
│   │   ├── useUsers.ts
│   │   └── useWeeklySales.ts
│   │
│   ├── actions/                      # [Post-MVP] Server Actions
│   │
│   ├── services/                     # Authoritative API layer
│   │   ├── activity.service.ts
│   │   ├── auth.service.ts           # Login, Logout, Me
│   │   ├── customers.service.ts
│   │   ├── notifications.service.ts
│   │   ├── orders.service.ts
│   │   ├── payments.service.ts
│   │   ├── reports.service.ts
│   │   ├── service-rates.service.ts
│   │   └── users.service.ts
│   │
│   ├── constants/                    # Single source of truth
│   │   ├── brand-colors.ts           # Authoritative hex values for non-Tailwind contexts
│   │   ├── order-status.ts           # ORDER_STATUS, ORDER_STATUS_META, STATUS_TRANSITIONS
│   │   ├── payment.ts                # Payment methods and payment status constants
│   │   ├── roles.ts                  # User role constants
│   │   ├── service-types.ts
│   │   └── ui/                       # Modular UI Lexicon (FRONT-001 §7)
│   │       ├── index.ts              # Unified entry point (exports UI_LABELS)
│   │       ├── shared.ts             # Shared buttons, status, units
│   │       ├── meta.ts               # App metadata
│   │       ├── forms.ts              # Form-specific labels
│   │       ├── layout.tsx            # Navigation and layout strings
│   │       └── modules/              # Module-specific lexicons (orders, payments, etc.)
│   │
│   ├── lib/                          # Shared Utilities
│   │   ├── api-client.ts             # Authoritative Axios instance
│   │   ├── utils.ts                  # Formatters (currency, date, weight)
│   │   └── validators.ts             # Zod schemas for all forms
│   │
│   ├── contexts/                     # Domain State (Auth, etc.)
│   │   └── AuthContext.tsx           # Logic, hooks, and domain state
│   │
│   ├── types/
│   │   ├── api.generated.ts          # Auto-generated from openapi.yaml (npm run generate:types)
│   │   ├── api.ts                    # Domain interfaces
│   │   ├── components.ts             # Prop contracts
│   │   └── index.ts
│   │
│   ├── templates/                    # Canonical file templates for new route segments
│   │   ├── loading.tsx.template
│   │   └── error.tsx.template
│   │
│   └── tests/                        # Test mirror structure (Vitest)
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── types/
│
├── public/                           # Static assets (root)
│   ├── branding/
│   │   └── logo.svg
│   └── images/
├── next.config.mjs                   # ESM Config
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts                  # Vitest test runner configuration
├── vitest.setup.tsx                  # Vitest global setup (testing-library + happy-dom)
└── middleware.ts                     # [Future Enhancement]
```

---

## 6. Naming Conventions

**[Team Convention]** These naming rules are enforced across the entire codebase. Consistent naming eliminates the cognitive overhead of remembering where things live.

### 6.1 Files and Folders

| Item | Convention | Example |
| :--- | :--- | :--- |
| React component files | `PascalCase.tsx` | `OrderQueueTable.tsx` |
| Hook files | `camelCase.ts` | `useOrders.ts` |
| Service files | `camelCase.service.ts` | `orders.service.ts` |
| Action files | `camelCase.actions.ts` | `order.actions.ts` |
| Constants files | `kebab-case.ts` | `order-status.ts` |
| Barrel exports | always `index.ts` | `components/ui/index.ts` |
| Folders | `camelCase` | `components/`, `hooks/` |
| Route folders | `kebab-case` | `app/(dashboard)/orders/` |

### 6.2 Code Identifiers

| Item | Convention | Example |
| :--- | :--- | :--- |
| TypeScript interfaces | `PascalCase` | `OrderStatus`, `StatusBadgeProps` |
| Enum values and constants | `SCREAMING_SNAKE_CASE` | `ORDER_STATUS.WASHING`, `UI_LABELS` |
| Component names | `PascalCase` | `StatusBadge`, `Button` |
| Hook names | `camelCase`, `use` prefix required | `useOrderStatus` |
| Service function names | `camelCase`, verb-first | `getOrders`, `createOrder`, `updateOrderStatus` |
| CSS / Tailwind | Utility-first — no custom class proliferation | `className="flex items-center gap-2"` |

### 6.3 Prohibited Patterns

| Pattern | Reason |
| :--- | :--- |
| `lib/api/*` | **Decommissioned.** Use `src/services/` for all API logic |
| `I`-prefix on interfaces | Unnecessary — TypeScript does not require it |
| Default exports on components | Prevents tree-shaking; use named exports |
| Magic strings in logic | Use constants: `status === ORDER_STATUS.WASHING` |
| Hardcoded label strings | Use `UI_LABELS` from `constants/ui/` |

---

## 7. Path Alias Standards

**[Team Convention]** All internal imports use `@/` path aliases configured in `tsconfig.json`. Relative imports deeper than one level (`../../`) are prohibited.

### 7.1 `tsconfig.json` Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/components/features/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/constants/*": ["./src/constants/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/contexts/*": ["./src/contexts/*"],
      "@/config/*": ["./src/config/*"]
    }
  }
}
```

### 7.2 Import Rules

```typescript
// ✅ CORRECT — alias import, works from any depth
import { StatusBadge } from '@/components/ui';
import { useOrders } from '@/hooks/useOrders';
import { ORDER_STATUS } from '@/constants/order-status';
import { NAVIGATION_GROUPS } from '@/config/navigation';

// ❌ WRONG — relative import from deep nesting
import { StatusBadge } from '../../../components/ui/StatusBadge';
```

---

## 8. Engineering Standards

> This section is the **authoritative** engineering standards reference. It absorbs the content that was incorrectly placed in FRONT-001 §9 and adds additional rules. FRONT-001 §9 has been removed. All engineering standard questions defer here.

### 8.1 Single Source of Truth (DRY)

Every value that is used in more than one place must be defined in exactly one place.

**Constants:** All lifecycle states, service types, payment methods, user roles, and UI label strings must be defined in `src/constants/`. UI labels are organized into a modular structure under `src/constants/ui/`. Components and hooks import the unified `UI_LABELS` object from there — they never redefine these values locally.

**Utilities:** All shared formatting logic (currency display, date formatting, weight display) must live in `src/lib/utils.ts`. Components call the formatter — they do not re-implement it.

**Prop Interfaces:** All prop shapes for shared components are defined in `src/types/components.ts`. See FRONT-001 §8 for the full rule.

### 8.2 Service Layer Patterns
**[Team Convention]** Component-level `fetch` or `axios` calls are strictly prohibited. All API interactions must pass through `src/services/`.

```typescript
// ✅ CORRECT — Auth API call moves to services/auth.service.ts
export const authService = {
  login: async (creds: LoginRequest) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', creds);
    return data;
  }
}
```

### 8.3 State Management Split
**[Team Convention]**
- **Domain State (Auth, Business Logic):** Lives in `src/contexts/`. Context definitions must include their associated hooks and logic.
- **Infrastructure State (Cache, UI theme):** Lives in `src/components/providers/`. These are thin wrappers for external libraries (e.g., `QueryProvider`).
- **Server Cache:** Managed exclusively via TanStack Query in the Service Layer.

```typescript
// ❌ WRONG — API call directly inside a component
const OrderSummaryTable = () => {
  useEffect(() => {
    axios.get('/api/orders').then(...); // never do this in a component
  }, []);
};
```

### 8.4 Hook Colocation Rule

**Shared hooks** (used by two or more components) live in `src/hooks/`.

**Local hooks** (used by exactly one component) are colocated next to that component in a `hooks.ts` file or defined directly in the component file.

Do not promote a hook to `src/hooks/` until it is genuinely reused. Premature promotion adds indirection without benefit.

```
components/orders/
├── OrderSummaryTable.tsx
├── hooks.ts          ← local hook, only used by OrderSummaryTable
└── index.ts
```

### 8.5 No Magic Strings

No string literals for status values, role names, service types, or payment methods may appear in conditional logic. All such values must be referenced from constants.

```typescript
// ✅ CORRECT
import { ORDER_STATUS } from '@/constants/order-status';
if (order.status === ORDER_STATUS.WASHING) { ... }

// ❌ WRONG
if (order.status === 'WASHING') { ... }
```

### 8.6 Form Validation

All client-side form validation uses `zod` schemas paired with `react-hook-form` via `@hookform/resolvers/zod`. Schemas are defined in `src/lib/validators.ts` and wired into form components via `useForm`. Inline validation logic in component files is prohibited.

### 8.7 Type Sovereignty

All data shapes must be defined in `src/types/`. Prefer types generated from `types/api.generated.ts` (produced by `npm run generate:types` from the OpenAPI spec) to ensure frontend-backend alignment. Local type definitions inside component files are permitted only for component-internal, non-shared types.

### 8.8 Barrel Exports

Every folder inside `src/components/` must have an `index.ts` barrel file that re-exports its public members. This allows clean, stable imports regardless of internal file reorganization.

```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { StatusBadge } from './StatusBadge';
export { UndoToast } from './UndoToast';
```

### 8.9 Loading States
**[Next.js Official + Team Enforcement]** Route group boundaries (`(auth)/`, `(dashboard)/`, `(public)/`) must have `loading.tsx` and `error.tsx`. Individual sub-routes add these files only when they require segment-specific skeleton screens or custom error recovery. Canonical templates live in `src/templates/`.

### 8.10 Server/Client Component Boundary (Next.js 15)
**[Next.js Official]** Components in `src/app/` are Server Components by default. Interactivity requires `"use client"`.

| Component | Role | Reason |
| :--- | :--- | :--- |
| `OrderQueueTable` | **Client** | Interactive filtering and pagination |
| `AuthGuard` | **Client** | Uses `useAuth()` hook and router navigation |
| `Button` | **Client** | Uses `onClick` handler |
| `Card` | **Server** | Pure structural container with no hooks |
| `PageHeader` | **Server** | Renders static title and breadcrumbs |

> **Note:** `(dashboard)/layout.tsx` is `"use client"` because it uses `usePathname()` to resolve the active page title for the Topbar. This is an intentional exception — the layout must be client-side to read the current route.

### 8.11 Async Dynamic APIs (Next.js 15)
**[Next.js 15 Official]** Dynamic APIs (`params`, `searchParams`, `cookies`, `headers`) are now asynchronous.

```typescript
// ✅ CORRECT (Next.js 15)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>Order: {id}</div>;
}
```

### 8.12 Route Protection (AuthGuard)
**[Team Convention]** For MVP, we use the `AuthGuard` component wrapper located in `src/components/layout/AuthGuard.tsx`. It leverages the `useRequireAuth` hook from `AuthContext` to redirect unauthorized users client-side. It is applied inside `(dashboard)/layout.tsx` via a `Suspense` boundary. Server-side `middleware.ts` is a post-MVP enhancement.

### 8.13 Provider Aggregation Pattern
**[Team Convention]** All global providers are composed in `src/app/providers.tsx` and imported once by the root `layout.tsx`. This keeps the root layout clean and makes provider order explicit. Adding a new global provider means editing only `providers.tsx`.

```typescript
// src/app/providers.tsx
'use client';
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}
```

### 8.14 Navigation Configuration
**[Team Convention]** Sidebar navigation is driven by `NAVIGATION_GROUPS` exported from `src/config/navigation.ts`. This is a typed array of `NavGroup` objects, each containing `NavItem` entries with `href`, `label`, `icon`, and optional `role`. Adding or reordering nav items requires editing only `navigation.ts` — never the `Sidebar` component itself.

Navigation is split into two groups:
- **Operations:** Dashboard, Orders, Customers, Notifications — accessible to all authenticated roles.
- **Administration:** Reports, Payments, Staff Accounts, Service Rates, Activity Log — restricted to `ADMIN` role.

### 8.15 Testing Toolchain
**[Team Convention]** The project uses **Vitest** (not Jest) as the test runner, configured via `vitest.config.ts` and `vitest.setup.tsx`. Tests live in `src/tests/` mirroring the `src/` structure. The `@testing-library/react` and `happy-dom` packages provide the component testing environment. Run tests with `npm run test`; watch mode with `npm run test:watch`.

### 8.16 Decommissioned Root Artifacts
**[Team Convention]** The empty `lib/` directory at the project root is a decommissioned artifact from an earlier architecture. It is preserved only to avoid breaking legacy build scripts or Docker volume mappings that may still reference it. No new code should be placed in this directory. All utility logic must live in `src/lib/`.

---

## 9. Component Authoring Checklist

- [ ] Prop interface is defined in `types/components.ts`, not inline
- [ ] Component uses `useAuth()` from `@/contexts/AuthContext` for user-dependent logic
- [ ] Component uses `ORDER_STATUS` constants — no status-string literals
- [ ] Component uses `UI_LABELS` from `@/constants/ui` — no hardcoded strings
- [ ] If using `useState` or `useEffect` — `"use client"` is at the top of the file
- [ ] Imports use `@/` path aliases — no `../../` chains
- [ ] If adding a new form — validation schema added to `src/lib/validators.ts`
- [ ] If adding a new nav item — edit `src/config/navigation.ts`, not `Sidebar.tsx`

---

## 10. Route Map & RBAC Matrix

| Path | Description | Access Level | Status |
| :--- | :--- | :--- | :--- |
| `/login` | Authentication Portal | Public | ✅ |
| `/` | Public Landing / Portal Home | Public | ✅ |
| `/track` | Public Order Tracking | Public | ✅ |
| `/overview` | Dashboard Home (KPI + Pipeline) | Staff / Owner | ✅ |
| `/orders` | Order Queue | Staff / Owner | ✅ |
| `/orders/[id]` | Order Detail | Staff / Owner | ✅ |
| `/orders/[id]/pay` | Payment Interface | Staff / Owner | ✅ |
| `/customers` | Customer Directory | Staff / Owner | ✅ |
| `/customers/[id]` | Customer Profile Detail | Staff / Owner | ✅ |
| `/notifications` | Alerts and Notifications | Staff / Owner | ✅ |
| `/payments` | Transaction Ledger | Owner Only | ✅ |
| `/rates` | Pricing Configuration | Owner Only | ✅ |
| `/reports` | Sales Reports / Business Intelligence | Owner Only | ✅ |
| `/users` | Staff Account Management | Owner Only | ✅ |
| `/activity` | Forensic Audit Log | Owner Only | ✅ |

---

## 11. Conclusion

This Frontend Structure Specification (**FRONT-002**) is the authoritative engineering reference for the Faith Laundry Shop. It is grounded in official Next.js 15 conventions and optimized for operational data density.

For visual design and HCI patterns, refer to **[FRONT-001: Frontend Design Specification](frontend-design-spec.md)**.
