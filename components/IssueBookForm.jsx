"use client";

import { useState } from "react";
import { loanSchema } from "@/lib/validations";
import ErrorMessage from "./ErrorMessage";

export default function IssueBookForm({ books, members, onSubmit }) {
  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const result = loanSchema.safeParse({
      book_id: bookId,
      member_id: memberId,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    const selectedBook = books.find((book) => book.id === bookId);

    if (!selectedBook || selectedBook.available_copies < 1) {
      setError("This book is currently unavailable.");
      return;
    }

    setLoading(true);

    try {
      await onSubmit(result.data);
      setBookId("");
      setMemberId("");
    } catch (err) {
      setError(err.message || "Unable to issue book.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="book_id">Book</label>
        <select
          id="book_id"
          value={bookId}
          onChange={(event) => setBookId(event.target.value)}
          required
        >
          <option value="">Select a book</option>
          {books.map((book) => (
            <option
              key={book.id}
              value={book.id}
              disabled={book.available_copies < 1}
            >
              {book.title} — {book.available_copies} available
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="member_id">Member</label>
        <select
          id="member_id"
          value={memberId}
          onChange={(event) => setMemberId(event.target.value)}
          required
        >
          <option value="">Select a member</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} ({member.email})
            </option>
          ))}
        </select>
      </div>

      <ErrorMessage message={error} />

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Issuing..." : "Issue Book"}
      </button>
    </form>
  );
}