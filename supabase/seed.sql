insert into public.books (
  title,
  author,
  isbn,
  category,
  total_copies,
  available_copies
)
values
  (
    'The Great Gatsby',
    'F. Scott Fitzgerald',
    '9780743273565',
    'Fiction',
    3,
    3
  ),
  (
    'To Kill a Mockingbird',
    'Harper Lee',
    '9780061120084',
    'Fiction',
    2,
    2
  ),
  (
    'Clean Code',
    'Robert C. Martin',
    '9780132350884',
    'Programming',
    2,
    2
  ),
  (
    'Introduction to Algorithms',
    'Thomas H. Cormen',
    '9780262046305',
    'Computer Science',
    2,
    2
  ),
  (
    'Atomic Habits',
    'James Clear',
    '9780735211292',
    'Self-Help',
    2,
    2
  )
on conflict (isbn) do nothing;

insert into public.members (name, email)
values
  ('Aarav Sharma', 'aarav@example.com'),
  ('Priya Verma', 'priya@example.com'),
  ('Rahul Singh', 'rahul@example.com')
on conflict (email) do nothing;