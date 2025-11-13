# Strapi Collections Setup Guide

This guide explains how to set up the required Strapi collections for the Portfolio Maker Pro project management system.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Strapi 4.x

## 1. Create New Strapi Project

If you don't have a Strapi instance yet, create one:

```bash
npx create-strapi-app@latest portfolio-backend --quickstart
cd portfolio-backend
```

This will create a new Strapi project and automatically start it on `http://localhost:1337`.

## 2. Create Admin User

On first launch, Strapi will open the admin panel registration page. Create your admin account.

## 3. Create Collections

### Collection 1: Project

**Collection Name:** `project` (API ID: `project`)

**Fields:**

| Field Name       | Type        | Settings                                                         |
| ---------------- | ----------- | ---------------------------------------------------------------- |
| `name`           | Text        | Required, Max length: 255                                        |
| `slug`           | UID         | Required, Attached to: `name`, Unique                            |
| `defaultLocale`  | Enumeration | Required, Values: `en`, `ua`, `pl`, Default: `en`                |
| `enabledLocales` | JSON        | Required, Default: `["en"]`                                      |
| `theme`          | JSON        | Optional, Default: `{"primaryColor": "#7c3aed", "mode": "dark"}` |
| `status`         | Enumeration | Required, Values: `active`, `archived`, Default: `active`        |

**Relations:**

- Has many `pages` (one-to-many)

**Steps to create:**

1. Go to Content-Type Builder in admin panel
2. Click "Create new collection type"
3. Enter Display name: `Project`, API ID (singular): `project`
4. Add each field listed above with the specified types and settings
5. Save the collection

---

### Collection 2: Page

**Collection Name:** `page` (API ID: `page`)

**Fields:**

| Field Name | Type   | Settings                                |
| ---------- | ------ | --------------------------------------- |
| `path`     | Text   | Required, Default: `/`, Max length: 255 |
| `order`    | Number | Required, Integer, Default: 0           |
| `seo`      | JSON   | Optional, Default: `{}`                 |

**Relations:**

- Belongs to `project` (many-to-one)
- Has many `blocks` (one-to-many)

**Steps to create:**

1. Go to Content-Type Builder
2. Click "Create new collection type"
3. Enter Display name: `Page`, API ID (singular): `page`
4. Add each field listed above
5. Add relation to `project`:
   - Relation type: Many-to-One
   - Target collection: Project
   - Field name in Page: `project`
   - Field name in Project: `pages`
6. Save the collection

---

### Collection 3: Block

**Collection Name:** `block` (API ID: `block`)

**Fields:**

| Field Name | Type        | Settings                                                            |
| ---------- | ----------- | ------------------------------------------------------------------- |
| `type`     | Enumeration | Required, Values: `hero`, `about`, `skills`, `projects`, `contact`  |
| `order`    | Number      | Required, Integer, Default: 0                                       |
| `data`     | JSON        | Required, Default: `{}`                                             |
| `style`    | JSON        | Optional, Default: `{}`                                             |
| `effects`  | JSON        | Optional, Default: `{"parallax": 0, "blur": false, "has3d": false}` |

**Relations:**

- Belongs to `page` (many-to-one)

**Steps to create:**

1. Go to Content-Type Builder
2. Click "Create new collection type"
3. Enter Display name: `Block`, API ID (singular): `block`
4. Add each field listed above
5. Add relation to `page`:
   - Relation type: Many-to-One
   - Target collection: Page
   - Field name in Block: `page`
   - Field name in Page: `blocks`
6. Save the collection

---

## 4. Configure Permissions

### For Public Access (Development/Testing)

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles**
2. Click on **Public** role
3. Under **Permissions**, expand each collection type and enable:

**Project:**

- `find` (GET /api/projects)
- `findOne` (GET /api/projects/:id)
- `create` (POST /api/projects)
- `update` (PUT /api/projects/:id)
- `delete` (DELETE /api/projects/:id)

**Page:**

- `find`, `findOne`, `create`, `update`, `delete`

**Block:**

- `find`, `findOne`, `create`, `update`, `delete`

4. Click **Save**

### For Authenticated Access (Production)

For production, you should use authenticated requests:

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles**
2. Click on **Authenticated** role
3. Enable the same permissions as above for **Authenticated** role
4. Disable or limit permissions for **Public** role

---

## 5. Generate API Token

For production use with authenticated requests:

1. Go to **Settings** → **API Tokens**
2. Click **Create new API Token**
3. Configure token:
   - **Name:** `portfolio-editor`
   - **Description:** API token for Portfolio Maker Pro editor
   - **Token duration:** Unlimited (or set expiration)
   - **Token type:** Full access (or Custom with read/write on Project, Page, Block)
