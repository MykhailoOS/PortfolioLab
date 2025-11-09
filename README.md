<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Portfolio Maker Pro - 3D Portfolio Constructor

A modern, feature-rich portfolio builder with **Strapi backend integration** for persistent storage, project management dashboard, and multilingual support.

**✨ New in Task 2**: Full Dashboard with project CRUD, autosave system, and Strapi backend integration!  
**✨ New in Task 1**: Image upload, dynamic schema-driven fields, and enhanced About/Projects sections.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**

### 1. Clone and Install

```bash
git clone <repository-url>
cd copy-of-portfolio-maker-pro
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Strapi URL and token (optional for development):

```env
VITE_STRAPI_URL=http://localhost:1337
VITE_STRAPI_TOKEN=your_api_token_here
```

### 3. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**✨ The app works immediately!** You'll see the Dashboard where you can manage projects.

### 4. Set Up Strapi Backend (Required for Persistence)

To save and load projects, you need to set up Strapi:

**Option A: Use Strapi Cloud (Easiest)**
1. Sign up at https://cloud.strapi.io (free tier available)
2. Create a new project
3. Follow **[STRAPI_COLLECTIONS.md](./STRAPI_COLLECTIONS.md)** to set up collections
4. Get your API token from Settings → API Tokens
5. Update `.env`:
   ```env
   VITE_STRAPI_URL=https://your-project.strapiapp.com
   VITE_STRAPI_TOKEN=your_api_token_here
   ```

**Option B: Install Strapi Locally (No Docker Required!)**
```bash
# In a separate directory
npx create-strapi-app@latest portfolio-backend --quickstart
cd portfolio-backend
npm run develop
```

Then follow **[STRAPI_COLLECTIONS.md](./STRAPI_COLLECTIONS.md)** for detailed setup instructions.

---

## 📚 Documentation

### Setup Guides
- **[STRAPI_COLLECTIONS.md](./STRAPI_COLLECTIONS.md)** - Complete Strapi backend setup guide
- **[STRAPI_SETUP.md](./STRAPI_SETUP.md)** - Legacy Strapi/Directus image upload guide

### Implementation Details
- **[TASK2_COMPLETE.md](./TASK2_COMPLETE.md)** - Task 2 implementation (Dashboard & Project Management)
- **[TASK1_IMPLEMENTATION.md](./TASK1_IMPLEMENTATION.md)** - Task 1 implementation (Image Upload)

### Task Requirements
- **[task2.md](./task2.md)** - Task 2 original requirements
- **[task1.md](./task1.md)** - Task 1 original requirements

---

## 🎯 Features

### Task 2 - Dashboard & Project Management ✅ NEW!

- **Dashboard**: Professional project management interface
- **Create Projects**: Name, locales, theme configuration
- **Project List**: Grid view with status, updated date, locales
- **CRUD Operations**: Open, Rename, Archive, Delete projects
- **Routing**: Deep linking support (`/editor/:projectId`)
- **Autosave**: Debounced (1s) automatic saving with status indicator
- **Backend Integration**: Full Strapi REST API integration
- **Project Loading**: Load projects from Strapi with loading/error states
- **Block Persistence**: Sections automatically synced to backend
- **Type Safety**: Full TypeScript support for all API operations

### Task 1 - Image Upload Integration ✅

- **Image Uploads**: Upload images with mock storage (or Strapi backend)
- **About Section**: Avatar image with alt text, tags, layout selector
- **Projects Section**: Project thumbnails with alt text, tags
- **Schema-Driven Inspector**: Add fields by editing schemas - no UI code needed
- **Validation**: Client-side file size (5 MB) and type validation
- **Accessibility**: Required alt text for all images
- **Real-time Updates**: Canvas updates instantly when fields change

### Core Features

- **Multilingual Support**: English, Ukrainian, Russian, Polish (4 locales)
- **Device Preview**: Desktop, tablet, mobile views
- **Drag & Drop**: Reorder sections on canvas
- **3D Effects**: Optional Three.js integration for Hero section
- **Section Types**: Hero, About, Skills, Projects, Contact
- **Live Preview**: See changes instantly
- **Responsive Design**: Mobile-first with adaptive UI
- **Persistent Storage**: All data saved to Strapi backend

---

## 🏗️ Project Structure

```
copy-of-portfolio-maker-pro/
├── pages/                      # NEW (Task 2)
│   ├── Dashboard.tsx           # Dashboard layout
│   └── ProjectsList.tsx        # Projects list page
├── components/
│   ├── Canvas.tsx              # Canvas wrapper
│   ├── CanvasContent.tsx       # Section renderers
│   ├── Inspector.tsx           # Schema-driven Inspector
│   ├── Library.tsx             # Section library
│   ├── TopBar.tsx              # Navigation bar (+ save status)
│   ├── canvas/
│   │   └── ThreeScene.tsx      # 3D scene
│   ├── fields/                 # Task 1
│   │   ├── ImageUpload.tsx     # Image upload component
│   │   ├── ChipsInput.tsx      # Tags/chips input
│   │   └── SchemaField.tsx     # Dynamic field renderer
│   └── modals/                 # NEW (Task 2)
│       ├── CreateProjectModal.tsx
│       └── RenameProjectModal.tsx
├── services/
│   ├── strapiApi.ts            # NEW (Task 2) - Full API client
│   └── directus.ts             # Task 1 - Image upload service
├── hooks/                      # NEW (Task 2)
│   └── useAutosave.ts          # Autosave hook
├── schemas/
│   └── blockSchemas.ts         # Field schema definitions
├── types.ts                    # TypeScript types (+ Strapi types)
├── constants.tsx               # Initial data
├── index.tsx                   # Entry point (+ routing)
├── App.tsx                     # Main editor (+ project loading)
├── .env                        # Environment variables
├── .env.example                # Environment template
├── STRAPI_COLLECTIONS.md       # Strapi setup guide
├── TASK2_COMPLETE.md           # Task 2 summary
└── TASK1_IMPLEMENTATION.md     # Task 1 summary
```

---

## 🎨 Usage

### Upload Images

1. Select a section (About or Projects) from the canvas
2. In the Inspector, click the image upload area
3. Select an image (PNG, JPEG, WEBP, AVIF - max 5 MB)
4. Add alt text for accessibility
5. See the image appear instantly on the canvas

### Add Schema Fields

Adding a new field is easy - edit the schema, and it appears automatically!

Example: Add a subtitle to About section:

1. Edit `schemas/blockSchemas.ts`:
```typescript
{
  name: 'subtitle',
  label: 'Subtitle',
  type: 'localized-text',
  placeholder: 'Enter subtitle',
}
```

2. Update `types.ts`:
```typescript
export type AboutSectionData = {
  // ... existing
  subtitle?: LocalizedString;
};
```

3. **Done!** Field appears in Inspector automatically.

### Supported Field Types

- `localized-text` / `localized-textarea` - Multilingual text
- `text` / `textarea` - Plain text
- `number` - Numeric input
- `select` - Dropdown
- `switch` - Toggle
- `chips` - Tags/keywords
- `image` - Image upload with preview

---

## 🔒 Security

⚠️ **Current setup uses a static token for demo purposes.**

For production:
- Implement proper authentication
- Use server-side token validation
- Configure CORS to specific domains
- Enable HTTPS
- See `DIRECTUS_SETUP.md` → Production Deployment

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Adding New Sections

1. Define section type in `types.ts`
2. Add section data type
3. Create section component in `CanvasContent.tsx`
4. Add to section library in `Library.tsx`
5. (Optional) Add schema in `blockSchemas.ts` for dynamic fields

---

## 📋 Manual Testing

See **[TASK1_IMPLEMENTATION.md](./TASK1_IMPLEMENTATION.md)** for complete test checklist.

Quick tests:
- ✅ Upload avatar in About section
- ✅ Upload project thumbnails
- ✅ Try uploading >5 MB file (should error)
- ✅ Reload page (images persist)
- ✅ Add tags to About/Projects
- ✅ Reorder project cards

---

## 🐛 Troubleshooting

### "Upload failed: 401 Unauthorized"
- Check `.env` has correct Directus token
- Verify token permissions in Directus

### "CORS error"
- Check `docker-compose.yml` has `CORS_ORIGIN: 'http://localhost:3000'`
- Restart Directus: `docker-compose restart`

### Images not loading
- Verify Directus is running: `docker-compose ps`
- Check Network tab for 404 errors
- Test URL: `http://localhost:8055/assets/[file-id]`

