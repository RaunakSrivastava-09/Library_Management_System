export async function getNextReservation(supabase, bookId) {
  const { data, error } = await supabase
    .from("reservations")
    .select("id, book_id, member_id, reserved_at")
    .eq("book_id", bookId)
    .eq("status", "waiting")
    .order("reserved_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to retrieve reservation queue");
  }

  return data;
}

export async function markReservationReady(supabase, reservationId) {
  const { data, error } = await supabase
    .from("reservations")
    .update({ status: "ready" })
    .eq("id", reservationId)
    .eq("status", "waiting")
    .select()
    .maybeSingle();

  if (error) {
    throw new Error("Failed to update reservation");
  }

  return data;
}