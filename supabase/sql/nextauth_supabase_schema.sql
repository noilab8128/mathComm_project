
-- NextAuth Supabase Adapter Schema
-- Copy and paste this into your Supabase SQL Editor and click "RUN"

-- Create a schema for next-auth (Optional, but recommended to keep it separate from public)
create schema if not exists next_auth;
grant usage on schema next_auth to service_role;
grant all on schema next_auth to postgres;

-- Create users table
create table if not exists next_auth.users (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text unique,
  "emailVerified" timestamp with time zone,
  image text
);

-- Create accounts table for OAuth providers
create table if not exists next_auth.accounts (
  id uuid default gen_random_uuid() primary key,
  "userId" uuid not null references next_auth.users(id) on delete cascade,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  unique(provider, "providerAccountId")
);

-- Create sessions table
create table if not exists next_auth.sessions (
  id uuid default gen_random_uuid() primary key,
  expires timestamp with time zone not null,
  "sessionToken" text not null unique,
  "userId" uuid not null references next_auth.users(id) on delete cascade
);

-- Create verification tokens for email magic links
create table if not exists next_auth.verification_tokens (
  identifier text,
  token text,
  expires timestamp with time zone not null,
  unique(identifier, token)
);
