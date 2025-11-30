/**
 * FILE PATH: /ejdk/ejidike-foundation/lib/notifications.ts
 * PURPOSE: Helper functions for creating notifications
 */

import { createSupabaseClient } from './supabase';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user
 * Uses server-side API to bypass RLS issues
 */
export async function createNotification(params: CreateNotificationParams) {
  console.log('[Notification] Creating notification for user:', params.userId);

  try {
    const response = await fetch('/api/notifications/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link,
        metadata: params.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create notification');
    }

    const result = await response.json();
    console.log('[Notification] Created successfully:', result.notification);
    return result.notification;
  } catch (error: any) {
    console.error('[Notification] Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  const supabase = createSupabaseClient();

  const notifications = userIds.map(userId => ({
    user_id: userId,
    title: params.title,
    message: params.message,
    type: params.type,
    link: params.link,
    metadata: params.metadata,
    is_read: false
  }));

  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select();

  if (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }

  return data;
}

/**
 * Notify all admins
 */
export async function notifyAdmins(params: Omit<CreateNotificationParams, 'userId'>) {
  const supabase = createSupabaseClient();

  // Get all admin user IDs
  const { data: admins, error: adminError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin');

  if (adminError || !admins || admins.length === 0) {
    console.error('Error fetching admins:', adminError);
    return;
  }

  const adminIds = admins.map(admin => admin.id);
  return createBulkNotifications(adminIds, params);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}
