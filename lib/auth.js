import { createClient } from "./supabase/server";

export async function getAuthenticatedLibrarian() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      error: "Authentication required",
      status: 401,
    };
  }

  const { data: librarian, error: librarianError } = await supabase
    .from("librarians")
    .select("id, name")
    .eq("id", user.id)
    .maybeSingle();

  if (librarianError || !librarian) {
    return {
      user: null,
      error: "Librarian access required",
      status: 403,
    };
  }

  return {
    user: librarian,
    error: null,
    status: 200,
  };
}