import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  author: z.string().trim().min(1, "Author is required"),
  isbn: z.string().trim().min(1, "ISBN is required"),
  category: z.string().trim().min(1, "Category is required"),
  total_copies: z.coerce
    .number()
    .int()
    .min(0, "Total copies cannot be negative"),
  available_copies: z.coerce
    .number()
    .int()
    .min(0, "Available copies cannot be negative"),
}).refine(
  (book) => book.available_copies <= book.total_copies,
  {
    message: "Available copies cannot exceed total copies",
    path: ["available_copies"],
  }
);

export const memberSchema = z.object({
  name: z.string().trim().min(1, "Member name is required"),
  email: z.string().trim().email("Enter a valid email address"),
});

export const loanSchema = z.object({
  book_id: z.string().uuid("Select a valid book"),
  member_id: z.string().uuid("Select a valid member"),
});

export const reservationSchema = z.object({
  book_id: z.string().uuid("Select a valid book"),
  member_id: z.string().uuid("Select a valid member"),
});