4. Click **Save**
5. **Copy the generated token** (you won't see it again!)

---

## 6. Update Environment Variables

Create or update your `.env` file in the Portfolio Maker Pro project:

```env
# Strapi Configuration
VITE_STRAPI_URL=http://localhost:1337
VITE_STRAPI_TOKEN=your_api_token_here
```

Replace `your_api_token_here` with the token you generated in step 5.

For public access (development only), you can leave `VITE_STRAPI_TOKEN` empty if you enabled Public permissions.

---

## 7. Test the Setup

### Create a Test Project via Strapi Admin Panel

1. Go to **Content Manager** → **Project**
2. Click **Create new entry**
3. Fill in:
   - **name:** My Portfolio
   - **slug:** my-portfolio
   - **defaultLocale:** en
   - **enabledLocales:** `["en", "ua"]`
   - **theme:** `{"primaryColor": "#7c3aed", "mode": "dark"}`
   - **status:** active
4. Click **Save** and **Publish**

### Create a Test Page

1. Go to **Content Manager** → **Page**
2. Click **Create new entry**
3. Fill in:
   - **path:** /
   - **order:** 0
   - **project:** Select the project you just created
   - **seo:** `{"title": "Home", "description": "My portfolio homepage"}`
4. Click **Save** and **Publish**

### Create a Test Block

1. Go to **Content Manager** → **Block**
2. Click **Create new entry**
3. Fill in:
   - **type:** hero
   - **order:** 0
   - **page:** Select the page you just created
   - **data:**
     ```json
     {
       "headline": {
         "en": "Hello World",
         "ua": "Привіт світ",
         "pl": "Witaj świecie"
       },
       "subheadline": {
         "en": "Welcome to my portfolio",
         "ua": "Ласкаво просимо",
         "pl": "Witamy"
       },
       "ctaButton": {
         "en": "View Projects",
         "ua": "Переглянути проекти",
         "pl": "Zobacz projekty"
       }
     }
     ```
   - **effects:** `{"parallax": 0, "blur": false, "has3d": false}`
4. Click **Save** and **Publish**

### Test API Access

Open your browser's developer console or use curl to test:

```bash
# Get all projects
curl http://localhost:1337/api/projects

# Get a specific project with pages and blocks
curl "http://localhost:1337/api/projects/1?populate[pages][populate][blocks]=*"
```

If using authentication:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  "http://localhost:1337/api/projects/1?populate[pages][populate][blocks]=*"
```

---

## 8. Optional: Upload Plugin Configuration

The Portfolio Maker Pro also supports image uploads. Strapi's upload plugin is enabled by default.

**To configure upload settings:**

1. Go to **Settings** → **Media Library**
2. Configure:
   - Max file size
   - Allowed file types
   - Responsive image settings

**Permissions for Upload:**

Go to **Settings** → **Users & Permissions Plugin** → **Roles** → **Public** (or **Authenticated**)

- Under **Upload**, enable:
  - `upload` (POST /api/upload)

---

## Data Structure Example

Here's how the data is structured when fetched:

```json
{
  "data": {
    "id": 1,
    "name": "My Portfolio",
    "slug": "my-portfolio",
    "defaultLocale": "en",
    "enabledLocales": ["en", "ua"],
    "theme": {
      "primaryColor": "#7c3aed",
      "mode": "dark"
    },
    "status": "active",
    "createdAt": "2025-11-02T10:00:00.000Z",
    "updatedAt": "2025-11-02T10:00:00.000Z",
    "pages": [
      {
        "id": 1,
        "path": "/",
        "order": 0,
        "seo": {
          "title": "Home",
          "description": "My portfolio homepage"
        },
        "createdAt": "2025-11-02T10:00:00.000Z",
        "updatedAt": "2025-11-02T10:00:00.000Z",
        "blocks": [
          {
            "id": 1,
            "type": "hero",
            "order": 0,
            "data": {
              "headline": { "en": "Hello World", "ua": "Привіт світ" },
              "subheadline": { "en": "Welcome", "ua": "Ласкаво просимо" },
              "ctaButton": {
                "en": "View Projects",
                "ua": "Переглянути проекти"
              }
            },
            "effects": { "parallax": 0, "blur": false, "has3d": false },
            "createdAt": "2025-11-02T10:00:00.000Z",
            "updatedAt": "2025-11-02T10:00:00.000Z"
          }
        ]
      }
    ]
  }
}
```

---

## Troubleshooting

### CORS Errors

If you get CORS errors when accessing from your frontend:

1. Edit `config/middlewares.js` in your Strapi project
2. Update the `strapi::cors` configuration:

```javascript
module.exports = [
  // ... other middlewares
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      origin: ["http://localhost:3000", "http://localhost:5173"], // Add your frontend URLs
      credentials: true,
    },
  },
  // ... other middlewares
];
```

### Database Connection Issues

Strapi uses SQLite by default in quickstart mode. For production, consider using PostgreSQL or MySQL.

To change database configuration, edit `config/database.js` in your Strapi project.

### API Not Returning Relations

Make sure to use the `populate` query parameter:

```
/api/projects/1?populate[pages][populate][blocks]=*
```

This tells Strapi to include nested relations (pages with their blocks).

---

## Production Deployment

### Strapi Backend

You can deploy Strapi to:

- **Strapi Cloud** (official hosting, easiest)
- **Heroku**
- **AWS/DigitalOcean/Railway**
- **Docker containers**

Update your `VITE_STRAPI_URL` to point to your production Strapi URL.

### Frontend

Deploy the Portfolio Maker Pro frontend to:

- **Vercel**
- **Netlify**
- **GitHub Pages**
- Any static hosting service

Make sure to set environment variables in your deployment platform.

---

## Next Steps

1. ✅ Set up Strapi collections as documented
2. ✅ Configure permissions
3. ✅ Generate API token
4. ✅ Update .env file
5. ✅ Test API access
6. 🚀 Start building portfolios in Portfolio Maker Pro!

---

## Support

For Strapi-specific issues, refer to:

- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi Forum](https://forum.strapi.io/)

For Portfolio Maker Pro issues, check the project README.md
