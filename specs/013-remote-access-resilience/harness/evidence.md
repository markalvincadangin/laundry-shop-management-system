# Evidence Links

Pointers only. An entry records WHERE proof lives, not the proof itself.
Excerpts are capped at 25 words. IDs match curated.md (E001, E002…).

## E001
- Claim: Vercel rewrites can reverse-proxy browser requests to an external origin without changing the visible URL.
- Source: https://examples.vercel.com/guides/vercel-reverse-proxy-rewrites-external
- Locator: "Reverse proxying with rewrites"
- Excerpt: "Rewrites allow you to send users to different URLs without modifying the visible URL."
- Supports: Mission #1; design Architecture; old plan Task 1.

## E002
- Claim: External-rewrite caching must be considered explicitly for API responses.
- Source: https://examples.vercel.com/kb/guide/using_vercel_as_a_cdn
- Locator: "Enable Caching"
- Excerpt: "Use Vercel's external rewrites to proxy and cache content from external websites or APIs."
- Supports: Mission #1; design Availability and Offline Experience; old plan Task 4.

## E003
- Claim: A Next.js static export cannot include rewrites.
- Source: https://nextjs.org/docs/pages/guides/static-exports
- Locator: "Unsupported Features"
- Excerpt: "Rewrites" is listed among features requiring a Node.js server that are not supported.
- Supports: Mission #1; design Deployment Modes; old plan Task 1.

## E004
- Claim: Current deployment settings differ from the approved dual-mode design.
- Source: frontend/next.config.mjs; frontend/src/lib/api-client.ts; backend/src/main/resources/application.yml; backend/src/main/resources/application-prod.yml
- Locator: top-level config; `getBaseUrl`; `server.address`; `app.security.cookie-same-site`
- Excerpt: `output: 'export'`; `address: 0.0.0.0`; production `cookie-same-site: None`.
- Supports: Mission #1; old plan Tasks 1 and 4.

## E005
- Claim: Cookie policy must explicitly use Secure/HttpOnly and an appropriate SameSite mode.
- Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
- Locator: "SameSite" and "Secure"
- Excerpt: "Controls whether or not a cookie is sent with cross-site requests."
- Supports: Mission #1; design Security Constraints; old plan Task 4.

## E006
- Claim: Ngrok can use a Windows agent configuration and forward a configured endpoint to a local service.
- Source: https://ngrok.com/docs/agent/config ; https://ngrok.com/docs/getting-started/cloud-endpoints-quickstart
- Locator: "Default locations"; "Start your Agent endpoint"
- Excerpt: "Windows: `%LocalAppData%\\ngrok\\ngrok.yml`"; "requests made to your domain ... routed here."
- Supports: Mission #1; design Architecture and Configuration Contract; old plan Task 5.

## E007
- Claim: Existing business writes are service-layer transactions, requiring idempotency to participate in the same transaction.
- Source: backend/src/main/java/com/himotech/laundryms/orders/service/OrderService.java; payments/service/PaymentService.java; customers/service/CustomerService.java
- Locator: `@Transactional` mutation methods
- Excerpt: `@Transactional` is applied to the methods performing the business mutation.
- Supports: Mission #1; design Interrupted Business Operations; old plan Task 2.
