-- Run this once in the Supabase SQL editor to create the horse_categories table
CREATE TABLE IF NOT EXISTS horse_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE,
    description varchar(500) DEFAULT '',
    created_at varchar(50) DEFAULT now()::text
);

-- Seed with default categories
INSERT INTO horse_categories (name, description) VALUES
    ('Show Jumping', 'Horses trained for competitive show jumping events'),
    ('Beginner Friendly', 'Calm and easy-going horses suitable for new riders'),
    ('Dressage', 'Horses specialised in precision dressage movements'),
    ('Eventing', 'Horses trained for three-phase eventing competition'),
    ('Training Only', 'Horses currently under training, not yet for public sessions'),
    ('Elite Stallion', 'Top-tier performance stallions'),
    ('Western Riding', 'Horses trained in Western riding style'),
    ('Trail Riding', 'Horses suited for long trail and leisure rides')
ON CONFLICT (name) DO NOTHING;
