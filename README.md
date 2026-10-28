# Library Management System

A web-based Library Management System built with Next.js and Supabase to help librarians manage books, members, book circulation, and reservations.

## Technologies Used

- Next.js (App Router)
- JavaScript
- Supabase (PostgreSQL database and authentication)
- Zod (server-side input validation)
- Vitest (automated testing)

## Features

- Librarian authentication
- Book management with title, author, ISBN, category, and copy counts
- Member management
- Book issue and return management
- Automatic 14-day loan period
- Overdue fine calculation at ₹5 per day
- Book reservations with a first-come, first-served queue
- Book search by title, author, or ISBN
- Responsive interface
- Automated tests for fine calculations and input validation

## Prerequisites

Install the following:

- Node.js (LTS version)
- npm
- A Supabase account
- Git (optional)

## Installation

1. Clone or download the project.
2. Open the project folder in your terminal.
3. Install dependencies:

   ```bash
   npm install
   npm install @supabase/supabase-js @supabase/ssr zod
   npm install -D vitest
   ```

4. Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

5. Create a Supabase project and copy its Project URL and publishable key into `.env.local`.

6. Open the Supabase SQL Editor and execute `supabase/schema.sql`.

7. Execute `supabase/seed.sql` to insert the sample books and members.

8. Create a librarian user through Supabase Authentication. Insert a matching profile into the `public.librarians` table using that user's authentication ID and a name.

## Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Tests

Execute the automated tests:

```bash
npm test
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |

Never expose a Supabase secret or service-role key in client-side code.

## Project Structure

```text
app/          Next.js pages and API routes
components/   Reusable UI components
lib/          Supabase clients, validation, authentication, and utilities
supabase/     Database schema and sample data
tests/        Automated tests
```

## Notes

- Only authorized librarians should access management operations.
- Sample data is intended for development and demonstration.
- Configure the Supabase database policies and authentication before using the application.
