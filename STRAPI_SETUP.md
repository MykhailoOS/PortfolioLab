# 🚀 Strapi Setup Guide for Portfolio Maker Pro

## Quick Setup Without Docker

### Option 1: Use Mock Upload (No Backend Needed) ✅ **RECOMMENDED FOR TESTING**

The app is now configured to work **without any backend** for quick testing! It will automatically use mock uploads with local object URLs.

**Just run:**
```bash
npm run dev
```

Images will work in the current session but won't persist after browser refresh.

---

### Option 2: Use Strapi Cloud (Free Tier)

1. **Sign up for Strapi Cloud**: https://cloud.strapi.io
2. **Create a new project** (free tier available)
3. **Get your API URL and Token**:
   - URL: Shown in your project dashboard
   - Token: Go to Settings → API Tokens → Create new token
   - Token Type: Select "Full access" or "Custom" with Upload permissions
4. **Update `.env` file**:
   ```bash
   VITE_STRAPI_URL=https://your-project.strapiapp.com
   VITE_STRAPI_TOKEN=your_api_token_here
   ```

---

### Option 3: Install Strapi Locally (Optional)

If you want a local Strapi instance:

```bash
# Create a new Strapi project in a separate directory
npx create-strapi-app@latest my-strapi-backend --quickstart

# This will:
# - Install Strapi
# - Start on http://localhost:1337
# - Open admin panel in browser
```

**Configure Strapi:**

1. **Create Admin Account** (first time)
2. **Enable Public Upload**:
   - Go to Settings → Users & Permissions plugin → Roles
   - Click "Public" role
   - Check "upload" permissions under "Upload"
   - Save
3. **Or Create API Token**:
   - Go to Settings → API Tokens
   - Create new token
   - Token type: Full access (or Custom with Upload)
   - Copy the token
4. **Update `.env`**:
   ```bash
   VITE_STRAPI_URL=http://localhost:1337
   VITE_STRAPI_TOKEN=your_api_token_here
   ```

---

## Testing Image Upload

### With Mock (No Backend):
1. Run `npm run dev`
2. Click on About section
3. Upload an image - it works instantly!
4. ⚠️ Images won't persist after refresh

### With Strapi:
1. Make sure Strapi is running
2. Update `.env` with your URL and token
3. Restart the dev server: `npm run dev`
4. Upload images - they persist!

---

## Strapi vs Mock Comparison

| Feature | Mock Upload | Strapi Cloud | Local Strapi |
|---------|-------------|--------------|--------------|
| Setup Time | 0 min ⚡ | 5 min | 10 min |
| Backend Required | ❌ No | ✅ Yes | ✅ Yes |
| Images Persist | ❌ No | ✅ Yes | ✅ Yes |
| Cost | Free | Free tier | Free |
| Best For | Quick testing | Production | Development |

---

## Troubleshooting

### "Upload failed" with Strapi
- Check Strapi is running at the URL in `.env`
- Verify API token has upload permissions
- Check browser console for CORS errors
- Restart dev server after changing `.env`

### CORS Errors
If using local Strapi, update `config/middlewares.js`:
```javascript
module.exports = [
  // ... other middlewares
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000'],
    }
  },
];
```

---

## Current Behavior

**Right now, the app will:**
1. Try to use Strapi if URL and token are configured
2. Fall back to mock upload automatically if:
   - No Strapi URL/token in `.env`
   - Strapi is unreachable
   - Upload fails for any reason

This means you can test the UI **immediately** without any backend setup!

---

## Need Help?

- **Strapi Documentation**: https://docs.strapi.io
- **Strapi Discord**: https://discord.strapi.io
- **Cloud Setup**: https://strapi.io/cloud

---

**Recommendation**: Start with mock upload to test the UI, then add Strapi later if you need persistent storage.
