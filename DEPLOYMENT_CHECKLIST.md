# Deployment Checklist - Supabase Removal

## Pre-Deployment Verification

- [x] Removed Supabase from package.json
- [x] Removed Supabase environment variables from .env
- [x] Updated foreignServicesService.js to use Firebase Firestore
- [x] Added Firestore security rules for foreignServices collection
- [x] Build completed successfully (npm run build)
- [x] No Supabase references in source code
- [x] No Supabase references in build output

## Deployment Steps

### 1. Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

This will deploy the updated security rules that include:
- `foreignServices` collection rules (public read, admin write)
- `saudiRegulations` collection rules (public read, admin write)

### 2. Deploy the Application

For Netlify (current hosting):
```bash
# Build is already completed, just deploy
npm run build
# Netlify will automatically detect and deploy the changes
```

Or manually:
```bash
netlify deploy --prod
```

### 3. Post-Deployment Verification

After deployment, verify:

1. **Foreign Services Page Works**
   - Visit: `/foreign-services`
   - Content should load automatically (default content will be created)
   - Language switching (EN/AR) should work

2. **Admin Panel Works**
   - Login as admin
   - Visit: `/admin/foreign-services`
   - Edit content and save
   - Publish content
   - Verify changes appear on the public page

3. **No Console Errors**
   - Open browser developer console
   - Navigate through the site
   - No Supabase-related errors should appear

4. **Firebase Connection**
   - Verify Firebase is receiving requests
   - Check Firebase Console for new `foreignServices` collection
   - Documents should be created with language codes (en, ar)

## Expected Behavior

### First Visit to Foreign Services Page
- User visits `/foreign-services`
- System checks Firebase for content
- If no content exists, default content is automatically created
- Content is displayed to the user

### Admin Editing
- Admin logs in and visits `/admin/foreign-services`
- System loads existing content or creates default if none exists
- Admin can edit and save changes
- Changes are immediately available after save
- Publish action updates the `is_published` flag

## Rollback Plan (If Needed)

If issues occur, you can rollback by:

1. Revert the changes:
   ```bash
   git revert HEAD
   ```

2. Reinstall Supabase:
   ```bash
   npm install @supabase/supabase-js
   ```

3. Add Supabase credentials back to .env

4. Redeploy

## Notes

- Firebase configuration is hardcoded in `src/lib/firebase.js`
- No environment variables are required for deployment
- Default content is in English and Arabic
- Content is automatically published when created
- All existing features continue to work unchanged
