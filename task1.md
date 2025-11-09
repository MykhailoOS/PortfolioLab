# 🎯 TASK 1 — STRICT PROMPT (Directus Integration · Dynamic Inspector Audit · User Media Uploads)

**Purpose:**  
Integrate **Directus** into the existing **React** constructor to enable **image uploads** and verify that the current **Inspector** renders fields **dynamically** (schema‑driven) for the blocks **About** and **Projects**—using the **existing UI and styles** only (no new UI libraries, no redesign).

---

## 1) Scope (must deliver)

- Connect the app to a running **Directus** instance and use it **only for file storage** in this task.
- Enable **image upload** from Inspector to Directus in allowed places:
  - **About:** single avatar image + editable `alt` text.
  - **Projects:** card thumbnails (per item) + editable `alt` text.
- Ensure **Inspector** reads a **small JSON schema per block** and renders fields using the **current inputs/components** (text, textarea, select, switch, chips/tags, image).
- **Canvas** must update **immediately** when values change in Inspector (including uploaded images).
- Keep the **current application structure** (Library / Canvas / Inspector). Do **not** change the design system or styling approach.

---

## 2) Out of Scope (for Task 1)

- No content collections or relational models in Directus (files only).
- No authentication through Directus (use a static access token).
- No 3D/parallax preview inside the editor.
- No changes to export pipelines or ZIP generation.

---

## 3) Directus Setup (minimal demo‑ready)

- **Instance:** local Docker or managed.
- **Role:** create a non‑public role (e.g., `portfolio-demo-uploader`).
- **Permissions:** for **Files** collection allow `create`, `read`, `update (own)`, **deny delete**.
- **Token:** generate a **static access token** for this role; use it on the client (demo only).
- **CORS:** allow the front‑end origin(s); deny wildcard in production.
- **File rules:** max size **5 MB**; allow mimes **PNG/JPEG/WEBP/AVIF**; **block SVG** in Task 1.
- **Assets endpoint:** ensure `/assets/:id` is enabled for public read.

**Environment variables (frontend):**
- `DIRECTUS_URL` — base URL of the instance.  
- `DIRECTUS_TOKEN` — access token for file operations (demo scope, not user‑level).

---

## 4) Inspector — dynamic render requirements

- **Schema‑driven:** Inspector consumes a compact JSON schema per block; adding a field to the schema must automatically show it in the UI.
- **Supported field types (map to your existing inputs):** `text`, `textarea`, `number`, `select`, `switch`, `chips` (tags), `image`, `gallery` (limited count).
- **Validation handled in Inspector:** `required`, `minLength`, `maxLength`, `accept` (for images), `maxItems` (gallery).
- **Error states:** inline, non‑blocking until export (if export button exists).

---

## 5) Blocks to cover in Task 1

**About**
- Fields: `title` (required), `paragraph` (required, min length), `avatar` (image + `alt`), `tags` (chips), `layout` (select of the existing layouts).
- Box‑model (if already present in project): maintain current behavior (no redesign).

**Projects**
- Cards: `image` (per item + `alt`), `title` (required), `desc`, `tags` (chips), `link`.
- Item operations: **add / remove / reorder** using current controls and styles.
- Box‑model: maintain current behavior if present.

---

## 6) Media model (front‑end data, persisted inside blocks)

- Media reference stored in block JSON includes:
  - `id` (Directus file id),
  - `url` (`<DIRECTUS_URL>/assets/<id>`),
  - optional metadata (original name, size, mime, width, height),
  - `alt` (editable in Inspector, required when image exists).

**Note:** do not store temporary `ObjectURL`s; use the **permanent** Directus `assets/:id` link after upload.

---

## 7) Upload behavior (front‑end)

- File selection from Inspector triggers **single POST** to Directus `/files` with the token.
- On success, write a **MediaRef** to the target path in the store; show **48×48** thumbnail preview in Inspector and full image on Canvas.
- Replacing the image must **overwrite** the MediaRef cleanly (no orphan references).
- Enforce client‑side checks:
  - size ≤ **5 MB** (block UI if larger; show reason),
  - mime in allowed list; show clear error if not.

---

## 8) Canvas sync (strict)

- Canvas reads values from the central store; **every field change** must reflect **instantly**.
- Images added/changed via Inspector appear immediately and persist on page reload (because URLs are permanent).
- Visibility rules (if exist in your project) continue to work; no UI changes.

---

## 9) Security & Privacy (demo baseline)

- Use a **role‑scoped token** with minimal permissions; do not enable anonymous write.
- Do not expose administrative endpoints in the client.
- Restrict **CORS** to known origins; refuse wildcard `*` outside local dev.
- Validate file **size** and **mime** on client and rely on Directus validation server‑side.
- Do not accept SVG in Task 1 (avoid scriptable vectors); consider sanitization in later tasks.

---

## 10) Performance & UX

- No new dependencies; **reuse existing inputs** and styles to keep bundle size stable.
- Keep uploads single‑file at a time; show unobtrusive progress/complete states using current components.
- Throttle schema‑driven re‑renders if necessary (maintain current responsiveness).
- Avoid console warnings/errors; keep Lighthouse/Performance unaffected.

---

## 11) Manual test checklist (must pass)

- **About:** upload avatar → preview visible in Inspector; `alt` editable; image shows on Canvas; reload page → image persists.  
- **Projects:** create three cards → upload thumbnails → **reorder** and **remove** a card → Canvas updates correctly and data stays consistent.  
- Invalid file (type or >5 MB) → Inspector shows clear error and blocks upload.  
- Add a new field to the **About** schema (e.g., a subtitle) → Inspector displays it without changing Inspector core.  
- No visual regressions; existing layout and styles remain intact.

---

## 12) Deliverables (PR checklist)

- Directus connection with env variables and a short **README** on how to run/configure Directus and set envs.
- A **file upload service** that sends images to Directus and returns a normalized media reference (id, url, meta).
- Updated **Inspector** to support `image` fields (upload + preview + `alt`) using existing UI components.
- **Schemas** for **About** and **Projects** that cover all fields listed above.
- Canvas renders uploaded images; Inspector edits reflect immediately; no console errors.

---