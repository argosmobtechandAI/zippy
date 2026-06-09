-- Run this SQL in your Supabase Dashboard SQL Editor to add the FCM token column for push notifications
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255);
