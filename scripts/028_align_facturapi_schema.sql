-- Align facturapi_config table columns with application code
DO $$ 
BEGIN
    -- Rename certificate_file_url to certificate_file_path
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facturapi_config' AND column_name = 'certificate_file_url') THEN
        ALTER TABLE public.facturapi_config RENAME COLUMN certificate_file_url TO certificate_file_path;
    END IF;

    -- Rename key_file_url to key_file_path
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facturapi_config' AND column_name = 'key_file_url') THEN
        ALTER TABLE public.facturapi_config RENAME COLUMN key_file_url TO key_file_path;
    END IF;

    -- Rename certificate_password_encrypted to certificate_password
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facturapi_config' AND column_name = 'certificate_password_encrypted') THEN
        ALTER TABLE public.facturapi_config RENAME COLUMN certificate_password_encrypted TO certificate_password;
    END IF;
END $$;
