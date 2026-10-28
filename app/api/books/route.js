import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedLibrarian } from "@/lib/auth";
import { bookSchema } from "@/lib/validations";

export async function GET(request) {
  const { user, status } = await getAuthenticatedLibrarian();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();

  const supabase = await createClient();

  let query = supabase.from("books").select("*").order("title");

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

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
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = bookSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("books")
    .insert(result.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.code === "23505" ? 409 : 400 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}