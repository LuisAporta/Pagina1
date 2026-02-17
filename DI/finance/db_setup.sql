-- 1. Create Transactions Table
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

-- 2. Enable Security (RLS)
alter table transactions enable row level security;

-- 3. Create Policies
-- View own data
create policy "Users can view own transactions" on transactions
  for select using (auth.uid() = user_id);

-- Insert own data
create policy "Users can insert own transactions" on transactions
  for insert with check (auth.uid() = user_id);

-- Update own data
create policy "Users can update own transactions" on transactions
  for update using (auth.uid() = user_id);

-- Delete own data
create policy "Users can delete own transactions" on transactions
  for delete using (auth.uid() = user_id);

-- 4. Storage Bucket Setup (Receipts)
-- Note: You should create the bucket named 'receipts' in the Supabase UI first.
-- These policies allow public read and authenticated upload.
create policy "Public Access to Receipts"
  on storage.objects for select
  using ( bucket_id = 'receipts' );

create policy "Users can upload receipts"
  on storage.objects for insert
  with check ( bucket_id = 'receipts' and auth.role() = 'authenticated' );

create policy "Users can update own receipts"
  on storage.objects for update
  using ( bucket_id = 'receipts' and auth.uid() = owner );

create policy "Users can delete own receipts"
  on storage.objects for delete
  using ( bucket_id = 'receipts' and auth.uid() = owner );
