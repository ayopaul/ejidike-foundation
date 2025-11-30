-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'::text,
  link text,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_type_check CHECK (type = ANY (ARRAY['info'::text, 'success'::text, 'warning'::text, 'error'::text])),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Only authenticated users can insert notifications (typically via API)
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (user_id = auth.uid() OR user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));
