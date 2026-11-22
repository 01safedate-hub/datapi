-- Keep security-definer helpers out of the exposed API schema.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

alter function public.has_permission(text) set schema private;
alter function public.handle_new_user() set schema private;

-- Policies still need to evaluate has_permission; the trigger function is never called directly.
revoke all on function private.handle_new_user() from public, anon, authenticated;
grant execute on function private.has_permission(text) to anon, authenticated;
