-- Add unique constraint to category name
-- This ensures no duplicate category names can be created

ALTER TABLE public.categories
ADD CONSTRAINT categories_name_unique UNIQUE (name);
