# Centralized UI Constants (`UI_LABELS`)

This directory contains all the string constants used in the frontend application. 

## The Pattern
We use a **Centralized UI Dictionary** (also known as a "Poor Man's i18n") pattern. 
Instead of hardcoding text inside React components, all labels, button texts, table headers, and messages are extracted into these TypeScript files and exported as the global `UI_LABELS` object.

### Why do we do this?
1. **Consistency**: Ensures a button says exactly the same thing (e.g., "Settle Payment") across all screens and modals.
2. **Maintainability**: If the business requirements change the terminology (e.g., changing "Service Rates" to "Pricing Configuration"), we only have to update a single string in one file, rather than running a global search-and-replace across 50 React components.
3. **Future-Proofing**: If the app ever needs to be translated to Tagalog or another language, 100% of the text is already isolated from the logic and markup.

## Rules
- **NO HARDCODED STRINGS**: Do not use literal strings in your JSX. The CI pipeline will warn/fail via the `react/jsx-no-literals` ESLint rule if you do.
- **Dynamic Text**: If your text requires variables, define a function in the constants file.
  ```ts
  // Bad
  <p>{UI_LABELS.modules.orders.TOTAL} {amount}</p>
  
  // Good (in constants)
  export const orders = { TOTAL_MSG: (amount: string) => `Total: ₱${amount}` }
  // Good (in component)
  <p>{UI_LABELS.modules.orders.TOTAL_MSG(amount)}</p>
  ```
- **Organization**: Group constants by feature module (e.g., `modules/orders.ts`) or put truly global strings in `shared.ts`. Do not bloat `index.ts`.
