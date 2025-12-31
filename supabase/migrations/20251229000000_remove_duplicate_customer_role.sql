-- Remove customer role, keep only admin role for users who have both
DELETE FROM public.user_roles
WHERE role = 'customer'
AND user_id IN (
  SELECT user_id
  FROM public.user_roles
  WHERE role = 'admin'
);
