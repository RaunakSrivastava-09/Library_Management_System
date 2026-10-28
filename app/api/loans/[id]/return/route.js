import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedLibrarian } from "@/lib/auth";
import { calculateFine } from "@/lib/fines";
import { getNextReservation, markReservationReady } from "@/lib/reservations";

export async function POST(request, { params }) {
  const { user, status } = await getAuthenticatedLibrarian();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status }
    );
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("*")
    .eq("id", id)
    .is("returned_at", null)
    .maybeSingle();

  if (loanError) {
    return NextResponse.json(
      { error: loanError.message },
      { status: 500 }
    );
  }

  if (!loan) {
    return NextResponse.json(
      { error: "Active loan not found" },
      { status: 404 }
    );
  }

  const returnedAt = new Date();
  const fineAmount = calculateFine(loan.due_at, returnedAt);

  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("id, available_copies, total_copies")
    .eq("id", loan.book_id)
    .single();

  if (bookError) {
    return NextResponse.json(
      { error: bookError.message },
      { status: 500 }
    );
  }

  const nextReservation = await getNextReservation(supabase, loan.book_id).catch(
    () => null
  );

  const { data: updatedLoan, error: returnError } = await supabase
    .from("loans")
    .update({
      returned_at: returnedAt.toISOString(),
      fine_amount: fineAmount,
    })
    .eq("id", id)
    .is("returned_at", null)
    .select()
    .maybeSingle();

  if (returnError || !updatedLoan) {
    return NextResponse.json(
      { error: returnError?.message || "Unable to return this loan" },
      { status: 400 }
    );
  }

  if (nextReservation) {
    const readyReservation = await markReservationReady(
      supabase,
      nextReservation.id
    ).catch(() => null);

    if (!readyReservation) {
      return NextResponse.json(
        { error: "Loan returned, but reservation status could not be updated" },
        { status: 500 }
      );
    }
  } else {
    const { error: bookUpdateError } = await supabase
      .from("books")
      .update({
        available_copies: Math.min(
          book.available_copies + 1,
          book.total_copies
        ),
      })
      .eq("id", book.id);

    if (bookUpdateError) {
      return NextResponse.json(
        { error: "Loan returned, but book availability could not be updated" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    data: updatedLoan,
    fine: fineAmount,
    reservationReady: Boolean(nextReservation),
  });
}