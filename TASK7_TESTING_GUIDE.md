# Task 7 Testing Guide

## Quick Test Plan

### 1. Prerequisites

- Open project: https://just-site.win/editor/{your-project-id}
- Ensure you have sections: Hero, About, Skills, Projects, Contact
- Make sure autosave shows green checkmark (saved)

### 2. Test Export Button

**Location**: Top-right corner of editor header

**States to Verify**:

- ✅ Button shows FileArchive icon + "Export .zip" text (desktop)
- ✅ Button shows only icon on mobile
- ✅ Button disabled (gray) during autosave with tooltip
- ✅ Button shows spinner when exporting

### 3. Test Validation Errors

#### Test Case 1: Empty Required Field

1. Remove text from Hero section headline
2. Click Export
3. **Expected**: Error modal shows "Hero section missing headline for locale 'en'"
4. Fix: Add headline back
5. Click Retry Export

#### Test Case 2: Missing Alt Text

1. Upload image in About section
2. Leave "Alt text" field empty
3. Click Export
4. **Expected**: Warning modal shows "About section avatar image missing alt text"
5. Fix: Add alt text
6. Click Retry Export

#### Test Case 3: Unsaved Changes

1. Make any edit
2. Immediately click Export (before autosave completes)
3. **Expected**: Error modal shows "Please wait for autosave to complete"
4. Wait for green checkmark
5. Click Export again

### 4. Test Successful Export

#### Happy Path

1. Ensure all fields filled with valid data
2. Ensure all images have alt text
3. Wait for autosave (green checkmark)
4. Click "Export .zip"
5. **Expected**:
   - Button shows spinner
   - After 2-5 seconds: file downloads
   - Success modal appears with:
     - File size (e.g., "125.3 KB")
     - Page count (number of enabled locales)
     - Asset count (number of images)
     - "What's included" list
     - Hosting tips
6. Click "Done" to close modal

### 5. Test Exported Files

#### Extract and Inspect

```bash
# Extract the downloaded .zip
unzip your-portfolio-name.zip

# Check structure
ls -la
# Should see: assets/, en/, uk/, ru/, pl/, README.txt

# Check assets
ls assets/css/  # style.css
ls assets/js/   # main.js
ls assets/img/  # avatar-0.jpg, project-0.png, etc.

# Check HTML pages
ls en/  # index.html
ls uk/  # index.html (if Ukrainian enabled)
```

#### Open in Browser (Local Server)

```bash
# Start local server
cd your-portfolio-name
python3 -m http.server 8000

# Open in browser
open http://localhost:8000/en/index.html
```

### 6. Test Generated Site

#### Visual Verification

- ✅ Hero section renders with correct text and button
- ✅ About section shows avatar image and bio
- ✅ Skills section shows all skills with progress bars
- ✅ Projects section shows all project cards with images
- ✅ Contact section shows email and social links

#### Interaction Testing

- ✅ Scroll down → sections fade in with animation
- ✅ Skills section → progress bars animate when scrolled into view
- ✅ Project cards → hover effect (lift and glow)
- ✅ External links → open in new tab
- ✅ Social icons → correct platforms

#### Responsive Testing

```bash
# Open DevTools (F12)
# Toggle device toolbar (Ctrl+Shift+M)
# Test: Mobile (375px), Tablet (768px), Desktop (1200px)
```

- ✅ Mobile: 1 column layout
- ✅ Tablet: 2 column layout for projects
- ✅ Desktop: 3 column layout for projects

#### Performance Testing

```bash
# Open DevTools → Lighthouse
# Run audit for Performance, Accessibility, Best Practices, SEO
```

**Expected Scores**:

- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### 7. Test Multi-Locale

#### If Multiple Locales Enabled

1. Check each locale folder has `index.html`
2. Open `uk/index.html` → Content in Ukrainian
3. Open `ru/index.html` → Content in Russian
4. Open `pl/index.html` → Content in Polish
5. Verify all sections show translated content

### 8. Test Reduced Motion

#### Browser Setting

```bash
# macOS: System Preferences → Accessibility → Display → Reduce motion
# Windows: Settings → Ease of Access → Display → Show animations
# Linux: Varies by desktop environment
```

**After Enabling**:

1. Reload exported site
2. ✅ No scroll animations
3. ✅ No parallax effects
4. ✅ Skill bars appear instantly at full width
5. ✅ No hover animations

### 9. Test README

#### Open README.txt

```bash
cat README.txt
```

**Verify Contents**:

- ✅ Project name and generation date
- ✅ Folder structure explanation
- ✅ Hosting instructions (Netlify, Vercel, GitHub Pages)
- ✅ Local testing commands
- ✅ Features list
- ✅ Language list with paths
- ✅ Browser support
- ✅ Performance metrics

### 10. Test Hosting (Optional)

#### Netlify Drop

1. Go to https://app.netlify.com/drop
2. Drag the extracted folder
3. Wait for deploy
4. Open provided URL
5. ✅ Site works identically to local

#### GitHub Pages (Advanced)

```bash
# Create new repo
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main

# Enable Pages: Settings → Pages → Source: main → Save
# Wait 1-2 minutes, then visit: username.github.io/repo-name/en/
```

---

## Expected Issues & Solutions

### Issue: Export button disabled

**Cause**: Autosave in progress  
**Solution**: Wait 1-2 seconds for green checkmark

### Issue: "Missing alt text" error

**Cause**: Image uploaded without accessibility description  
**Solution**: Edit section → Add alt text → Save → Retry export

### Issue: "Unreachable media" error

**Cause**: Image URL is broken or file deleted  
**Solution**: Re-upload image or fix URL

### Issue: Downloaded ZIP won't extract

**Cause**: Download interrupted or browser blocked it  
**Solution**: Check browser downloads, retry export

### Issue: Images not showing in exported site

**Cause**: Supabase Storage bucket not configured  
**Solution**: Run SQL setup script for portfolio-images bucket

### Issue: Skill bars not animating

**Cause**: Browser doesn't support IntersectionObserver  
**Solution**: Use modern browser (Chrome 90+, Firefox 88+)

---

## Success Criteria

✅ Export completes in < 10 seconds  
✅ Downloaded file size: 50-500 KB depending on images  
✅ All sections render correctly  
✅ All images display with correct paths  
✅ Animations work smoothly  
✅ Responsive design works on all devices  
✅ External links open in new tabs  
✅ Multi-locale pages have correct content  
✅ README has complete instructions  
✅ No console errors  
✅ Lighthouse score > 90 for all categories

---

## Report Issues

If any test fails:

1. Check browser console for errors (F12)
2. Verify all prerequisites are met
3. Try export again after fixing issues
4. If problem persists, check TASK7_COMPLETE.md for troubleshooting

---

**Testing Time**: ~15 minutes for full test suite  
**Critical Tests**: 1-6 (validation, export, basic rendering)  
**Optional Tests**: 7-10 (advanced features, hosting)
