# 🎯 TASK 3 — STRICT PROMPT
**Title:** Simple User Registration & Sign‑In for Dashboard (Strapi Auth · React UI · No new UI libs)

**Goal:**  
Add **basic authentication** to the service so a user can **register**, **sign in**, access their **Dashboard (/dashboard/projects)** and manage **only their own projects**. Keep the current React UI and styles (no new UI libraries). Backend is **Strapi** (already in use).

---

## 0) Scope (must deliver)
1) **Public routes:** `/auth/register`, `/auth/login`.  
2) **Protected routes:** `/dashboard/*`, `/editor/:projectId` (redirect unauthenticated users to `/auth/login`).  
3) **Registration flow:** email + password → create user in Strapi → auto‑login → redirect to `/dashboard/projects`.  
4) **Login flow:** email + password → JWT from Strapi → remember session (see “Session storage”).  
5) **Current user endpoint:** fetch profile to restore session and filter data (only own projects).  
6) **Sign out:** clear session → redirect to `/auth/login`.  
7) **Ownership:** new projects/pages/blocks linked to the **current user**; the user sees **only their items**.

> **No new UI libs**, use existing inputs/buttons/forms and styles.

---

## 1) Strapi setup (auth & ownership)

- **Users & Permissions** plugin must be enabled (Strapi default).  
- **Role:** use the default `authenticated` role; configure permissions for `project`, `page`, `block`:
  - `find`, `findOne` **only where `owner` = current user** (use **Strapi v4 policies** or query filters with `owner` relation).  
  - `create`, `update`, `delete` allowed for authenticated users **on own content only**.
- **Content changes:**  
  - Add relation `owner` (one‑to‑one → `users-permissions.user`) to **project**.  
  - On creation of project via API, set `owner = ctx.state.user.id` (Strapi controller override or lifecycle hook).  
  - Ensure `page` and `block` access is **scoped by project.owner** (controller or policy).
- **Auth endpoints (Strapi REST):**  
  - Register: `POST /api/auth/local/register` (body: `{ username, email, password }`)  
  - Login:    `POST /api/auth/local`           (body: `{ identifier, password }`)  
  - Me:       `GET  /api/users/me` (with `Authorization: Bearer <JWT>`)  
  - (Namespaces may be `/api` depending on your Strapi config; keep consistent.)

**Security (Task‑3 level):**  
- Keep **email verification OFF** for now (can be Task‑N).  
- Password min length 8; reject weak passwords client‑side (basic rule).  
- CORS allows your front‑end origin; do **not** allow `*` in production.  
- Rate‑limit auth endpoints at the reverse proxy (later task).

---

## 2) Front‑end behavior (React · no new UI libs)

### Routes
- `/auth/register` — simple form: **email, password, confirm password** (+ optional display name).  
- `/auth/login` — **email (identifier), password**.  
- On success → **redirect to `/dashboard/projects`**.  
- If already authenticated → redirect from `/auth/*` to `/dashboard/projects`.

### Session storage
- **Task‑3 (simple):** store JWT in **memory** and **localStorage** (`auth.jwt`) to restore after reload; set `auth.user` with `/users/me`.  
  > Примечание: хранение JWT в localStorage — компромисс на MVP; позже заменим на httpOnly cookie + proxy.
- **Restore:** on app boot, if `auth.jwt` exists, call `/users/me`; on 401 → clear and go to `/auth/login`.

### Guards
- A **route guard/HOC** protects `/dashboard/*` and `/editor/:projectId`:  
  - If no valid session → redirect to `/auth/login` with `next=/editor/:id` or `/dashboard/projects`.  
  - After login/register, if `next` present → redirect there.

### Errors & UX
- Inline errors under inputs (email already taken, invalid credentials).  
- Disable submit while awaiting server response.  
- Show minimal toasts using existing components if they exist; otherwise inline messages.

---

## 3) API contracts (client → Strapi)

- **Register** `POST /api/auth/local/register`  
  body: `{ username: <email-or-name>, email, password }` → returns `{ jwt, user }`  
- **Login** `POST /api/auth/local`  
  body: `{ identifier: <email>, password }` → returns `{ jwt, user }`  
- **Me** `GET /api/users/me`  
  headers: `Authorization: Bearer <jwt>` → returns `{ id, email, username, ... }`

- **Projects** (must be scoped to owner server‑side):
  - `GET  /api/projects?sort=updatedAt:desc&pagination[pageSize]=50`
  - `POST /api/projects` → `{ name, slug, ... }` (Strapi sets `owner` automatically)
  - `PUT  /api/projects/:id` → `{ name?, status? }`
  - `DELETE /api/projects/:id` (or `status: archived`)

> Front‑end MUST always send the `Authorization: Bearer <jwt>` header for protected endpoints.

---

## 4) Ownership & filtering (strict)

- When creating **project**: server sets `owner = currentUser`.  
- When listing **projects** in Dashboard: server returns **only user’s projects**; front‑end does **not** filter by `owner` on the client (avoid leakage).  
- When accessing `/editor/:projectId`: first confirm the project belongs to the current user (404/403 if not).

---

## 5) Persistence in the editor (integration touchpoints)

- On project open: reuse existing loader for `project → pages → blocks`, but now the API calls include the JWT header.  
- On create page/block: Strapi must validate ownership through `project.owner`.  
- Autosave logic from Task‑2 continues to work **with JWT header**.

---

## 6) Validation (client)

- **Register:**  
  - Email format; password length ≥ 8; password confirmation equals password.  
  - If Strapi returns `email already taken` — show exact message.  
- **Login:**  
  - Non‑empty identifier/password; show “Invalid credentials” on 400/401.  
- **Common:** disable submit while loading; re‑enable on error; focus first invalid field.

---

## 7) Acceptance Criteria

1. **Register/Login pages** exist and use existing form styles; no new UI libs.  
2. Successful register/login returns JWT, is stored (memory + localStorage), and **redirects to `/dashboard/projects`**.  
3. **Route guard** blocks `/dashboard/*` and `/editor/:projectId` for unauthenticated users; after login follows `next` param.  
4. **Dashboard** shows only the current user’s projects; creating a new project assigns `owner` automatically.  
5. **Editor** loads only projects belonging to the user; protected API calls include JWT; autosave unchanged.  
6. **Sign out** clears session and redirects to `/auth/login`.  
7. No console errors; existing styles/design preserved.

---

## 8) Deliverables (one PR)

- React routes: `/auth/register`, `/auth/login`, guard/HOC for protected routes.  
- Minimal auth store (`auth.jwt`, `auth.user`, `login`, `register`, `logout`, `restore`).  
- Strapi side: `owner` relation on `project`, permissions/policies limiting access to own content; README with exact steps.  
- Updated API service to attach `Authorization: Bearer <jwt>` automatically.  
- Short docs: env vars (`VITE_STRAPI_URL`), where to paste Strapi API token for seed/admin (only for local dev), how to run auth flows.

---

## 9) Next steps (after Task‑3, not in scope now)

- Email verification + reset password via Strapi email provider.  
- Move from localStorage JWT to **httpOnly cookie** via a small proxy (CSR‑safe) for better security.  
- Rate‑limiting at proxy (login/register), CAPTCHA for abuse protection.