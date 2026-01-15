"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function DocumentUploader({
  portfolioItemId
}: {
  portfolioItemId: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("v1.0");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setStatus("Select a file.");
      return;
    }

    const safeName = file.name.replace(/\s+/g, "-");
    const path = `portfolio/${portfolioItemId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabaseBrowser.storage
      .from("documents")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setStatus(uploadError.message);
      return;
    }

    const { data } = supabaseBrowser.storage
      .from("documents")
      .getPublicUrl(path);

    const response = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || file.name,
        version,
        portfolioItemId,
        storageUrl: data.publicUrl
      })
    });

    if (!response.ok) {
      const body = await response.json();
      setStatus(body.error ?? "Error al guardar el documento.");
      return;
    }

      setStatus("Document uploaded as pending.");
    setTitle("");
    setVersion("v1.0");
    setFile(null);
    router.refresh();
  };

  return (
    <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 120px" }}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Document title"
          style={{ padding: 10 }}
        />
        <input
          value={version}
          onChange={(event) => setVersion(event.target.value)}
          placeholder="v1.0"
          style={{ padding: 10 }}
        />
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label
          htmlFor="doc-upload"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#ffffff",
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          Select file
        </label>
        <input
          id="doc-upload"
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          style={{ display: "none" }}
        />
        <span style={{ color: "#6c645d", fontSize: 12 }}>
          {file ? file.name : "No file selected"}
        </span>
        <button
          type="button"
          onClick={handleUpload}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #2f5d62",
            background: "#2f5d62",
            color: "#fff"
          }}
        >
          Upload document
        </button>
      </div>
      {status ? <span style={{ color: "#6c645d" }}>{status}</span> : null}
    </div>
  );
}
