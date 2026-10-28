"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import MemberForm from "@/components/MemberForm";
import ErrorMessage from "@/components/ErrorMessage";
import { createClient } from "@/lib/supabase/client";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setMembers([]);
    } else {
      setMembers(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function addMember(memberData) {
    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("members")
      .insert(memberData);

    if (insertError) {
      throw new Error(insertError.message);
    }

    await fetchMembers();
  }

  async function deleteMember(id) {
    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }

    setError("");

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("members")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await fetchMembers();
  }

  return (
    <>
      <Navbar />

      <main
        className="container"
        style={{ paddingTop: "32px", paddingBottom: "40px" }}
      >
        <h1 className="page-title">Member Management</h1>

        <section className="card" style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            Add New Member
          </h2>

          <MemberForm onSubmit={addMember} />
        </section>

        <section className="card">
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            Members
          </h2>

          <ErrorMessage message={error} />

          {loading ? (
            <p>Loading members...</p>
          ) : members.length === 0 ? (
            <p>No members found.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td>
                        <button
                          className="btn"
                          type="button"
                          onClick={() => deleteMember(member.id)}
                          style={{ background: "#dc2626" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}