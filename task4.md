# 🎯 TASK — Persistent Reopen Flow (Strapi + React)

**Goal:** After a user edits a project (text/settings + image uploads), autosave commits changes to **Strapi**. The user can go back to **Dashboard** and later reopen the project; **all edits and media** must be intact and immediately visible in **Editor** (Canvas + Inspector).

---

## Scope (must deliver)
- **Autosave**: debounce **500–1000 ms**, send **minimal PATCH** to Strapi for changed `block/page` fields.
- **Flush on navigation**: when user leaves Editor (Back to Dashboard / route change), wait for all pending saves (`Saving…` → `Saved`) before navigating.
- **Reopen**: on `/editor/:projectId`, load the full tree from Strapi  
  `project → pages (order) → blocks (order, data/style/effects, media refs)` and hydrate the store. Server data is the **source of truth**.
- **Media**: images already stored in **Strapi Upload**; blocks keep `{ id, url, alt }` with **permanent** asset URL. No `ObjectURL`s.
- **Auth**: all requests include `Authorization: Bearer <jwt>`; only the **owner’s** projects are accessible.
- **No new UI libraries**; reuse existing styles/components.



## Conflicts & Reliability
- Send/compare `updatedAt` (or version) on updates; on mismatch show **“Server version changed”** and **Reload** option.
- Network hiccups: queue unsent changes and retry; do not lose edits.

---

