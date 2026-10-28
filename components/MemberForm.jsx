"use client";

import { useState } from "react";
import { memberSchema } from "@/lib/validations";
import ErrorMessage from "./ErrorMessage";

const initialForm = {
  name: "",
  email: "",
};

export default function MemberForm({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const result = memberSchema.safeParse(form);

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      await onSubmit(result.data);
      setForm(initialForm);
    } catch (err) {
      setError(err.message || "Unable to save member.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="member-name">Member Name</label>
        <input
          id="member-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="member-email">Email</label>
        <input
          id="member-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <ErrorMessage message={error} />

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Saving..." : "Add Member"}
      </button>
    </form>
  );
}