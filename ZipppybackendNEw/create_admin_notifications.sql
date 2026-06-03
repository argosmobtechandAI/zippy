-- Run this SQL in your Supabase Dashboard SQL Editor to create the admin_notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    "desc" VARCHAR(1000) NOT NULL,
    type VARCHAR(50) NOT NULL,
    unread BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access for anon/authenticated roles (or customize based on requirements)
CREATE POLICY "Allow public read and write access" ON public.admin_notifications
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
