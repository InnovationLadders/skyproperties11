# Complaints System Fix Guide

## Problem
Complaints were being submitted successfully but not appearing to admin users in the ManageComplaintsPage.

## Root Causes Identified

1. **Missing Admin Role Check**: The ManageComplaintsPage was accessible to all authenticated users but had no role-based access control in the route configuration.

2. **Missing Firestore Security Rules**: No security rules were defined for the `complaints` collection, likely preventing read access.

3. **Missing Firestore Composite Indexes**: Queries using `orderBy` with `where` clauses require composite indexes in Firestore.

4. **Poor Error Handling**: No visual feedback was shown to users when complaints failed to load.

## Fixes Applied

### 1. Added Admin Role Check in ManageComplaintsPage
**File**: `src/pages/management/ManageComplaintsPage.jsx`

- Added `useAuth` hook to get user profile
- Added `useNavigate` hook for redirects
- Added role check in `useEffect` to redirect non-admin users to dashboard
- Added error state management for better error handling
- Added visual error messages with retry button

### 2. Updated ProtectedRoute in App.jsx
**File**: `src/App.jsx`

- Imported `USER_ROLES` constant
- Updated `/complaints/manage` route to use `allowedRoles={[USER_ROLES.ADMIN]}`
- This provides double protection at both route and page level

### 3. Created Firestore Security Rules
**File**: `firestore.rules`

Created comprehensive security rules for all collections including:
- `complaints` collection with proper read/write access control
- Admin users can read all complaints
- Regular users can only read their own complaints
- Anyone can create complaints (including guests)
- Only admins can update complaints
- Deletion is disabled for data safety

**Key Rules for Complaints**:
```javascript
match /complaints/{complaintId} {
  allow create: if true;
  allow read: if isAdmin() ||
                 (isAuthenticated() && resource.data.userId == request.auth.uid);
  allow update: if isAdmin();
  allow delete: if false;
}
```

### 4. Created Firestore Indexes Configuration
**File**: `firestore.indexes.json`

Defined composite indexes for efficient queries:
- `complaints`: userId + createdAt (DESC)
- `complaints`: status + createdAt (DESC)
- `complaints`: type + createdAt (DESC)
- Similar indexes for tickets, bookings, and permits

### 5. Created Firebase Configuration
**File**: `firebase.json`

Added Firebase configuration for easy deployment using Firebase CLI.

### 6. Improved Error Handling
**Files**:
- `src/pages/management/ManageComplaintsPage.jsx`
- `src/pages/complaints/MyComplaintsPage.jsx`

Changes:
- Added error state management
- Added console logging for debugging
- Added visual error cards with AlertCircle icon
- Added retry button for failed operations
- Improved user feedback with loading states

### 7. Added Missing Translations
**Files**:
- `src/locales/en.json`
- `src/locales/ar.json`

Added:
- `complaint.errors.loadFailed` (English)
- `complaint.errors.loadFailed` (Arabic)

## Deployment Steps Required

### Step 1: Deploy Firestore Security Rules

**Option A: Using Firebase Console (Recommended for Quick Fix)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `skyproperties-cf5c7`
3. Navigate to: Firestore Database → Rules
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click "Publish"

**Option B: Using Firebase CLI**
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

### Step 2: Create Firestore Composite Indexes

**Option A: Automatic Creation (Recommended)**
1. Open the app and navigate to ManageComplaintsPage as admin
2. Open browser console
3. Look for error messages about missing indexes
4. Click the link in the error message to automatically create the index
5. Wait 2-5 minutes for index creation to complete

**Option B: Manual Creation**
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Add each index from `firestore.indexes.json`:
   - Collection: `complaints`
   - Field 1: `userId` (Ascending)
   - Field 2: `createdAt` (Descending)
4. Repeat for other indexes (status, type)

**Option C: Using Firebase CLI**
```bash
firebase deploy --only firestore:indexes
```

### Step 3: Verify the Fix

1. Login as an admin user
2. Navigate to `/complaints/manage`
3. You should see all submitted complaints
4. Try filtering by status and type
5. Check that loading and error states work correctly

## Testing Checklist

- [ ] Admin can access `/complaints/manage` page
- [ ] Non-admin users are redirected to dashboard
- [ ] All complaints are visible to admin
- [ ] Complaints can be filtered by status
- [ ] Complaints can be filtered by type
- [ ] Search functionality works
- [ ] Error messages appear when loading fails
- [ ] Retry button works after errors
- [ ] Users can view only their own complaints in `/my-complaints`
- [ ] New complaints can be submitted
- [ ] Complaint details modal works

## Important Notes

1. **Security Rules Priority**: The Firestore security rules must be deployed first before the app will work properly.

2. **Index Creation Time**: Composite indexes can take 2-5 minutes to build after creation.

3. **Data Safety**: All rules prioritize data safety - no deletion is allowed for complaints.

4. **Admin Access**: Make sure your admin user has `role: 'admin'` set in the Firestore `users` collection.

5. **Console Logging**: Added console logs for debugging. Check browser console for:
   - `Loaded complaints: X` - Shows number of complaints loaded
   - Any Firestore permission errors
   - Index requirement errors with direct links to create them

## Troubleshooting

### Issue: "Missing or insufficient permissions"
**Solution**: Deploy the Firestore security rules as described in Step 1 above.

### Issue: "The query requires an index"
**Solution**: Follow the link in the error message or manually create indexes as described in Step 2.

### Issue: "No complaints showing for admin"
**Checklist**:
1. Verify admin user has `role: 'admin'` in Firestore
2. Check that complaints exist in Firestore
3. Check browser console for errors
4. Verify security rules are deployed
5. Verify indexes are created and active

### Issue: "Page redirects to dashboard even for admin"
**Solution**: Check that:
1. User is properly authenticated
2. User profile is loaded in AuthContext
3. User document in Firestore has `role: 'admin'`

## Additional Improvements Made

1. Added comprehensive security rules for all collections
2. Created index configurations for optimal query performance
3. Improved error handling across complaint pages
4. Added Arabic and English translations for error messages
5. Added visual feedback for loading and error states
6. Implemented retry functionality for failed operations

## Files Modified

- `src/pages/management/ManageComplaintsPage.jsx`
- `src/pages/complaints/MyComplaintsPage.jsx`
- `src/App.jsx`
- `src/locales/en.json`
- `src/locales/ar.json`

## Files Created

- `firestore.rules`
- `firestore.indexes.json`
- `firebase.json`
- `COMPLAINTS_FIX_GUIDE.md`
