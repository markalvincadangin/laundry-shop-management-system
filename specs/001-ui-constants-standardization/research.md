# Research: UI Constants Standardization

## ESLint Configuration for Next.js

- **Decision**: Enable `react/jsx-no-literals` within the Next.js ESLint flat config (`eslint.config.mjs`).
- **Rationale**: `eslint-config-next` includes `eslint-plugin-react` by default. We can leverage the existing plugin rather than installing new ones. We will configure it to ignore string properties (`ignoreProps: true`) since sometimes external components require string props that shouldn't be extracted (e.g., `aria-label`, although those should ideally be extracted too, `ignoreProps: true` is safer for a start).
- **Alternatives considered**: Writing a custom AST linter (too complex), using a full `i18n` library (rejected by user as YAGNI).

## Variable Interpolation

- **Decision**: Define constants as functions that return template literals when variables are needed.
- **Rationale**: TypeScript naturally supports strongly typed functions. E.g., `TOTAL_MSG: (amount: string) => \`Total: ₱${amount}\``. This is perfectly type-safe and avoids string concatenation in the component view.
- **Alternatives considered**: Using `sprintf` or string replacement functions (less type-safe, requires external library).
