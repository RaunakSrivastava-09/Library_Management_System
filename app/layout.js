import "./globals.css";

export const metadata = {
  title: "Library Management System",
  description: "Manage books, members, loans, and reservations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}