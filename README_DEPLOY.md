### Vercel deployment checklist

To deploy the Aura Beauty site and the Support feature to Vercel, set the following Environment Variables in your project settings (Vercel Dashboard) under the appropriate scope (Preview/Production):

- DATABASE_URL — Postgres connection string (e.g., postgres://user:pass@host:5432/db)
- SUPPORT_EMAIL — support inbox (mashxurakhon800@gmail.com)
- SMTP_HOST — SMTP server host (e.g., smtp.gmail.com)
- SMTP_PORT — SMTP port (e.g., 465 or 587)
- SMTP_USER — SMTP username/email
- SMTP_PASS — SMTP password or app password
- SMTP_SECURE — true or false
- JWT_SECRET — secret used to sign admin tokens (strong random string)
- RECAPTCHA_SECRET_KEY — reCAPTCHA v3 secret (server)
- NEXT_PUBLIC_RECAPTCHA_SITE_KEY — reCAPTCHA site key (client)
- NEXT_PUBLIC_SITE_URL — e.g., https://your-site.vercel.app
- SEED_ADMIN_EMAIL — email for seeded admin (optional)
- SEED_ADMIN_PASSWORD — password for seeded admin (optional)

Deployment steps (high level):
1) Push branch to GitHub and open a PR. Vercel can auto-deploy from the branch.
2) In Vercel dashboard: set the Environment Variables above.
3) Run database migrations on deploy (you can use a migration hook or run locally):
   - npx prisma migrate deploy
4) (Optional) Run seed script once to create admin:
   - npx prisma db seed --preview-feature OR npm run seed
5) Visit https://your-site.vercel.app/support and https://your-site.vercel.app/admin/login

Notes:
- Ensure JWT_SECRET is set in Production and is kept secret.
- For SMTP use a transactional email provider (SendGrid/Mailgun) in production for reliability.
- For socket.io on Vercel, consider using a dedicated server or a compatible realtime provider (Vercel Serverless functions have limitations). For production realtime notifications you can use a small Node server or a hosted socket provider (Pusher, Ably) or use polling as fallback.
