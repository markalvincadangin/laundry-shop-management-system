---
applyTo: "frontend/**"
---

# Frontend Instructions — Next.js 15
## Faith Laundry Shop Management System

> **Context:** Web UI for laundry order management with staff/admin workflows and public order tracking  
> **Stack:** Next.js 15.5.15, React 19, TypeScript 5, Tailwind CSS 3, TanStack Query v5  
> **Full context:** See `CLAUDE.md` at project root

---

## Tech Stack (Mandatory)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js **15.5.15** (App Router — NOT Pages Router, NOT Next.js 14) |
| Language | TypeScript 5 (strict mode) |
| UI Library | React **19** |
| Styling | Tailwind CSS 3 + custom `globals.css` design tokens |
| Server State | TanStack Query (React Query) **v5** |
| Forms | React Hook Form + Zod |
| Charts | Recharts 3 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Toasts | Sonner |
| Testing | Vitest + Testing Library + happy-dom |
| Type Gen | `npm run generate:types` → from `openapi.yaml` |

**Do NOT suggest:** Redux, MobX, Pages Router, class components, `axios` (services use `fetch`), inline styles (use Tailwind).

---

## Critical `"use client"` Rule

**Next.js 15 App Router requires explicit `"use client"` on every file that uses:**
- `useState`, `useEffect`, `useRef`, `useContext`
- `useRouter`, `usePathname`, `useSearchParams`
- `createPortal` (e.g., `Modal.tsx`)
- Event handlers (`onClick`, `onChange`, etc.)
- Framer Motion (`motion.*`)
- Any browser-only API

```tsx
// ✅ CORRECT — Always at the very top of the file
"use client";

import { useState } from "react";

// ❌ WRONG — Missing directive on a component using hooks
import { useState } from "react"; // Will crash in production build!
```

---

## UI String Constants Rule

**ALL display text must come from `src/constants/ui/`, never hardcoded in components.**

```tsx
// ✅ CORRECT
import { UI_LABELS } from "@/constants/ui";
<h1>{UI_LABELS.modules.orders.TITLE}</h1>

// ❌ WRONG — hardcoded string
<h1>Orders</h1>
```

**Adding new text:** Add the constant to the appropriate file in `src/constants/ui/modules/` or `src/constants/ui/shared.ts` **first**, then reference it.

---

## TypeScript Types Rule

Types are **auto-generated** from the OpenAPI spec. Never edit `src/types/api.generated.ts` manually.

```bash
# Run after any openapi.yaml change
npm run generate:types
```

Domain types live in `src/types/components.ts`. Import generated types from `@/types/api.generated`.

---

## Directory Structure

```
frontend/src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx            # Public login page
│   ├── (dashboard)/                  # Auth-required layout
│   │   ├── overview/page.tsx         # Dashboard KPIs
│   │   ├── orders/
│   │   │   ├── page.tsx              # Order queue
│   │   │   ├── new/page.tsx          # New order intake (US-01, US-02)
│   │   │   ├── [id]/page.tsx         # Order detail + status actions (US-03, US-05)
│   │   │   └── [id]/pay/page.tsx     # Checkout (US-06)
│   │   ├── customers/                # Customer list + detail
│   │   ├── payments/page.tsx         # Payment history (Admin)
│   │   ├── reports/page.tsx          # Sales reports (Admin, US-08, US-09)
│   │   ├── rates/page.tsx            # Service rate management (Admin)
│   │   ├── client-alerts/page.tsx    # SMS/Notification log (Admin)
│   │   ├── users/page.tsx            # User management (Admin)
│   │   └── audit-logs/page.tsx       # Forensic audit (Admin)
│   └── (public)/
│       └── track/page.tsx            # Public order tracking (US-04)
├── components/
│   ├── features/
│   │   ├── orders/                   # IntakeWizard, OrderIntakeForm, ClaimStub, LiveTicket
│   │   ├── dashboard/                # OrderPipeline, OrderCard, ProcessStepper
│   │   ├── payments/                 # Checkout components
│   │   ├── reports/                  # RevenueChart
│   │   └── client-alerts/            # ClientAlertPopover
│   ├── layout/                       # Topbar, MobileNav, Sidebar
│   └── ui/                           # Shared atoms: Modal, Input, KPICard, StatusBadge
├── constants/
│   └── ui/                           # ALL UI strings
│       ├── index.ts                  # Main export: UI_LABELS
│       ├── modules/                  # orders.ts, payments.ts, reports.ts, etc.
│       ├── shared.ts, forms.ts, etc.
├── hooks/                            # useOrders, usePayments, usePriceCalculation, etc.
├── services/                         # API layer (fetch-based)
├── types/
│   ├── api.generated.ts              # AUTO-GENERATED — do not edit
│   └── components.ts                 # Manually maintained component types
└── tests/                            # Vitest tests mirroring app/ structure
```

---

## API Integration Pattern

### Services (`src/services/`)
API calls use `fetch` with `credentials: "include"` (for the HTTP-only JWT cookie).

