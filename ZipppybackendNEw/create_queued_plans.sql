CREATE TABLE queued_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID,
  plan_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Queued',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
