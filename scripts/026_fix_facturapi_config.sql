-- Fix Facturapi Config Schema
-- Remove api_key from user table, it should be an environment variable
-- Users only store their SAT certificates

alter table public.facturapi_config drop column if exists api_key;

-- Add RFC and business info if not exists (needed for Facturapi)
alter table public.facturapi_config add column if not exists rfc text;
alter table public.facturapi_config add column if not exists razon_social text;
alter table public.facturapi_config add column if not exists regimen_fiscal text;
alter table public.facturapi_config add column if not exists codigo_postal text;