```typescript
// src/services/orders.service.ts
const API = process.env.NEXT_PUBLIC_API_URL;

export const ordersService = {
  create: (data: CreateOrderRequest) =>
    fetch(`${API}/v1/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }).then(res => res.json()),
};
```

### Hooks (`src/hooks/`)
All data fetching goes through TanStack Query hooks.

```typescript
// src/hooks/useOrders.ts
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";

export function useOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersService.list(params),
  });
}
```

### Error Handling
```typescript
// Use Sonner for user-facing errors
import { toast } from "sonner";

try {
  await ordersService.create(data);
  toast.success(UI_LABELS.feedback.success.SAVED);
} catch (err) {
  toast.error(err?.message || UI_LABELS.feedback.error.GENERIC);
}
```

---

## Business Logic Rules

### ❌ NEVER implement on frontend:
- Pricing calculations (load count, totals)
- Status transition validation
- Payment amount validation
- Business rule enforcement

### ✅ ALWAYS trust the backend:
- Display totals exactly as returned by API
- Show status badge based on API response value
- Let backend reject invalid state transitions

**The exception — live price preview:**  
`usePriceCalculation` hook calls `POST /api/v1/orders/preview` to get a live estimate. The backend still does all computation.

```typescript
// ✅ CORRECT — Preview calls backend
const pricing = usePriceCalculation({
  serviceType: String(serviceType),  // Required prop — do NOT omit
  weightKg: String(weightKg),
  extraMinutes: String(extraMinutes),
  addOns,
});

// ❌ WRONG — Frontend math
const total = loads * 140 + extraMinutes * 1; // NEVER DO THIS
```

---

## Access Control (UI)

| Role | What they can see |
|------|-----------------|
| `ADMIN` | All pages including Reports, Rates, Users, Audit Logs |
| `STAFF` | Orders, Customers, Payments — NO Reports/Settings |
| Public | `/track` page only |

```tsx
// Pattern for hiding admin-only elements
const { user } = useAuth();
if (user?.role !== "ADMIN") return null; // or redirect
```

**Do NOT expose to public tracking page:** internal IDs, staff names, full customer profiles, financial details.

---

## Styling Standards

### Design System
- Use Tailwind utility classes (no inline styles unless absolutely unavoidable)
- The `globals.css` file defines custom design tokens — use them for brand colors
- Consistent spacing: `gap-2`, `gap-4`, `gap-6`, `gap-8`, `p-4`, `p-6`
- Responsive-first: `sm:`, `md:`, `lg:` breakpoints

### Premium UI Requirements (Non-negotiable)
- All interactive elements must have hover states
- Loading states must show skeleton loaders or spinners
- Error states must show friendly, actionable messages
- Animations use Framer Motion (already installed) for page/component transitions
- Status badges use `StatusBadge` component from `src/components/ui/`

### Modal Components
All modals must use the shared `Modal` component from `src/components/ui/Modal.tsx`, which:
- Has `"use client"` directive (already fixed)
- Uses `createPortal` for correct stacking context
- Handles `Escape` key and backdrop click

---

## Forms

All forms use React Hook Form + Zod. Pattern:

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  weightKg: z.string().min(1, "Weight is required"),
  serviceType: z.string().min(1, "Service type is required"),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const { register, handleSubmit, watch, formState: { errors } } = 
    useForm<FormData>({ resolver: zodResolver(schema) });
  // ...
}
```

---

## Testing Standards

```typescript
// Test file pattern: src/tests/app/(dashboard)/orders/page.test.tsx
import { render, screen } from "@testing-library/react";
import { UI_LABELS } from "@/constants/ui";

describe("Orders Page", () => {
  it("renders the page title", () => {
    render(<MockedOrdersPage />);
    expect(screen.getByText(UI_LABELS.modules.orders.TITLE)).toBeInTheDocument();
  });
});
```

**Run tests:**
```bash
npm run test           # Run once (Vitest)
npm run test:watch     # Watch mode
npm run typecheck      # Type checking only
npm run lint           # ESLint only
npm run build          # Full production build (catches all errors)
```

**CI simulation — run before every push:**
```bash
npm run lint && npm run typecheck && npm run build
```

---

## Development Checklist (Before PR)

- [ ] `"use client"` present on every file using hooks, events, or browser APIs
- [ ] All UI text referenced from `UI_LABELS` (never hardcoded)
- [ ] No business logic calculations on frontend (use backend preview endpoint)
- [ ] New constants added to `src/constants/ui/` before use
- [ ] `api.generated.ts` not manually edited (regenerated via `npm run generate:types`)
- [ ] TanStack Query used for all API calls (no raw `useEffect` + `fetch`)
- [ ] Error states handled with Sonner toasts
- [ ] Loading states implemented (skeleton/spinner)
- [ ] New client components have `"use client"` at top
- [ ] `npm run lint` passes ✅
- [ ] `npm run typecheck` passes ✅
- [ ] `npm run build` passes ✅
