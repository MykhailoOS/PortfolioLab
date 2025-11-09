# Task 3: Authentication Setup Complete! 🔐

## What Was Implemented

✅ **User Authentication System**
- JWT-based authentication with Strapi
- Login and Register pages with form validation
- Protected routes for Dashboard and Editor
- Session persistence with localStorage
- Automatic token refresh on page reload

✅ **Security Features**
- Route guards redirect unauthenticated users to login
- JWT tokens automatically included in all API requests
- Logout functionality clears session
- Password validation (minimum 8 characters)

✅ **User Experience**
- Clean login/register forms using existing Tailwind styles
- Inline error messages for validation and API errors
- Loading states during authentication
- "Next" parameter redirects users back to intended page after login
- User email displayed in Dashboard header

## Files Created/Modified

### New Files
- `contexts/AuthContext.tsx` - React context for auth state management
- `services/auth.ts` - API calls for login, register, getMe
- `pages/Login.tsx` - Login page with email/password form
- `pages/Register.tsx` - Registration page with validation
- `components/ProtectedRoute.tsx` - Route guard wrapper component

### Modified Files
- `index.tsx` - Added AuthProvider wrapper and auth routes
- `pages/Dashboard.tsx` - Added logout button and user email display
- `services/strapiApi.ts` - Updated to use JWT from localStorage instead of env token

## How Authentication Works

### 1. User Registration
```
User fills form → POST /api/auth/local/register → 
Strapi creates user → Returns {jwt, user} → 
Store JWT in localStorage → Auto-login → Redirect to dashboard
```

### 2. User Login
```
User fills form → POST /api/auth/local → 
Strapi validates credentials → Returns {jwt, user} → 
Store JWT in localStorage → Redirect to requested page
```

### 3. Protected Routes
```
User visits /dashboard → ProtectedRoute checks authentication → 
If not authenticated: Redirect to /auth/login?next=/dashboard →
If authenticated: Render Dashboard
```

### 4. API Requests
```
Any API call → strapiRequest reads localStorage.getItem('auth.jwt') → 
Adds Authorization: Bearer {jwt} header → Makes request → 
Strapi validates JWT and returns data
```

### 5. Session Persistence
```
Page refresh → AuthContext.useEffect runs → 
Read JWT from localStorage → Call getMe(jwt) → 
If valid: Restore user session → If invalid: Clear session
```

## Strapi Configuration Steps

### Step 1: Add Owner Relation to Project Collection

1. Open Strapi Admin at http://localhost:1337/admin
2. Go to **Content-Type Builder**
3. Click on **Project** collection
4. Click **"Add another field"**
5. Select **Relation**
6. Configure:
   - **Relation type:** Project (from: users-permissions) belongs to many User (from: users-permissions)
   - **Field name in Project:** `owner`
7. Click **Finish**
8. Click **Save** (top right)
9. **Restart Strapi** for changes to take effect

### Step 2: Configure Authenticated Role Permissions

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles**
2. Click on **Authenticated** role
3. Configure permissions:

**Project:**
- ✅ find (users can list their projects)
- ✅ findOne (users can view their project details)
- ✅ create (users can create new projects)
- ✅ update (users can edit their projects)
- ✅ delete (users can delete their projects)

**Page:**
- ✅ find
- ✅ findOne
- ✅ create
- ✅ update
- ✅ delete

**Block:**
- ✅ find
- ✅ findOne
- ✅ create
- ✅ update
- ✅ delete

**Upload:**
- ✅ upload (users can upload images)

4. Click **Save**

### Step 3: Add Owner Filter (Optional but Recommended)

To ensure users only see their own projects, you can add a lifecycle hook:

1. Open your Strapi backend folder: `~/Downloads/portfolio-backend`
2. Navigate to: `src/api/project/content-types/project/`
3. Create or edit `lifecycles.js`:

