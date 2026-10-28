"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <nav
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "16px 0",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <Link href="/dashboard" style={{ fontWeight: 700, fontSize: "18px" }}>
          Library Management
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/books">Books</Link>
          <Link href="/members">Members</Link>
          <Link href="/circulation">Circulation</Link>
          <Link href="/reservations">Reservations</Link>

          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}