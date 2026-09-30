
-- Fix permissions and RLS for NextAuth Tables
-- Copy and paste this into your Supabase SQL Editor and click "RUN"

-- Grant usage to authenticator role so the API can access the schema
GRANT USAGE ON SCHEMA next_auth TO authenticator;
GRANT ALL ON SCHEMA next_auth TO postgres;
GRANT ALL ON SCHEMA next_auth TO service_role;

-- Grant access to tables to authenticator role
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO authenticator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA next_auth TO authenticator;

-- IMPORTANT: Grant access to tables to service_role (Used by NextAuth Adapter)
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA next_auth TO service_role;

-- Disable Row Level Security (RLS) on these tables permanently
-- NextAuth handles authorization securely via the backend server, 
-- so we do not need Supabase RLS policies for these specific tables.
ALTER TABLE next_auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.verification_tokens DISABLE ROW LEVEL SECURITY;

-- If RLS was already enabled and enforced, this ensures it bypasses it
-- (although DISABLE ROW LEVEL SECURITY usually covers it)
