-- Add certificate_expiry column to facturapi_config table
ALTER TABLE public.facturapi_config 
ADD COLUMN IF NOT EXISTS certificate_expiry date;

COMMENT ON COLUMN public.facturapi_config.certificate_expiry IS 'Expiration date of the SAT certificate';
