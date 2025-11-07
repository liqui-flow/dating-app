# Account Deletion Implementation

## Overview
This document describes the comprehensive account deletion system implemented for the LoveSathi dating/matrimony app.

## Features
When a user clicks the "Delete" button in the confirmation dialog, the system:

1. ✅ Deletes all user files from storage buckets
2. ✅ Deletes the user from Supabase Auth
3. ✅ Automatically cascade-deletes all related database records
4. ✅ Signs out the user
5. ✅ Redirects to the login page

## Implementation Files

### 1. API Route: `/app/api/auth/delete-account/route.ts`
This is the main deletion endpoint that handles:
- File deletion from storage buckets
- User deletion from auth.users (which cascades to all related tables)

### 2. Settings Component: `/components/settings/app-settings.tsx`
Updated to:
- Call the delete account API
- Show loading state during deletion
- Display toast notifications for success/error
- Handle user sign-out and redirect

## Database Tables Affected

All the following tables have `ON DELETE CASCADE` constraints, so they are automatically cleaned up when the user is deleted from `auth.users`:

### Core Profile Tables
- `user_profiles` - Basic user info (DOB, gender, path)
- `id_verifications` - ID verification documents
- `verification_progress` - Verification step tracking

### Dating Profile Tables
- `dating_profiles` - Dating profile basic info
- `profile_photos` - Dating profile photos
- `dating_preferences` - Dating preferences
- `profile_interests` - User interests
- `profile_prompts` - Profile prompt answers
- `this_or_that_choices` - This or That selections
- `relationship_goals` - Relationship goals

### Matrimony Profile Tables
- `matrimony_profiles` - Main matrimony profile
- `matrimony_photos` - Matrimony photos
- `matrimony_personal_details` - Physical attributes
- `matrimony_career_education` - Career and education info
- `matrimony_family_info` - Family information
- `matrimony_cultural_details` - Cultural and religious details
- `matrimony_bio` - Personal bio
- `matrimony_partner_preferences` - Partner preferences
- `matrimony_preference_details` - Detailed preference arrays

## Storage Buckets Cleaned Up

The following storage buckets are checked and cleaned:
- `verification-documents` - ID documents
- `face-scans` - Face scan photos
- `profile-photos` - Dating profile photos
- `matrimony-photos` - Matrimony profile photos
- `profile-videos` - Profile videos

## Environment Variables Required

Ensure the following environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for admin operations
```

## How It Works

### Step 1: User Initiates Deletion
1. User navigates to Settings → Delete Account
2. User clicks "Delete Account"
3. Confirmation dialog appears
4. User clicks "Delete" button in dialog

### Step 2: Frontend Processing
1. Component gets the current user's ID
2. Makes POST request to `/api/auth/delete-account`
3. Shows loading state ("Deleting...")
4. Disables Cancel and Delete buttons during processing

### Step 3: Backend Processing
1. API validates the user ID
2. Creates admin client with service role key
3. Iterates through all storage buckets
4. Lists and deletes all user files
5. Deletes user from `auth.users`
6. Database cascade-deletes all related records

### Step 4: Completion
1. User is signed out
2. Success toast is displayed
3. User is redirected to login page after 1.5 seconds

## Error Handling

The system handles errors gracefully:

- **Missing User ID**: Returns 400 error
- **Storage Bucket Errors**: Logs warning and continues with other buckets
- **User Deletion Errors**: Returns 500 error with message
- **Network Errors**: Shows toast with error message

## Security Considerations

1. **Service Role Key**: Used only on the backend for admin operations
2. **User Verification**: Checks that the user is authenticated before deletion
3. **Bucket Isolation**: Only deletes files in the user's own folder
4. **RLS Policies**: Row Level Security ensures users can only delete their own data

## Testing

To test the deletion feature:

1. Create a test account
2. Upload some profile photos
3. Complete profile setup
4. Go to Settings → Delete Account
5. Confirm deletion
6. Verify:
   - Files are deleted from storage
   - User cannot log in
   - All related data is gone

## Database Schema

All tables use this pattern:
```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- other columns
);
```

The `ON DELETE CASCADE` ensures that when a user is deleted from `auth.users`, all their related records are automatically deleted.

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Account and all associated data have been permanently deleted"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Troubleshooting

### Issue: Service Role Key Error
**Solution**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in your environment variables.

### Issue: Storage Bucket Not Found
**Solution**: Verify that all buckets listed in the API route exist in your Supabase project.

### Issue: RLS Policy Prevents Deletion
**Solution**: The API uses service role key which bypasses RLS policies.

### Issue: User Still Exists After Deletion
**Solution**: Check the API logs for errors. The user deletion might have failed.

## Future Enhancements

Potential improvements:
- [ ] Add email confirmation before deletion
- [ ] Implement "grace period" where account can be recovered
- [ ] Send confirmation email after deletion
- [ ] Export user data before deletion (GDPR compliance)
- [ ] Anonymize data instead of hard delete (for analytics)
- [ ] Add deletion reason tracking
- [ ] Implement soft delete with scheduled hard delete

## Support

If you encounter any issues with account deletion, check:
1. Browser console for frontend errors
2. API route logs for backend errors
3. Supabase dashboard for database errors
4. Storage bucket contents for file deletion verification