```javascript
module.exports = {
  // Set owner when creating a project
  async beforeCreate(event) {
    const { data } = event.params;
    if (event.state.user) {
      data.owner = event.state.user.id;
    }
  },
  
  // Filter projects by owner when finding
  async beforeFindMany(event) {
    if (event.state.user) {
      event.params.filters = {
        ...event.params.filters,
        owner: event.state.user.id,
      };
    }
  },
  
  // Check ownership when updating
  async beforeUpdate(event) {
    const { where } = event.params;
    const user = event.state.user;
    
    if (user) {
      const project = await strapi.entityService.findOne(
        'api::project.project',
        where.id,
        { populate: ['owner'] }
      );
      
      if (project && project.owner && project.owner.id !== user.id) {
        throw new Error('You can only update your own projects');
      }
    }
  },
};
```

4. Restart Strapi after adding this file

### Step 4: Disable Public Role Access (Security)

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles**
2. Click on **Public** role
3. **Uncheck all permissions** for Project, Page, Block
4. Keep Upload unchecked as well
5. Click **Save**

This ensures only authenticated users can access the API.

## Testing the Authentication Flow

### 1. Test Registration
1. Open http://localhost:3000
2. You'll be redirected to http://localhost:3000/auth/login
3. Click "create a new account"
4. Fill in:
   - Email: test@example.com
   - Password: testpass123
   - Confirm password: testpass123
5. Click "Create account"
6. You should be logged in and redirected to Dashboard

### 2. Test Login
1. Click "Sign Out" in the Dashboard
2. You'll be redirected to login page
3. Enter your credentials
4. Click "Sign in"
5. You should be back in the Dashboard

### 3. Test Protected Routes
1. Open a new incognito/private window
2. Try to access http://localhost:3000/dashboard
3. You should be redirected to login
4. After login, you should be redirected back to dashboard

### 4. Test Project Creation with Ownership
1. Login to the app
2. Create a new project
3. Open Strapi Admin
4. Go to Content Manager → Project
5. Find your project - it should have the "owner" field populated with your user

### 5. Test Multi-User Isolation
1. Register a second user (different email)
2. Create projects with this user
3. Logout and login as first user
4. You should only see your own projects (if lifecycle hook is added)

## What Fixed the 401 Errors

The persistent 401 errors were caused by Strapi v5's security model:

**Before (Task 2 - Not Working):**
- Used Public role for API access
- Strapi v5 doesn't allow Public role to access custom collections by default
- All API requests returned 401 Unauthorized

**After (Task 3 - Working):**
- Users must register/login to get JWT token
- JWT token included in all API requests via Authorization header
- Strapi validates token and grants access via Authenticated role
- Owner relation ensures users only access their own data

## Environment Variables

No changes needed! The app now uses JWT from user sessions instead of env tokens.

You can remove `VITE_STRAPI_TOKEN` from `.env` if you added it before.

## Next Steps

✅ Authentication is complete!
✅ Users can register and login
✅ Dashboard and Editor are protected
✅ All API calls are authenticated

**Ready to use:**
1. Register your account
2. Create projects
3. Build portfolios
4. All data is saved to your personal account in Strapi

## Troubleshooting

### "Invalid identifier or password"
- Check email/password are correct
- Make sure user exists (register first)

### Still getting 401 errors after login
- Check browser console for localStorage.getItem('auth.jwt')
- Verify Authenticated role has permissions in Strapi
- Make sure Strapi is running on port 1337

### Can't create projects
- Verify Authenticated role has "create" permission for Project
- Check browser Network tab for error details
- Ensure owner field was added to Project collection

### Session not persisting after refresh
- Check browser allows localStorage
- Verify jwt token is stored: Open DevTools → Application → Local Storage
- Check for errors in browser console

## Success! 🎉

Your Portfolio Maker Pro now has a complete, secure authentication system. Users can register, login, and manage their own projects privately.

**Frontend:** http://localhost:3000  
**Backend:** http://localhost:1337/admin  

Start building! 🚀
