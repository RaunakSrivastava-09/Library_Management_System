"use client";

import { useState } from "react";
import { bookSchema } from "@/lib/validations";
import ErrorMessage from "./ErrorMessage";

const initialForm = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  total_copies: 1,
  available_copies: 1,
};

export default function BookForm({ onSubmit, initialData = null }) {
  const [form, setForm] = useState(
    initialData ? { ...initialData } : initialForm
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "total_copies" || name === "available_copies"
          ? value
          : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const result = bookSchema.safeParse({
      ...form,
      total_copies: Number(form.total_copies),
      available_copies: Number(form.available_copies),
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      await onSubmit(result.data);
      if (!initialData) {
        setForm(initialForm);
      }
    } catch (err) {
      setError(err.message || "Unable to save book.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="author">Author</label>
        <input
          id="author"
          name="author"
          value={form.author}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="isbn">ISBN</label>
        <input
          id="isbn"
          name="isbn"
          value={form.isbn}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <input
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="total_copies">Total Copies</label>
        <input
          id="total_copies"
          name="total_copies"
          type="number"
          min="0"
          value={form.total_copies}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="available_copies">Available Copies</label>
        <input
          id="available_copies"
          name="available_copies"
          type="number"
          min="0"
          value={form.available_copies}
          onChange={handleChange}
          required
        />
      </div>

      <ErrorMessage message={error} />

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Saving..." : initialData ? "Update Book" : "Add Book"}
      </button>
    </form>
  );
}