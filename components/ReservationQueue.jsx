"use client";

export default function ReservationQueue({ reservations, onCancel }) {
  if (!reservations.length) {
    return <p>No reservations found.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Book</th>
            <th>Member</th>
            <th>Reserved At</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td>{reservation.books?.title ?? "Unknown book"}</td>
              <td>{reservation.members?.name ?? "Unknown member"}</td>
              <td>
                {new Date(reservation.reserved_at).toLocaleDateString()}
              </td>
              <td>{reservation.status}</td>
              <td>
                {["waiting", "ready"].includes(reservation.status) && (
                  <button
                    className="btn"
                    type="button"
                    onClick={() => onCancel(reservation.id)}
                    style={{ background: "#dc2626" }}
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}