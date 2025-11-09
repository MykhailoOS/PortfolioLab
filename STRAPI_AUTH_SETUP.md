# ⚠️ IMPORTANT: Strapi Configuration Required

## Current Status

✅ Frontend is running with authentication system  
✅ Login and Register pages are ready  
⚠️ **Strapi backend needs configuration to accept authenticated requests**

## What You Need to Do in Strapi

Your Strapi backend is running at: http://localhost:1337/admin

### Required Steps (Takes ~5 minutes)

#### 1. Add Owner Relation to Project Collection

This allows projects to be linked to specific users.

1. Open http://localhost:1337/admin
2. Go to **Content-Type Builder** (left sidebar)
3. Click on **Project** collection
4. Click **"Add another field"** button
5. Select **"Relation"**
6. Configure:
   - Left side: **Project**
   - Relation type: **belongs to many** (select the icon showing many-to-one)
   - Right side: **User (from: users-permissions)**
   - Field name: `owner`
7. Click **"Finish"**
8. Click **"Save"** (top right corner)
9. **Wait for Strapi to restart** (takes ~10 seconds)

#### 2. Configure Authenticated Role Permissions

This allows logged-in users to access the API.

1. Go to **Settings** (left sidebar) → **Users & Permissions Plugin** → **Roles**
2. Click on **"Authenticated"** role
3. Configure permissions by checking these boxes:

**Project section:**
- ✅ find
- ✅ findOne  
- ✅ create
- ✅ update
- ✅ delete

**Page section:**
- ✅ find
- ✅ findOne
- ✅ create
- ✅ update
- ✅ delete

**Block section:**
- ✅ find
- ✅ findOne
- ✅ create
- ✅ update
- ✅ delete

**Upload section:**
- ✅ upload

4. Click **"Save"** (top right)

#### 3. Disable Public Role (Security Best Practice)

This ensures only authenticated users can access your data.

1. Still in **Settings** → **Users & Permissions Plugin** → **Roles**
2. Click on **"Public"** role
3. **Uncheck ALL permissions** for:
   - Project (uncheck all)
   - Page (uncheck all)
   - Block (uncheck all)
   - Upload (uncheck all)
4. Click **"Save"**

## Testing After Configuration

Once you've completed the steps above:

### Test 1: Register a New Account
1. Go to http://localhost:3000
2. You should see the Login page
3. Click "create a new account"
4. Fill in:
   - Email: your@email.com
   - Password: password123 (8+ characters)
   - Confirm password: password123
5. Click "Create account"
6. **Expected:** You should be logged in and see the Dashboard with Projects list

### Test 2: Create a Project
1. In the Dashboard, click **"New Project"**
2. Enter a project name (e.g., "My Portfolio")
3. Click "Create"
4. **Expected:** Project is created and appears in the list

### Test 3: Open Project in Editor
1. Click "Open" on your project
2. **Expected:** Editor opens and you can see the canvas
3. Make a change (add a block, edit text, etc.)
4. **Expected:** Save status shows "Saving..." then "Saved ✓"

### Test 4: Verify Ownership in Strapi
1. Open http://localhost:1337/admin
2. Go to **Content Manager** → **Project**
3. Click on your project
4. **Expected:** You should see the "owner" field populated with your user

## What If It Doesn't Work?

### Still Getting 401 Errors?
- Make sure you clicked "Save" after setting permissions
- Try logging out and logging back in to the app
- Check that the "owner" relation was added (should see it in Project fields)
- Verify Strapi restarted after adding the owner field

### Can't Register?
- Check Strapi is running: http://localhost:1337/admin should load
- Look at browser console (F12) for error messages
- Check Strapi terminal for error logs

### Can't Login?
- Make sure you registered first
- Check email and password are correct (case-sensitive)
- Verify password is at least 8 characters

## Quick Verification Checklist

Before testing the app, verify in Strapi admin:

- [ ] Content-Type Builder → Project → Has "owner" relation field
- [ ] Settings → Roles → Authenticated → Has all permissions checked
- [ ] Settings → Roles → Public → Has NO permissions checked
- [ ] Strapi shows "Server started" in terminal (not restarting)

## Need Help?

If you encounter issues:

1. Check browser console (F12 → Console tab)
2. Check browser network tab (F12 → Network tab)
3. Check Strapi terminal output for errors
4. Verify both servers are running:
   - Frontend: http://localhost:3000 ✅
   - Backend: http://localhost:1337 ✅

## Ready to Go!

Once you've completed the 3 configuration steps in Strapi:

✅ Register your account  
✅ Create projects  
✅ Build portfolios  
✅ Everything autosaves!  

Your Portfolio Maker Pro is ready to use! 🚀

---

**Next:** Open http://localhost:3000 and register your account!
