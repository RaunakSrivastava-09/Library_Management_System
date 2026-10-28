const FINE_PER_DAY = 5;

export function calculateFine(dueAt, returnedAt = new Date()) {
  const dueDate = new Date(dueAt);
  const returnDate = new Date(returnedAt);

  if (
    Number.isNaN(dueDate.getTime()) ||
    Number.isNaN(returnDate.getTime())
  ) {
    throw new Error("Invalid due date or return date");
  }

  const overdueMilliseconds = returnDate.getTime() - dueDate.getTime();

  if (overdueMilliseconds <= 0) {
    return 0;
  }

  const overdueDays = Math.ceil(
    overdueMilliseconds / (1000 * 60 * 60 * 24)
  );

  return overdueDays * FINE_PER_DAY;
}