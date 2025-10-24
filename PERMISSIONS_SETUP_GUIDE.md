# Directus Permissions Setup Guide

## Issue
The projects and tasks collections need permissions to be accessible via the API. Directus 11 requires permissions to be set up through policies attached to roles.

## Manual Setup (Recommended)

### Step 1: Access Directus Admin
1. Open browser and go to: http://localhost:8056/admin
2. Login with:
   - Email: `admin@example.com`
   - Password: `dash2admin`

### Step 2: Configure Administrator Role Permissions

1. Click **Settings** (gear icon) in the sidebar
2. Click **Roles & Permissions** → **Policies**
3. Find the **Administrator** policy
4. You should see a list of collections

### Step 3: Add Projects Collection Permissions

1. Scroll down or search for **projects** collection
2. Enable all permissions for projects:
   - ☑ **Create**
   - ☑ **Read**
   - ☑ **Update**
   - ☑ **Delete**
3. For each permission, make sure:
   - **Item Permissions**: No restrictions (empty or `{}`)
   - **Field Permissions**: All fields (`*` or select all)

### Step 4: Add Tasks Collection Permissions

1. Find **tasks** collection
2. Enable all permissions for tasks:
   - ☑ **Create**
   - ☑ **Read**
   - ☑ **Update**
   - ☑ **Delete**
3. For each permission, make sure:
   - **Item Permissions**: No restrictions (empty or `{}`)
   - **Field Permissions**: All fields (`*` or select all)

### Step 5: Save Changes

1. Click **Save** or the checkmark button
2. The permissions should now be active immediately

## Verification

After setting up permissions, refresh the frontend pages:
- http://localhost:3002/projects
- http://localhost:3002/tasks

Both pages should now load without 403 errors.

## Alternative: Public Access (Optional)

If you want to make these collections publicly accessible (not recommended for production):

1. Go to **Settings** → **Roles & Permissions**
2. Click on the **Public** role
3. Follow the same steps above for projects and tasks collections
4. This allows unauthenticated access to the collections

## Troubleshooting

If pages still show 403 errors after setup:
1. Check browser console for error details
2. Verify API is using correct admin credentials in `.env.local`
3. Try logging out and back in to Directus Admin
4. Clear browser cache and reload

## Current Status

✅ Collections created (projects, tasks)
✅ Relations configured
✅ API routes implemented
✅ Frontend pages built
⚠ **Permissions need manual setup** (follow steps above)

