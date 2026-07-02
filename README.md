# Aura Beauty — Support feature

This branch implements a basic "Support and Feedback" feature for Aura Beauty using Next.js + Prisma.

Environment variables (example):

- DATABASE_URL=postgresql://user:pass@localhost:5432/db
- SUPPORT_EMAIL=mashxurakhon800@gmail.com
- SMTP_HOST=
- SMTP_PORT=587
- SMTP_USER=
- SMTP_PASS=
- SMTP_SECURE=false
- RECAPTCHA_SECRET_KEY=
- NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
- NEXT_PUBLIC_SITE_URL=http://localhost:3000
- SEED_ADMIN_EMAIL=admin@aura-beauty.test
- SEED_ADMIN_PASSWORD=password123

How it works:
- Public page: /support — form that POSTs to /api/support
- Admin list: /admin/support — lists tickets
- Admin detail: /admin/support/[id] — view, reply, change status
- Socket server: /api/socket initializes socket.io and allows server->clients notifications

Seeding admin:
- Run `npm run seed` to create an admin user (email/password from env or defaults).

Notes:
- reCAPTCHA v3 is supported. If keys not provided, verification is skipped (useful for local dev).
- Emails are sent via SMTP if SMTP_* vars provided. All tickets are also stored in DB and a notification is emitted to connected admin clients.

Next steps:
- Add styling to match Aura Beauty branding (colors, fonts, logo).
- Add authentication for admin routes.
- Add i18n integration and ensure Uzbek translations are used where needed.
- Add tests and error handling improvements.
