# Data Model Updates

No new database entities are introduced.

## Navigation Config Expansion

The frontend navigation configuration will be expanded to support the "Coming Soon" state.

```typescript
export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType;
  isComingSoon?: boolean; // NEW
}
```
