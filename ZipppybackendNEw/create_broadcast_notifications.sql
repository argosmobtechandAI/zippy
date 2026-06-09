-- Run this SQL in your Supabase Dashboard SQL Editor to create the broadcast_notifications table
CREATE TABLE IF NOT EXISTS public.broadcast_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    "desc" VARCHAR(2000) NOT NULL,
    target_type VARCHAR(50),
    image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access for anon/authenticated roles (or customize based on requirements)
CREATE POLICY "Allow public read and write access" ON public.broadcast_notifications
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
