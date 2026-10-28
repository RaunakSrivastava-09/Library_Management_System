import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedLibrarian } from "@/lib/auth";
import { reservationSchema } from "@/lib/validations";
import { getNextReservation } from "@/lib/reservations";

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
    .from("reservations")
    .select("*, books(title, author), members(name, email)")
    .order("reserved_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const result = reservationSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("id")
    .eq("id", result.data.book_id)
    .maybeSingle();

  if (bookError) {
    return NextResponse.json(
      { error: bookError.message },
      { status: 500 }
    );
  }

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
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
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("reservations")
    .select("id")
    .eq("book_id", result.data.book_id)
    .eq("member_id", result.data.member_id)
    .in("status", ["waiting", "ready"])
    .limit(1);

  if (existingError) {
    return NextResponse.json(
      { error: existingError.message },
      { status: 500 }
    );
  }

  if (existing?.length) {
    return NextResponse.json(
      { error: "This member already has an active reservation for this book" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      ...result.data,
      status: "waiting",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request) {
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

  if (
    typeof body.id !== "string" ||
    !["cancelled", "fulfilled"].includes(body.status)
  ) {
    return NextResponse.json(
      { error: "A valid reservation ID and status are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .update({ status: body.status })
    .eq("id", body.id)
    .in("status", ["waiting", "ready"])
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Active reservation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data });
}