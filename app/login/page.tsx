"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    window.location.href = "/";
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "48px auto" }}>
      <h2 style={{ marginTop: 0 }}>Sign in</h2>
      <p style={{ color: "#6c645d" }}>
        Sign in with your account.
      </p>
      <form onSubmit={handleSignIn} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          placeholder="email@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={{ padding: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          style={{ padding: 10 }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #2f5d62",
            background: "#2f5d62",
            color: "#fff"
          }}
        >
          Sign in
        </button>
      </form>
      {status ? <p style={{ color: "#b45309" }}>{status}</p> : null}
    </div>
  );
}
