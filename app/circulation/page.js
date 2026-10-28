
"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import IssueBookForm from "@/components/IssueBookForm";
import ErrorMessage from "@/components/ErrorMessage";
import { createClient } from "@/lib/supabase/client";
import { calculateFine } from "@/lib/fines";

export default function CirculationPage() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();

    const [
      { data: bookData, error: bookError },
      { data: memberData, error: memberError },
      { data: loanData, error: loanError },
    ] = await Promise.all([
      supabase.from("books").select("*").order("title"),
      supabase.from("members").select("*").order("name"),
      supabase
        .from("loans")
        .select("*, books(title, author), members(name, email)")
        .order("issued_at", { ascending: false }),
    ]);

    const fetchError = bookError || memberError || loanError;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setBooks(bookData ?? []);
      setMembers(memberData ?? []);
      setLoans(loanData ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function issueBook({ book_id, member_id }) {
    setError("");

    // Send the issue request through the API route.
    // The API route checks the reservation queue.
    const response = await fetch("/api/loans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book_id,
        member_id,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Could not issue the book."
      );
    }

    await fetchData();
  }

  async function returnBook(loan) {
    if (!window.confirm("Confirm that this book has been returned?")) {
      return;
    }

    setError("");

    const supabase = createClient();
    const returnedAt = new Date();
    const fine = calculateFine(loan.due_at, returnedAt);

    const { data: updatedLoan, error: returnError } = await supabase
      .from("loans")
      .update({
        returned_at: returnedAt.toISOString(),
        fine_amount: fine,
      })
      .eq("id", loan.id)
      .is("returned_at", null)
      .select("id")
      .maybeSingle();

    if (returnError) {
      setError(returnError.message);
      return;
    }

    if (!updatedLoan) {
      setError("This loan has already been returned.");
      await fetchData();
      return;
    }

    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("available_copies, total_copies")
      .eq("id", loan.book_id)
      .single();

    if (bookError) {
      setError(bookError.message);
      await fetchData();
      return;
    }

    const { error: updateError } = await supabase
      .from("books")
      .update({
        available_copies: Math.min(
          book.available_copies + 1,
          book.total_copies
        ),
      })
      .eq("id", loan.book_id);

    if (updateError) {
      setError(updateError.message);
      await fetchData();
      return;
    }

    await fetchData();
  }

  return (
    <>
      <Navbar />

      <main
        className="container"
        style={{ paddingTop: "32px", paddingBottom: "40px" }}
      >
        <h1 className="page-title">Book Circulation</h1>

        <section className="card" style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            Issue a Book
          </h2>

          <IssueBookForm
            books={books}
            members={members}
            onSubmit={issueBook}
          />
        </section>

        <section className="card">
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            Loan Records
          </h2>

          <ErrorMessage message={error} />

          {loading ? (
            <p>Loading loan records...</p>
          ) : loans.length === 0 ? (
            <p>No loan records found.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Member</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Return Status</th>
                    <th>Fine</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loans.map((loan) => {
                    const overdue =
                      !loan.returned_at &&
                      new Date(loan.due_at) < new Date();

                    const fine = loan.returned_at
                      ? Number(loan.fine_amount)
                      : calculateFine(loan.due_at);

                    return (
                      <tr key={loan.id}>
                        <td>{loan.books?.title ?? "Unknown book"}</td>
                        <td>{loan.members?.name ?? "Unknown member"}</td>
                        <td>
                          {new Date(
                            loan.issued_at
                          ).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(
                            loan.due_at
                          ).toLocaleDateString()}
                        </td>
                        <td>
                          {loan.returned_at
                            ? "Returned"
                            : overdue
                              ? "Overdue"
                              : "Issued"}
                        </td>
                        <td>₹{fine}</td>
                        <td>
                          {!loan.returned_at && (
                            <button
                              className="btn"
                              type="button"
                              onClick={() => returnBook(loan)}
                            >
                              Return Book
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
