-- 1. Create a function to handle new user headers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, cric_id, date_of_birth, is_verified)
  values (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'scout', -- Default role
    'SC-' || substring(new.id::text, 1, 8),
    '2000-01-01', -- Default DOB
    false
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger (if it doesn't exist)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Backfill profiles for existing users who are missing one
insert into public.profiles (id, full_name, role, cric_id, date_of_birth, is_verified)
select 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 
    'scout', 
    'SC-' || substring(id::text, 1, 8), 
    '2000-01-01', 
    false
from auth.users
where id not in (select id from public.profiles);
