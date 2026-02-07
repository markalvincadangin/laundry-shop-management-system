---
applyTo: "frontend/**"
---

## Frontend Instructions — Next.js 14+

### Stack
- Next.js 14+
- React
- TypeScript
- Tailwind CSS

---

## Architecture rules
- Use App Router by default
- Keep API access in a single client module
- Do not duplicate backend business logic

---

## API usage rules
- Follow `/docs/05-tech-design/openapi.yaml` exactly
- Do not assume fields not defined in OpenAPI
- Handle errors using the standard ErrorResponse schema

---

## UI rules
- Never hardcode pricing calculations
- Display totals exactly as returned by backend
- Public order tracking page must only show:
    - reference number
    - order status
    - created date
    - minimal summary
- Never expose:
    - internal IDs
    - staff or user data

---

## Styling rules
- Use Tailwind CSS
- Avoid inline styles unless necessary
- No additional CSS frameworks unless explicitly requested