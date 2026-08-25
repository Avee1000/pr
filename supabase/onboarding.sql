CREATE TYPE onboarding_status AS ENUM ('in_progress', 'completed', 'dismissed');

CREATE TABLE user_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    status onboarding_status NOT NULL DEFAULT 'in_progress',
    is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,
    wizard_metadata JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_onboarding 
ADD COLUMN completed_tasks TEXT[] NOT NULL DEFAULT '{}';

CREATE POLICY "Users can manage their own onboarding" 
ON public.user_onboarding 
FOR ALL 
USING (auth.uid() = user_id);