"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ReservationQueue from "@/components/ReservationQueue";
import ErrorMessage from "@/components/ErrorMessage";
import { createClient } from "@/lib/supabase/client";
import { reservationSchema } from "@/lib/validations";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();

    const [
      { data: reservationData, error: reservationError },
      { data: bookData, error: bookError },
      { data: memberData, error: memberError },
    ] = await Promise.all([
      supabase
        .from("reservations")
        .select("*, books(title), members(name, email)")
        .order("reserved_at", { ascending: true }),
      supabase.from("books").select("id, title, available_copies").order("title"),
      supabase.from("members").select("id, name, email").order("name"),
    ]);

    const fetchError = reservationError || bookError || memberError;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setReservations(reservationData ?? []);
      setBooks(bookData ?? []);
      setMembers(memberData ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function addReservation(event) {
    event.preventDefault();
    setError("");

    const result = reservationSchema.safeParse({
      book_id: bookId,
      member_id: memberId,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    const existingReservation = reservations.some(
      (reservation) =>
        reservation.book_id === bookId &&
        reservation.member_id === memberId &&
        ["waiting", "ready"].includes(reservation.status)
    );

    if (existingReservation) {
      setError("This member already has an active reservation for this book.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const { error: insertError } = await supabase
        .from("reservations")
        .insert({
          book_id: bookId,
          member_id: memberId,
          status: "waiting",
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setBookId("");
      setMemberId("");
      await fetchData();
    } catch (err) {
      setError(err.message || "Unable to create reservation.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelReservation(id) {
    if (!window.confirm("Cancel this reservation?")) {
      return;
    }

    setError("");

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id)
      .in("status", ["waiting", "ready"]);

    if (updateError) {
      setError(updateError.message);
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
        <h1 className="page-title">Book Reservations</h1>

        <section className="card" style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            Reserve a Book
          </h2>

          <form onSubmit={addReservation}>
            <div className="form-group">
              <label htmlFor="reservation-book">Book</label>
              <select
                id="reservation-book"
                value={bookId}
                onChange={(event) => setBookId(event.target.value)}
                required
              >
                <option value="">Select a book</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} ({book.available_copies} available)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reservation-member">Member</label>
              <select
                id="reservation-member"
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

            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Reserving..." : "Reserve Book"}
            </button>
          </form>
        </section>

        <section className="card">
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            Reservation Queue
          </h2>

          {loading ? (
            <p>Loading reservations...</p>
          ) : (
            <ReservationQueue
              reservations={reservations}
              onCancel={cancelReservation}
            />
          )}
        </section>
      </main>
    </>
  );
}