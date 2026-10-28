create table public.librarians (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  isbn text not null unique,
  category text not null,
  total_copies integer not null default 1 check (total_copies >= 0),
  available_copies integer not null default 1
    check (available_copies >= 0 and available_copies <= total_copies),
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id),
  member_id uuid not null references public.members(id),
  issued_at timestamptz not null default now(),
  due_at timestamptz not null default (now() + interval '14 days'),
  returned_at timestamptz,
  fine_amount numeric(10, 2) not null default 0 check (fine_amount >= 0),
  created_at timestamptz not null default now(),
  check (due_at > issued_at)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id),
  member_id uuid not null references public.members(id),
  reserved_at timestamptz not null default now(),
  status text not null default 'waiting'
    check (status in ('waiting', 'ready', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now()
);

create index idx_books_title on public.books(title);
create index idx_books_author on public.books(author);
create index idx_books_isbn on public.books(isbn);
create index idx_loans_member_id on public.loans(member_id);
create index idx_loans_book_id on public.loans(book_id);
create index idx_reservations_queue
  on public.reservations(book_id, reserved_at)
  where status = 'waiting';

alter table public.librarians enable row level security;
alter table public.books enable row level security;
alter table public.members enable row level security;
alter table public.loans enable row level security;
alter table public.reservations enable row level security;

create policy "Authenticated librarians can manage librarian profiles"
on public.librarians
for all
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Authenticated users can read books"
on public.books
for select
to authenticated
using (true);

create policy "Authenticated users can manage books"
on public.books
for all
to authenticated
using (
  exists (
    select 1 from public.librarians
    where librarians.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.librarians
    where librarians.id = auth.uid()
  )
);

create policy "Authenticated librarians can manage members"
on public.members
for all
to authenticated
using (
  exists (
    select 1 from public.librarians
    where librarians.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.librarians
    where librarians.id = auth.uid()
  )
);

create policy "Authenticated librarians can manage loans"
on public.loans
for all
to authenticated
using (
  exists (
    select 1 from public.librarians
    where librarians.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.librarians
    where librarians.id = auth.uid()
  )
);

create policy "Authenticated librarians can manage reservations"
on public.reservations
for all
to authenticated
using (
  exists (
    select 1 from public.librarians
    where librarians.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.librarians
    where librarians.id = auth.uid()
  )
);