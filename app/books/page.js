"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import BookForm from "@/components/BookForm";
import BookTable from "@/components/BookTable";
import SearchBar from "@/components/SearchBar";
import ErrorMessage from "@/components/ErrorMessage";
import { createClient } from "@/lib/supabase/client";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();

    let query = supabase
      .from("books")
      .select("*")
      .order("title", { ascending: true });

    if (search.trim()) {
      const term = search.trim().replace(/[,%()]/g, "");
      query = query.or(
        `title.ilike.%${term}%,author.ilike.%${term}%,isbn.ilike.%${term}%`
      );
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setBooks([]);
    } else {
      setBooks(data ?? []);
    }

    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  async function saveBook(bookData) {
    const supabase = createClient();

    if (editingBook) {
      const { error: updateError } = await supabase
        .from("books")
        .update(bookData)
        .eq("id", editingBook.id);

      if (updateError) throw new Error(updateError.message);

      setEditingBook(null);
    } else {
      const { error: insertError } = await supabase
        .from("books")
        .insert(bookData);

      if (insertError) throw new Error(insertError.message);
    }

    await fetchBooks();
  }

  async function deleteBook(id) {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    setError("");

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("books")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await fetchBooks();
  }

  return (
    <>
      <Navbar />

      <main
        className="container"
        style={{ paddingTop: "32px", paddingBottom: "40px" }}
      >
        <h1 className="page-title">Book Management</h1>

        <section className="card" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>
            {editingBook ? "Edit Book" : "Add New Book"}
          </h2>

          <BookForm
            key={editingBook?.id ?? "new-book"}
            initialData={editingBook}
            onSubmit={saveBook}
          />

          {editingBook && (
            <button
              className="btn btn-secondary"
              type="button"
              style={{ marginTop: "12px" }}
              onClick={() => setEditingBook(null)}
            >
              Cancel Edit
            </button>
          )}
        </section>

        <section className="card">
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
            Books
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <ErrorMessage message={error} />

          {loading ? (
            <p>Loading books...</p>
          ) : (
            <BookTable
              books={books}
              onEdit={setEditingBook}
              onDelete={deleteBook}
            />
          )}
        </section>
      </main>
    </>
  );
}