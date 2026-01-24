-- Create table for storing AI analysis history
create table if not exists ai_analysis_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamptz default now() not null,
  prompt text not null,
  response jsonb not null,
  tier text not null, -- 'free' or 'pro' at time of generation
  period_start date,
  period_end date,
  tokens_used jsonb
);

-- Enable RLS
alter table ai_analysis_history enable row level security;

-- Policies
create policy "Users can view their own history"
  on ai_analysis_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own history"
  on ai_analysis_history for insert
  with check (auth.uid() = user_id);

-- Add index for performance on frequent queries (rate limiting check)
create index idx_ai_history_user_created 
  on ai_analysis_history (user_id, created_at desc);
