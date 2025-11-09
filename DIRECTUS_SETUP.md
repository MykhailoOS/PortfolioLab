# 🚀 Directus Setup Guide for Portfolio Maker Pro

This guide will walk you through setting up a Directus instance for image uploads in the Portfolio Maker Pro application.

## Table of Contents
- [Overview](#overview)
- [Quick Start with Docker](#quick-start-with-docker)
- [Directus Configuration](#directus-configuration)
- [Frontend Environment Setup](#frontend-environment-setup)
- [Testing the Integration](#testing-the-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Task 1** integrates Directus for **file storage only**. The application uses Directus to:
- Upload images from the Inspector interface
- Store image files with metadata
- Serve images via the Directus Assets API
- Support image uploads for:
  - **About section**: Avatar image with alt text
  - **Projects section**: Project thumbnails with alt text

**Important**: This setup uses a **static access token** for demo purposes. In production, implement proper authentication.

---

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Ports 8055 (Directus) and 3000 (Frontend) available

### 1. Create Docker Compose File

Create a `docker-compose.yml` file in your project root (or separate directory):

```yaml
version: '3'

services:
  directus:
    image: directus/directus:latest
    ports:
      - 8055:8055
    volumes:
      - ./directus/database:/directus/database
      - ./directus/uploads:/directus/uploads
      - ./directus/extensions:/directus/extensions
    environment:
      KEY: 'replace-with-random-string-min-32-chars'
      SECRET: 'replace-with-another-random-string-min-32-chars'
      
      ADMIN_EMAIL: 'admin@example.com'
      ADMIN_PASSWORD: 'admin123'
      
      DB_CLIENT: 'sqlite3'
      DB_FILENAME: '/directus/database/data.db'
      
      WEBSOCKETS_ENABLED: 'true'
      
      # CORS settings for development
      CORS_ENABLED: 'true'
      CORS_ORIGIN: 'http://localhost:3000'
      
      # File upload settings
      MAX_PAYLOAD_SIZE: '5mb'
      
    restart: unless-stopped
```

**Note**: Generate secure random strings for `KEY` and `SECRET`:
```bash
# On macOS/Linux:
openssl rand -base64 32

# Or use:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Start Directus

```bash
docker-compose up -d
```

Wait 30-60 seconds for Directus to initialize, then access the admin panel at:
- **URL**: http://localhost:8055
- **Email**: admin@example.com
- **Password**: admin123

---

## Directus Configuration

### Step 1: Create a Custom Role

1. Go to **Settings** → **Roles & Permissions**
2. Click **Create Role**
3. Name it: `portfolio-demo-uploader`
4. Enable: **App Access** (optional, for testing)
5. **Save**

### Step 2: Configure File Permissions

1. In the **Roles & Permissions** page, click on `portfolio-demo-uploader`
2. Find the **directus_files** collection
3. Set the following permissions:

   | Permission | Setting |
   |------------|---------|
   | **Create** | ✅ All Access |
   | **Read** | ✅ All Access |
   | **Update** | ✅ Mine Only |
   | **Delete** | ❌ No Access |

4. **Save Changes**

### Step 3: Generate Static Access Token

1. Go to **Settings** → **Access Tokens**
2. Click **Create Access Token**
3. Configure:
   - **Name**: `Portfolio Demo Token`
   - **Role**: `portfolio-demo-uploader`
   - **Expiration**: Never (or set custom expiration)
4. **Save** and **copy the token** (you won't see it again!)

Example token format: `abcd1234-5678-90ef-ghij-klmnopqrstuv`

### Step 4: Configure CORS for Production

⚠️ **Important for production deployment**:

1. Go to **Settings** → **Project Settings** → **Security**
2. Update CORS settings:
   - **Development**: `http://localhost:3000`
   - **Production**: `https://your-domain.com`
   - **Never use**: `*` (wildcard) in production

Or update via environment variables:
```yaml
CORS_ENABLED: 'true'
CORS_ORIGIN: 'https://your-domain.com,https://www.your-domain.com'
```

### Step 5: Verify File Upload Settings

1. Go to **Settings** → **Project Settings** → **Files**
2. Verify settings:
   - **Max File Size**: 5 MB (5242880 bytes)
   - **Allowed File Types**: Leave empty for default (or specify: `image/png,image/jpeg,image/webp,image/avif`)

---

## Frontend Environment Setup

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Edit `.env` File

```bash
# Directus Configuration
VITE_DIRECTUS_URL=http://localhost:8055
VITE_DIRECTUS_TOKEN=your_copied_token_here
```

**Replace** `your_copied_token_here` with the token from Step 3 above.

### 3. Install Dependencies and Run

```bash
npm install
npm run dev
```

The application should start at http://localhost:3000

---

## Testing the Integration

### Test 1: Upload Avatar in About Section

1. Select the **About** section from the canvas
2. In the Inspector panel, find **Avatar Image**
3. Click the upload area
4. Select an image (PNG, JPEG, WEBP, or AVIF, max 5 MB)
5. Wait for upload to complete
6. Enter alt text for accessibility
7. Verify the image appears on the canvas

### Test 2: Upload Project Thumbnails

1. Select the **Projects** section
2. Click on a project card
3. Find **Project Image** in the Inspector
4. Upload an image
5. Add alt text
6. Verify the thumbnail appears on the canvas

### Test 3: Validate File Restrictions

1. Try uploading a file larger than 5 MB
   - **Expected**: Error message about file size
2. Try uploading an SVG or unsupported format
   - **Expected**: Error message about file type

### Test 4: Persistence Check

1. Upload an image
2. Refresh the browser page
3. **Expected**: Image should still be visible (URL is permanent)

### Test 5: Schema-Driven Fields

1. Add a new field to `AboutBlockSchema` in `schemas/blockSchemas.ts`:
   ```typescript
   {
     name: 'subtitle',
     label: 'Subtitle',
     type: 'localized-text',
     placeholder: 'Enter subtitle',
   }
   ```
2. Refresh the app
3. **Expected**: New subtitle field appears in Inspector automatically

---

## Troubleshooting

### Problem: "Upload failed: 401 Unauthorized"

**Solution**:
- Verify the token in `.env` is correct
- Check token hasn't expired
- Ensure the role has Create permissions for Files

### Problem: "CORS error in browser console"

**Solution**:
- Check `CORS_ORIGIN` in Docker Compose includes `http://localhost:3000`
- Restart Directus after CORS changes: `docker-compose restart`
- Clear browser cache

### Problem: "File size exceeds limit"

**Solution**:
- Check file is under 5 MB
- Increase `MAX_PAYLOAD_SIZE` in Docker Compose if needed:
  ```yaml
  MAX_PAYLOAD_SIZE: '10mb'
  ```
- Restart Directus

### Problem: "Cannot find module 'react'" or TypeScript errors

**Solution**:
```bash
npm install
# or
npm ci
```

### Problem: Images not loading on canvas

**Solution**:
- Check browser Network tab for 404 errors
- Verify `VITE_DIRECTUS_URL` is correct
- Check Directus is running: `docker-compose ps`
- Test asset URL directly: `http://localhost:8055/assets/[file-id]`

### Problem: Directus not starting

**Solution**:
```bash
# Check logs
docker-compose logs directus

# Common fixes:
# 1. Ports in use - change 8055 to another port
# 2. Database corruption - remove ./directus/database and restart
# 3. Permissions - ensure Docker has access to volumes
```

---

## Production Deployment

### Checklist for Production

- [ ] Use a managed Directus instance or proper database (PostgreSQL recommended)
- [ ] Set strong `KEY` and `SECRET` values
- [ ] Implement proper authentication (not static tokens)
- [ ] Configure CORS to specific domains (no wildcards)
- [ ] Enable HTTPS for Directus instance
- [ ] Set up CDN for asset delivery (optional)
- [ ] Configure file storage to S3/CloudFlare R2/etc. (optional)
- [ ] Enable rate limiting on Directus
- [ ] Set up backups for database and files
- [ ] Implement file scanning for malware (if accepting user uploads)

### Environment Variables for Production

```bash
VITE_DIRECTUS_URL=https://directus.your-domain.com
VITE_DIRECTUS_TOKEN=production_token_here
```

---

## API Reference

### Upload File

**Endpoint**: `POST /files`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body**:
```
file: <binary data>
```

**Response**:
```json
{
  "data": {
    "id": "abc-123-def-456",
    "filename_download": "image.jpg",
    "filesize": 123456,
    "type": "image/jpeg",
    "width": 1920,
    "height": 1080
  }
}
```

### Get Asset

**Endpoint**: `GET /assets/:id`

**Query Parameters**:
- `width`: Resize width
- `height`: Resize height  
- `fit`: `cover`, `contain`, `inside`, `outside`
- `quality`: 1-100 (JPEG/WEBP quality)

**Example**:
```
http://localhost:8055/assets/abc-123?width=800&height=600&fit=cover
```

---

## Additional Resources

- [Directus Documentation](https://docs.directus.io/)
- [Directus Files API](https://docs.directus.io/reference/files.html)
- [Directus Docker Guide](https://docs.directus.io/self-hosted/docker-guide.html)
- [Directus Access Tokens](https://docs.directus.io/reference/authentication.html#access-tokens)

---

## Support

For issues specific to this integration, check:
1. Browser console for errors
2. Directus logs: `docker-compose logs directus`
3. Network tab for failed requests

For Directus-specific issues, consult the [Directus Discord](https://discord.gg/directus) community.
