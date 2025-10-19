Admin dispatcher
================

This folder exposes a single Vercel serverless function `index.ts` that acts as a dispatcher for many admin operations (actions passed via `?action=...`).

Why this exists
----------------
Vercel's Hobby plan counts each file under `api/` as a separate serverless function and limits you to 12. To avoid hitting that limit while keeping the admin features available, we centralize all admin handlers behind one function and place the actual handler implementations outside `api/` at `server/admin_handlers/`.

Key points
----------
- Handler implementations live in `server/admin_handlers/` and are imported by `api/admin/index.ts`.
- The original per-endpoint implementations are preserved in `api/_admin_archive/` for reference.
- This keeps service-role logic server-side and avoids exposing sensitive keys to the browser.

Restoring standalone endpoints
-----------------------------
If you later move to a plan that supports more serverless functions and want separate endpoints:
1. Move the handler file from `server/admin_handlers/` or `api/_admin_archive/` back into `api/`.
2. Export the default `handler(req,res)` function.
3. Deploy — be aware this increases the function count.

Testing locally
---------------
Run your dev server (e.g., `pnpm dev` or `vercel dev`) and call endpoints like:

GET /api/admin?action=top-products&limit=5
GET /api/admin?action=sales&period=month
POST /api/admin?action=option-values-batch

Security
--------
Always ensure `SUPABASE_SERVICE_ROLE_KEY` is set only in server environment variables and never exposed to the client.
