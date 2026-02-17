-- 1. Create Profiles Table (To store current liquid/balance)
create table if not exists profiles (
  id uuid references auth.users primary key,
  username text,
  total_balance numeric default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Transactions Table
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  amount numeric not null,
  type text check (type in ('income', 'expense')),
  description text,
  category text,
  date timestamp with time zone default timezone('utc'::text, now()),
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable Security (RLS)
alter table profiles enable row level security;
alter table transactions enable row level security;

-- 4. Create Policies
-- Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Transactions
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- 5. FUNCTION & TRIGGER to calculate Liquid (Total Balance) automatically
create or replace function update_total_balance()
returns trigger as $$
begin
  update profiles
  set total_balance = (
    select coalesce(sum(case when type = 'income' then amount else -amount end), 0)
    from transactions
    where user_id = coalesce(new.user_id, old.user_id)
  ),
  updated_at = now()
  where id = coalesce(new.user_id, old.user_id);
  return null;
end;
$$ language plpgsql;

create trigger on_transaction_change
after insert or update or delete on transactions
for each row execute function update_total_balance();

-- 6. Storage Bucket Setup (Receipts)
create policy "Public Access to Receipts" on storage.objects for select using ( bucket_id = 'receipts' );
create policy "Users can upload receipts" on storage.objects for insert with check ( bucket_id = 'receipts' and auth.role() = 'authenticated' );
create policy "Users can update own receipts" on storage.objects for update using ( bucket_id = 'receipts' and auth.uid() = owner );
create policy "Users can delete own receipts" on storage.objects for delete using ( bucket_id = 'receipts' and auth.uid() = owner );
