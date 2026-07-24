# Data Model: UI Constants

This feature does not introduce database entities. Instead, it defines the structure of the `UI_LABELS` dictionary.

## UI_LABELS Structure

```typescript
export const UI_LABELS = {
  shared: {
    actions: {
      SAVE: "Save",
      CANCEL: "Cancel"
    }
  },
  modules: {
    orders: {
      // Static string
      TITLE: "Order Management",
      // Dynamic string via interpolation
      TOTAL_MSG: (amount: string) => `Total: ₱${amount}`
    }
  }
}
```
