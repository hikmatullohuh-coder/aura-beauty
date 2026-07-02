# Post‑migration QA Checklist

Use this quick checklist to validate the application after you apply migrations and seed the DB.

1) Run migrations and seed
   - npx prisma migrate dev --name remove_order_number
   - npx prisma generate
   - npm run seed

2) Start dev server
   - npm run dev

3) Quick API sanity
   - POST /api/support with minimal payload (name, email, topic, message) -> returns 201
   - GET /api/admin/support -> returns list (401 if not logged in)
   - Login via POST /api/admin/login -> set cookie
   - GET /api/admin/me -> returns admin user

4) UI flow
   - /support -> send a ticket -> see success msg
   - /admin/login -> login -> /admin/support -> open ticket -> reply -> verify message saved

5) Edge cases
   - No SMTP configured: sending should not throw
   - No reCAPTCHA keys: dev should allow submit
   - After change-password: old tokens invalidated

6) i18n
   - Switch language to "uz" (latin) and verify translations across pages


---
