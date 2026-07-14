# Quickstart: Validation Guide for UI Constants

This guide explains how to validate that the UI Constants standardization is enforced.

## Prerequisites

- Node.js installed
- Dependencies installed in the `frontend/` directory.

## 1. Verify ESLint Enforcement

1. Open a TSX file (e.g., `frontend/src/app/page.tsx`).
2. Add a hardcoded string inside a tag:
   ```tsx
   <div>Test Hardcoded String</div>
   ```
3. Run the linter:
   ```bash
   cd frontend
   npm run lint
   ```
4. **Expected Outcome**: The linter will output a warning/error from `react/jsx-no-literals` pointing to the hardcoded string.

## 2. Verify Variable Interpolation

1. Look at `frontend/src/constants/ui/index.ts` (or relevant module).
2. Add a dynamic message:
   ```typescript
   export const TEST_MSG = (name: string) => `Hello, ${name}!`;
   ```
3. Use it in a component:
   ```tsx
   <div>{UI_LABELS.TEST_MSG("Alice")}</div>
   ```
4. **Expected Outcome**: The component renders `Hello, Alice!` without any linting errors.
