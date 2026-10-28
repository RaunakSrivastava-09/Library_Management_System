"use client";

export default function BookTable({ books, onEdit, onDelete }) {
  if (!books.length) {
    return <p>No books found.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>ISBN</th>
            <th>Category</th>
            <th>Total Copies</th>
            <th>Available Copies</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.isbn}</td>
              <td>{book.category}</td>
              <td>{book.total_copies}</td>
              <td>{book.available_copies}</td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => onEdit(book)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => onDelete(book.id)}
                    style={{ background: "#dc2626" }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}