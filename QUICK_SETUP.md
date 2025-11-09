# Quick Strapi Setup Checklist

## ✅ Step 1: Installation (In Progress)
Strapi is currently installing in `~/Downloads/portfolio-backend`
⏳ Expected time: 2-3 minutes

---

## 📝 Step 2: Create Admin Account (After Installation)

When installation completes:
1. Browser will auto-open to `http://localhost:1337/admin`
2. Fill in the registration form:
   - **First name:** Your name
   - **Last name:** Your last name  
   - **Email:** your@email.com
   - **Password:** Choose a password (8+ characters)
3. Click **"Let's start"**

---

## 🏗️ Step 3: Create Collections

### A. Create "Project" Collection

1. Go to **Content-Type Builder** (sidebar)
2. Click **"Create new collection type"**
3. **Display name:** `Project`
4. Click **Continue**
5. Add these fields one by one:

**Field 1: name**
- Type: **Text**
- Name: `name`
- Click **Add another field**

**Field 2: slug**
- Type: **UID**
- Name: `slug`
- Attached field: `name`
- Click **Add another field**

**Field 3: defaultLocale**
- Type: **Enumeration**
- Name: `defaultLocale`
- Values: `en`, `ua`, `ru`, `pl` (add one by one)
- Default value: `en`
- Click **Add another field**

**Field 4: enabledLocales**
- Type: **JSON**
- Name: `enabledLocales`
- Click **Add another field**

**Field 5: theme**
- Type: **JSON**
- Name: `theme`
- Click **Add another field**

**Field 6: status**
- Type: **Enumeration**
- Name: `status`
- Values: `active`, `archived`
- Default value: `active`

6. Click **Finish**
7. Click **Save** (top right)

---

### B. Create "Page" Collection

1. Click **"Create new collection type"**
2. **Display name:** `Page`
3. Click **Continue**
4. Add fields:

**Field 1: path**
- Type: **Text**
- Name: `path`
- Default value: `/`

**Field 2: order**
- Type: **Number**
- Name: `order`
- Number format: **integer**
- Default value: `0`

**Field 3: seo**
- Type: **JSON**
- Name: `seo`

5. Click **Finish**
6. Click **Save**

---

### C. Create "Block" Collection

1. Click **"Create new collection type"**
2. **Display name:** `Block`
3. Click **Continue**
4. Add fields:

**Field 1: type**
- Type: **Enumeration**
- Name: `type`
- Values: `hero`, `about`, `skills`, `projects`, `contact`

**Field 2: order**
- Type: **Number**
- Name: `order`
- Number format: **integer**
- Default value: `0`

**Field 3: data**
- Type: **JSON**
- Name: `data`

**Field 4: style**
- Type: **JSON**
- Name: `style`

**Field 5: effects**
- Type: **JSON**
- Name: `effects`

5. Click **Finish**
6. Click **Save**

---

### D. Add Relations

**Page → Project Relation:**
1. Click on **Page** collection in Content-Type Builder
2. Click **"Add another field"**
3. Select **Relation**
4. Configure:
   - Page **belongs to many** Project
   - Relation name in Page: `project`
5. Click **Finish**
6. Click **Save**

**Block → Page Relation:**
1. Click on **Block** collection
2. Click **"Add another field"**
3. Select **Relation**
4. Configure:
   - Block **belongs to many** Page
   - Relation name in Block: `page`
5. Click **Finish**
6. Click **Save**

---

## 🔐 Step 4: Configure Permissions

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles**
2. Click on **Public**
3. Expand **Project** and check all:
   - ✅ find
   - ✅ findOne
   - ✅ create
   - ✅ update
   - ✅ delete
4. Expand **Page** and check all
5. Expand **Block** and check all
6. Expand **Upload** and check:
   - ✅ upload
7. Click **Save**

---

## 🧪 Step 5: Test with Sample Data

1. Go to **Content Manager** → **Project**
2. Click **"Create new entry"**
3. Fill in:
   - **name:** Test Portfolio
   - **slug:** test-portfolio
   - **defaultLocale:** en
   - **enabledLocales:** `["en", "ua"]`
   - **theme:** `{"primaryColor": "#7c3aed", "mode": "dark"}`
   - **status:** active
4. Click **Save** and **Publish**

---

## ✅ Step 6: Verify Everything Works

1. Open your Portfolio Maker Pro at `http://localhost:3000`
2. You should now see the Dashboard without errors!
3. Click **"New Project"** to create your first real project
4. Open a project in the editor
5. Make changes - they'll autosave! ✨

---

## 🎉 You're Done!

Your full stack is now running:
- **Frontend:** http://localhost:3000 (Portfolio Maker Pro)
- **Backend:** http://localhost:1337 (Strapi Admin)

Start building portfolios! 🚀
