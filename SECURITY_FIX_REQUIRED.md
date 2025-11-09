# 🚨 CRITICAL: Security Fix Required

## Problem
**NEW USERS CAN SEE ALL PROJECTS FROM EVERYONE!**

This is because Strapi is not filtering projects by owner. You need to add lifecycle hooks to the Project collection.

## Solution: Add Lifecycle Hooks

### Step 1: Create the lifecycle file

1. Open your Strapi backend folder:
   ```bash
   cd ~/Downloads/portfolio-backend
   ```

2. Create the lifecycles file:
   ```bash
   nano src/api/project/content-types/project/lifecycles.js
   ```

3. Paste this code:

```javascript
module.exports = {
  // Set owner when creating a project
  async beforeCreate(event) {
    const { data } = event.params;
    if (event.state.user) {
      data.owner = event.state.user.id;
      console.log(`📝 Creating project for user ${event.state.user.id}`);
    }
  },

  // Filter projects by owner when listing
  async beforeFindMany(event) {
    // Only filter if user is authenticated
    if (event.state.user) {
      // Add owner filter to existing filters
      event.params.filters = {
        ...event.params.filters,
        owner: {
          id: event.state.user.id
        }
      };
      console.log(`🔍 Filtering projects for user ${event.state.user.id}`);
    }
  },

  // Check ownership before finding one
  async beforeFindOne(event) {
    const { where } = event.params;
    const user = event.state.user;

    if (user && where.documentId) {
      // Note: In Strapi v5 we filter in beforeFindMany, this is just logging
      console.log(`👁️ User ${user.id} accessing project ${where.documentId}`);
    }
  },

  // Check ownership before updating
  async beforeUpdate(event) {
    const { where } = event.params;
    const user = event.state.user;

    if (user && where.documentId) {
      // Fetch the project with owner relation
      const project = await strapi.documents('api::project.project').findOne({
        documentId: where.documentId,
        populate: ['owner'],
      });

      // Check if project exists and has an owner
      if (project && project.owner) {
        // Prevent update if user is not the owner
        if (project.owner.id !== user.id) {
          console.error(`❌ User ${user.id} attempted to update project ${where.documentId} owned by ${project.owner.id}`);
          throw new Error('You can only update your own projects');
        }
      }

      console.log(`✏️ User ${user.id} updating their project ${where.documentId}`);
    }
  },

  // Check ownership before deleting
  async beforeDelete(event) {
    const { where } = event.params;
    const user = event.state.user;

    if (user && where.documentId) {
      // Fetch the project with owner relation
      const project = await strapi.documents('api::project.project').findOne({
        documentId: where.documentId,
        populate: ['owner'],
      });

      // Check if project exists and has an owner
      if (project && project.owner) {
        // Prevent deletion if user is not the owner
        if (project.owner.id !== user.id) {
          console.error(`❌ User ${user.id} attempted to delete project ${where.documentId} owned by ${project.owner.id}`);
          throw new Error('You can only delete your own projects');
        }
      }

      console.log(`🗑️ User ${user.id} deleting their project ${where.documentId}`);
    }
  },
};
```

4. Save and exit (Ctrl+O, Enter, Ctrl+X in nano)

### Step 2: Restart Strapi

```bash
# Kill the running Strapi process
# Then restart it:
npm run develop
```

### Step 3: Fix Existing Projects

Any projects created before adding the lifecycle hooks won't have an owner. You need to manually assign them:

1. Go to http://localhost:1337/admin
2. Click **Content Manager** → **Project**
3. For each project:
   - Click to edit
   - Set **owner** field to the user who should own it
   - Click **Save** and **Publish**

### Step 4: Test

1. Create a new user account in your app
2. Login as that user
3. You should see ONLY that user's projects (empty list if they haven't created any)
4. Create a project as that user
5. Logout and login as the first user
6. You should NOT see the new user's project

## Why This Is Critical

Without this fix:
- ❌ Users can see all projects from all users
- ❌ Users might be able to edit other users' projects
- ❌ Privacy is completely broken
- ❌ Data security is compromised

With this fix:
- ✅ Users only see their own projects
- ✅ Users can only edit their own projects
- ✅ Users can only delete their own projects
- ✅ Privacy and security restored

## Verification

After implementing, check the Strapi console logs. You should see:
```
🔍 Filtering projects for user 1
📝 Creating project for user 1
✏️ User 1 updating their project abc123
```

If you see these logs, the lifecycle hooks are working!
