
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedLibrarian } from "@/lib/auth";
import { loanSchema } from "@/lib/validations";

export async function GET() {
  const { user, status } = await getAuthenticatedLibrarian();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("loans")
    .select("*, books(title, author), members(name, email)")
    .order("issued_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request) {
  const { user, status } = await getAuthenticatedLibrarian();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const result = loanSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("id, available_copies")
    .eq("id", result.data.book_id)
    .maybeSingle();

  if (bookError) {
    return NextResponse.json(
      { error: bookError.message },
      { status: 500 }
    );
  }

  if (!book) {
    return NextResponse.json(
      { error: "Book not found" },
      { status: 404 }
    );
  }

  if (book.available_copies < 1) {
    return NextResponse.json(
      { error: "No copies of this book are available" },
      { status: 409 }
    );
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("id", result.data.member_id)
    .maybeSingle();

  if (memberError) {
    return NextResponse.json(
      { error: memberError.message },
      { status: 500 }
    );
  }

  if (!member) {
    return NextResponse.json(
      { error: "Member not found" },
      { status: 404 }
    );
  }

  
  const { data: reservations, error: reservationError } = await supabase
    .from("reservations")
    .select("id, member_id, status, reserved_at")
    .eq("book_id", book.id)
    .in("status", ["waiting", "ready"])
    .order("reserved_at", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1);

  if (reservationError) {
    return NextResponse.json(
      { error: "Could not check book reservations" },
      { status: 500 }
    );
  }

  const nextReservation = reservations?.[0];

  // Do not issue the book to someone behind the first reservation.
  if (
    nextReservation &&
    nextReservation.member_id !== result.data.member_id
  ) {
    return NextResponse.json(
      {
        error:
          "This book is reserved for the first member in the reservation queue.",
      },
      { status: 409 }
    );
  }

  // Create the loan.
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .insert(result.data)
    .select()
    .single();

  if (loanError) {
    return NextResponse.json(
      { error: loanError.message },
      { status: 400 }
    );
  }

 
  const { error: updateError } = await supabase
    .from("books")
    .update({
      available_copies: book.available_copies - 1,
    })
    .eq("id", book.id);

  if (updateError) {
    await supabase
      .from("loans")
      .delete()
      .eq("id", loan.id);

    return NextResponse.json(
      { error: "Could not update book availability" },
      { status: 500 }
    );
  }

 
  if (
    nextReservation &&
    nextReservation.member_id === result.data.member_id
  ) {
    const { error: reservationUpdateError } = await supabase
      .from("reservations")
      .update({ status: "fulfilled" })
      .eq("id", nextReservation.id)
      .eq("status", nextReservation.status);

    if (reservationUpdateError) {
      console.error(
        "Could not update reservation status:",
        reservationUpdateError.message
      );
    }
  }

  return NextResponse.json(
    { data: loan },
    { status: 201 }
  );
}
