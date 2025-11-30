# Notifications System Setup

This document explains how to set up and run the notifications system for the Ejidike Foundation platform.

## Database Migration

The notifications system requires a new database table. Run the migration using one of these methods:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/migrations/create_notifications_table.sql`
4. Copy the entire content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to project root
cd /Users/ayopaul/Documents/Ejidike/ejidike-foundation/ejidike-foundation

# Run the migration
supabase db push
```

### Option 3: Manual SQL Execution

Connect to your database and run the SQL from `supabase/migrations/create_notifications_table.sql`

## Features Implemented

### 1. **Notification Types**
- ✅ Success - Green checkmark
- ⚠️ Warning - Yellow warning icon
- ❌ Error - Red X icon
- ℹ️ Info - Blue info icon

### 2. **Real-time Notifications**
The Header component subscribes to real-time notifications using Supabase Realtime. When a new notification is created, it:
- Appears instantly in the notifications dropdown
- Shows a toast message
- Updates the unread count badge

### 3. **Notification Management**
- View all notifications in the bell icon dropdown
- Mark individual notifications as read (click on them)
- Mark all notifications as read (button at top)
- Delete individual notifications (X button on hover)
- Click on notification to navigate to related page
- Shows relative time (e.g., "5 minutes ago")

### 4. **Automated Notifications**

#### For Partners:
- ✅ When organization is **verified** by admin
  - Shows success notification with link to dashboard
- ⚠️ When organization is **rejected** by admin
  - Shows warning notification with link to organization page

#### For Admins:
- ℹ️ When a **new partner** submits organization for verification
  - Links to partner detail page for review
- ℹ️ When an **applicant submits** a program application
  - Links to application detail page for review

## API Endpoints

### GET `/api/notifications`
Fetch notifications for current user

Query params:
- `unread_only=true` - Only return unread notifications
- `limit=50` - Limit number of results (default: 50)

### PATCH `/api/notifications`
Mark notification(s) as read

Body:
```json
{
  "notificationId": "uuid" // Mark single notification as read
}
```
OR
```json
{
  "markAllAsRead": true // Mark all notifications as read
}
```

### DELETE `/api/notifications?id=uuid`
Delete a notification

## Helper Functions

Located in `lib/notifications.ts`:

- `createNotification()` - Create a notification for a single user
- `createBulkNotifications()` - Create notifications for multiple users
- `notifyAdmins()` - Create notifications for all admin users
- `markNotificationAsRead()` - Mark notification as read
- `markAllNotificationsAsRead()` - Mark all user's notifications as read
- `deleteNotification()` - Delete a notification

## Usage Example

```typescript
import { createNotification, notifyAdmins } from '@/lib/notifications';

// Notify a specific user
await createNotification({
  userId: 'user-profile-id',
  title: 'Welcome!',
  message: 'Your account has been created successfully.',
  type: 'success',
  link: '/dashboard'
});

// Notify all admins
await notifyAdmins({
  title: 'New Application',
  message: 'John Doe submitted an application.',
  type: 'info',
  link: '/admin/applications/123',
  metadata: {
    applicantId: '456',
    programId: '789'
  }
});
```

## Testing

After running the migration:

1. **Test Partner Verification Notifications:**
   - Log in as a partner
   - Complete organization profile
   - Log in as admin
   - Admin should see notification about new verification request
   - Verify or reject the partner
   - Partner should see notification about the decision

2. **Test Application Notifications:**
   - Log in as an applicant
   - Submit an application for a program
   - Log in as admin
   - Admin should see notification about new application

3. **Test Real-time Updates:**
   - Open two browser windows
   - Log in as admin in both
   - In one window, trigger a notification
   - The other window should show the notification instantly

## Troubleshooting

### Notifications not appearing:
1. Check if the migration ran successfully
2. Verify RLS policies in Supabase dashboard
3. Check browser console for errors
4. Ensure Realtime is enabled in Supabase project settings

### "Profile not found" errors:
- Ensure the user has a profile in the `profiles` table
- Check that `user_id` in notifications table references `profiles.id`, not `auth.users.id`

### Notifications not clickable:
- Verify the `link` field contains a valid route
- Check that the route exists in your Next.js app