See **[DIRECTUS_SETUP.md](./DIRECTUS_SETUP.md)** → Troubleshooting for more.

---

## 📦 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling (via utility classes)
- **Three.js** - 3D graphics
- **Directus** - Headless CMS for file storage
- **Lucide React** - Icons
- **Docker** - Directus deployment

---

## 🎉 What's Next?

Tasks 1 and 2 are complete! Future enhancements may include:

### Short-term:
- Section deletion with Strapi sync
- Multi-page support in editor
- Project duplication
- Search/filter in dashboard
- Bulk operations

### Medium-term:
- Version conflict detection
- Real-time collaboration (WebSockets)
- Project templates
- Export formats (Markdown, PDF)
- Analytics dashboard

### Long-term:
- Team collaboration
- Custom domains for published portfolios
- A/B testing
- SEO optimization tools
- Performance monitoring

---

## 📄 License

MIT

---

## 🏆 Implementation Status

**Task 2**: Dashboard & Project Management ✅ **COMPLETE**  
**Task 1**: Image Upload Integration ✅ **COMPLETE**  
**Date**: November 2, 2025

---

For detailed implementation information, see:
- [TASK2_COMPLETE.md](./TASK2_COMPLETE.md) - Dashboard implementation
- [TASK1_IMPLEMENTATION.md](./TASK1_IMPLEMENTATION.md) - Image upload implementation
