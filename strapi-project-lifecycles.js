/**
 * Project Lifecycle Hooks
 * 
 * This file ensures that:
 * 1. Projects are automatically assigned to the creating user
 * 2. Users can only see and modify their own projects
 * 3. Security is enforced at the database level
 * 
 * Installation:
 * 1. Copy this file to: ~/Downloads/portfolio-backend/src/api/project/content-types/project/lifecycles.js
 * 2. Restart Strapi: Ctrl+C in terminal, then run: npm run develop
 * 3. Test: Users should only see their own projects in the app
 */

module.exports = {
  /**
   * Set owner when creating a new project
   * Automatically assigns the current user as the project owner
   */
  async beforeCreate(event) {
    const { data } = event.params;
    
    // If user is authenticated, set them as owner
    if (event.state.user) {
      data.owner = event.state.user.id;
      console.log(`📝 Creating project for user ${event.state.user.id}`);
    }
  },

  /**
   * Filter projects by owner when listing
   * Users only see their own projects
   */
  async beforeFindMany(event) {
    // Only filter if user is authenticated
    if (event.state.user) {
      // Add owner filter to existing filters
      event.params.filters = {
        ...event.params.filters,
        owner: event.state.user.id,
      };
      console.log(`🔍 Filtering projects for user ${event.state.user.id}`);
    }
  },

  /**
   * Check ownership before updating
   * Prevents users from modifying others' projects
   */
  async beforeUpdate(event) {
    const { where } = event.params;
    const user = event.state.user;

    if (user && where.id) {
      // Fetch the project with owner relation
      const project = await strapi.entityService.findOne(
        'api::project.project',
        where.id,
        { 
          populate: ['owner'],
        }
      );

      // Check if project exists and has an owner
      if (project && project.owner) {
        // Prevent update if user is not the owner
        if (project.owner.id !== user.id) {
          console.error(`❌ User ${user.id} attempted to update project ${where.id} owned by ${project.owner.id}`);
          throw new Error('You can only update your own projects');
        }
      }

      console.log(`✏️ User ${user.id} updating their project ${where.id}`);
    }
  },

  /**
   * Check ownership before deleting
   * Prevents users from deleting others' projects
   */
  async beforeDelete(event) {
    const { where } = event.params;
    const user = event.state.user;

    if (user && where.id) {
      // Fetch the project with owner relation
      const project = await strapi.entityService.findOne(
        'api::project.project',
        where.id,
        { 
          populate: ['owner'],
        }
      );

      // Check if project exists and has an owner
      if (project && project.owner) {
        // Prevent deletion if user is not the owner
        if (project.owner.id !== user.id) {
          console.error(`❌ User ${user.id} attempted to delete project ${where.id} owned by ${project.owner.id}`);
          throw new Error('You can only delete your own projects');
        }
      }

      console.log(`🗑️ User ${user.id} deleting their project ${where.id}`);
    }
  },

  /**
   * Check ownership before finding one
   * Additional security for single project retrieval
   */
  async beforeFindOne(event) {
    const { where } = event.params;
    const user = event.state.user;

    if (user && where.id) {
      // Fetch the project with owner relation
      const project = await strapi.entityService.findOne(
        'api::project.project',
        where.id,
        { 
          populate: ['owner'],
        }
      );

      // Check if project exists and belongs to user
      if (project && project.owner && project.owner.id !== user.id) {
        console.error(`❌ User ${user.id} attempted to access project ${where.id} owned by ${project.owner.id}`);
        throw new Error('You can only access your own projects');
      }

      console.log(`👁️ User ${user.id} viewing their project ${where.id}`);
    }
  },
};
