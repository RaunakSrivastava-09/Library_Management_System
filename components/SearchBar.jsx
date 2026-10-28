"use client";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search by title, author, or ISBN...",
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label="Search"
    />
  );
}