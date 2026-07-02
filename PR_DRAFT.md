# Pull Request Draft: feat(support): support page, admin panel, i18n, remove orderNumber

## Summary

This branch implements the "Support & Feedback" feature for Aura Beauty and prepares the codebase for final testing and review. Key points:

- Public support page with form and reCAPTCHA v3 support (keys to be provided later).
- Admin panel with authentication (session/JWT), ticket list, ticket detail, reply flow, and profile (change password).
- Realtime notifications via socket.io and friendly toast notifications (react-toastify).
- Full i18n integration (react-i18next) with Russian (`ru`) and Oʻzbek (latin `uz`) locales.
- Removed `orderNumber` from the codebase and translations (schema updated in `prisma/schema.prisma`).

This PR is intentionally prepared as a draft: the DB migration should be run in a local/test environment after backup and before merging to production.

---

## What is included

- Prisma: `prisma/schema.prisma` — `orderNumber` removed from `SupportTicket`.
- Seed: `prisma/seed.js` — creates initial admin user (uses `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` or defaults).
- i18n: `lib/i18n.js`, `locales/ru.json`, `locales/uz.json` (latin). All visible UI strings replaced with i18n keys on main pages.
- Public UI: `pages/support.jsx` — support form (topics: General, Complaint, Suggestion, Review, Partnership, Other).
- Admin UI: `pages/admin/login.jsx`, `pages/admin/support/index.jsx`, `pages/admin/support/[id].jsx`, `pages/admin/profile.jsx` (change password).
- APIs: `/api/support`, `/api/admin/*` endpoints including login/logout/me, ticket list/details, reply, change-password, and socket init `/api/socket`.
- Auth: `lib/auth.js` — JWT session cookies, `passwordChangedAt` invalidation logic.
- Notifications: `react-toastify` toasts and `socket.io` integration (server init in `/api/socket`).
- Docs: `README.md`, `README_DEPLOY.md` updated with instructions and environment variables.

---

## Breaking Changes

- `SupportTicket.orderNumber` column removed from `prisma/schema.prisma`.
  - This is a destructive migration. Before applying in a production database, create a backup export of the DB.
  - After migration, the column and any data in it will be permanently removed.

- All UI and API usages of `orderNumber` have been removed; APIs no longer accept/return this field.

---

## Migration & Local Setup Instructions (to run locally / in test env)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create or update `.env` with at least the minimum variables for local development (example in README):

   - DATABASE_URL=postgresql://user:pass@localhost:5432/db
   - JWT_SECRET=your_jwt_secret
   - NEXT_PUBLIC_SITE_URL=http://localhost:3000
   - SUPPORT_EMAIL=mashxurakhon800@gmail.com
   - (optional for local testing) SMTP_* variables, RECAPTCHA keys
   - SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (optional)

3. Generate and apply the Prisma migration that removes `orderNumber`:

   ```bash
   npx prisma migrate dev --name remove_order_number
   ```

   Note: This command will create SQL migration files and apply them to your local database.

4. Generate the Prisma client:

   ```bash
   npx prisma generate
   ```

5. Seed the admin user (optional but recommended):

   ```bash
   npm run seed
   ```

   The seed script will create an admin with the email/password defined in env or defaults and will print the credentials.

6. Run the dev server:

   ```bash
   npm run dev
   ```

7. Open the app:

   - Public support form: http://localhost:3000/support
   - Admin login: http://localhost:3000/admin/login

---

## Post‑migration Verification Checklist (run after migration + seed)

- Environment & build
  - [ ] `npm install` completed without errors
  - [ ] `npx prisma migrate dev --name remove_order_number` applied successfully
  - [ ] `npx prisma generate` completed successfully
  - [ ] `npm run seed` created admin user
  - [ ] `npm run dev` starts the app without runtime errors

- i18n & strings
  - [ ] No hardcoded user-facing strings remain in the main UI pages (support, admin, profile)
  - [ ] All toast messages use i18n keys and render localized text
  - [ ] Both locales (`ru`, `uz`) are present and switching renders localized text

- Support form (public)
  - [ ] Form fields: Name, Email, Phone (optional), Topic, Message
  - [ ] Topics: General, Complaint, Suggestion, Review, Partnership, Other
  - [ ] Submitting creates `SupportTicket` and `SupportMessage` records in DB
  - [ ] reCAPTCHA v3 call is executed if keys are present; if not present, dev flow should allow submission
  - [ ] Success message shows localized confirmation

- Admin panel
  - [ ] Admin login works; cookie is HttpOnly and set on successful login
  - [ ] `/admin/support` lists tickets (search by name/email works)
  - [ ] Ticket detail shows message history and admin reply UI
  - [ ] Admin can reply — reply saved as `SupportMessage` and displayed in history
  - [ ] Reply triggers an email to the user when SMTP is configured
  - [ ] Admin can change ticket status (new → processing → closed) and events are emitted
  - [ ] Toast notifications appear for new ticket and ticket updates (localized)

- Real‑time
  - [ ] `/api/socket` initializes socket.io on server start
  - [ ] Creating a ticket emits `support:new` and connected admin clients receive it
  - [ ] Updating/replying emits `support:updated` and admin clients receive it

- Auth & profile
  - [ ] Admin password change requires old password and confirms new password
  - [ ] Password is hashed with bcrypt before saving
  - [ ] After password change, the cookie is cleared and old tokens become invalid (passwordChangedAt logic)
  - [ ] Logout works and clears cookie

- Defensive / dev behaviour
  - [ ] If SMTP variables are not provided, email sending is skipped and app logs a warning (no crash)
  - [ ] If reCAPTCHA keys are not provided, dev flow should allow submission (but production must have keys)
  - [ ] No references to product catalog, cart, checkout, or payment exist in UI or routes

- UX & layout
  - [ ] Basic responsive checks: support form, admin list, ticket view render correctly on mobile/tablet/desktop
  - [ ] Toasts do not overlap key UI elements and are readable on mobile

---

## Notes & Recommendations

- This PR includes a destructive schema change. If you have any production data, create a DB backup before applying the migration.
- For reliable email delivery in production, configure a transactional email provider (SendGrid / Mailgun) and ensure SPF/DKIM records are set.
- For production realtime, evaluate whether a dedicated socket server or a managed realtime provider is preferable — Vercel serverless functions have limitations for long‑lived socket connections.
- reCAPTCHA keys (v3) must be added as env vars in production. Current code supports skipping verification if keys are not present (useful for local dev only).

---

If you want, I can attach this PR description as `PR_DRAFT.md` in the branch (so it becomes part of the repo). I will also include this checklist and the breaking changes block in that file. After you create the actual GitHub Pull Request from `feature/support`, we can iterate on review comments and I will finalize integration after you provide `.env`, SMTP, reCAPTCHA keys, and brand assets.
