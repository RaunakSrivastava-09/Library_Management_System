import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedLibrarian } from "@/lib/auth";
import { connection } from "next/server";
export const instant = false;
export default async function DashboardPage() {
      await connection();
  const { user, status } = await getAuthenticatedLibrarian();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const [
    { count: bookCount },
    { count: memberCount },
    { count: activeLoanCount },
    { count: overdueLoanCount },
  ] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase
      .from("loans")
      .select("*", { count: "exact", head: true })
      .is("returned_at", null),
    supabase
      .from("loans")
      .select("*", { count: "exact", head: true })
      .is("returned_at", null)
      .lt("due_at", new Date().toISOString()),
  ]);

  const statistics = [
    { label: "Book Titles", value: bookCount ?? 0, href: "/books" },
    { label: "Members", value: memberCount ?? 0, href: "/members" },
    { label: "Active Loans", value: activeLoanCount ?? 0, href: "/circulation" },
    { label: "Overdue Loans", value: overdueLoanCount ?? 0, href: "/circulation" },
  ];

  return (
    <>
      <Navbar />

      <main className="container" style={{ paddingTop: "32px", paddingBottom: "40px" }}>
        <h1 className="page-title">Dashboard</h1>

        <p style={{ marginBottom: "24px", color: "#64748b" }}>
          Welcome, {user.name}.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {statistics.map((item) => (
            <Link href={item.href} className="card" key={item.label}>
              <p style={{ color: "#64748b", marginBottom: "12px" }}>
                {item.label}
              </p>
              <p style={{ fontSize: "30px", fontWeight: 700 }}>
                {item.value}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}