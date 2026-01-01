-- Remove resend_api_key column from settings table as it's now stored in environment variables
ALTER TABLE public.settings
DROP COLUMN IF EXISTS resend_api_key;
