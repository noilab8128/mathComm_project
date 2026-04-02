-- 1. Create the user_submissions table
CREATE TABLE IF NOT EXISTS public.user_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES next_auth.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    submitted_answer TEXT NOT NULL,
    grading_result JSONB NOT NULL,
    total_score INTEGER NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions" 
    ON public.user_submissions FOR SELECT 
    USING (auth.uid() = user_id);

-- The API uses a service role key to insert, so it bypasses RLS.
-- However, we can add a policy for authenticated inserts if needed in the future.
CREATE POLICY "Authenticated users can insert their own submissions" 
    ON public.user_submissions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_submissions_user_id ON public.user_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_submissions_problem_id ON public.user_submissions(problem_id);
