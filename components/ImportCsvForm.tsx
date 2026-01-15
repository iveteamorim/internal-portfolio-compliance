"use client";

import { useState } from "react";
import { parseCsv } from "@/lib/csv";
import { importCsvAction } from "../app/import/actions";

const REQUIRED_HEADERS = [
  "name",
  "owner",
  "markets",
  "status",
  "task_market",
  "task_requirement"
];

export default function ImportCsvForm() {
  const [payload, setPayload] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const records = parseCsv(text);

    if (!records.length) {
      setStatus("Empty or invalid CSV.");
      setPayload("");
      return;
    }

    const headers = Object.keys(records[0]);
    const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
    if (missing.length) {
      setStatus(`Missing columns: ${missing.join(", ")}`);
      setPayload("");
      return;
    }

    setPayload(JSON.stringify(records));
    setStatus(`File loaded: ${records.length} rows.`);
  };

  const handleSubmit = async () => {
    if (!payload) {
      setStatus("Load a CSV before importing.");
      return;
    }

    const formData = new FormData();
    formData.set("payload", payload);
    const result = await importCsvAction(formData);

    if (!result.ok) {
      setStatus(result.error ?? "Import failed.");
      return;
    }

    setStatus(`Imported ${result.importedItems} items and ${result.importedTasks} tasks.`);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label
          htmlFor="csv-import"
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: "#ffffff",
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          Select file
        </label>
        <input
          id="csv-import"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #2f5d62",
            background: "#2f5d62",
            color: "#fff"
          }}
        >
          Import CSV
        </button>
      </div>
      <div style={{ fontSize: 12, color: "#6c645d" }}>
        Required columns: name, owner, markets (EU|US|CA), status, task_market, task_requirement
      </div>
      {status ? <div style={{ color: "#6c645d" }}>{status}</div> : null}
    </div>
  );
}
