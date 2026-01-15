"use client";

import { useState } from "react";
import { importMockDocumentsAction } from "../app/import/actions";

const rows = [
  { legacy: "sharepoint://reg/PI-1001/stability.pdf", portfolio: "Formula 2", status: "Pending" },
  { legacy: "sharepoint://reg/PI-1004/label.docx", portfolio: "Formula 5", status: "Pending" },
  { legacy: "sharepoint://reg/PI-1007/safety.pdf", portfolio: "Formula 8", status: "Pending" }
];

export default function DocumentMigrationMock() {
  const [status, setStatus] = useState<string | null>(null);

  const handleRun = async () => {
    setStatus(null);
    const result = await importMockDocumentsAction();
    if (!result.ok) {
      setStatus(result.error ?? "Mock import failed.");
      return;
    }
    setStatus(`Inserted ${result.imported} documents into storage + DB.`);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleRun}
        style={{
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid #ccc",
          background: "#ffffff"
        }}
      >
        Run mock migration
      </button>
      {status ? <p style={{ color: "#6c645d" }}>{status}</p> : null}
      <table className="table" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>Legacy link</th>
            <th>Portfolio</th>
            <th>New status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.legacy}>
              <td>{row.legacy}</td>
              <td>{row.portfolio}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
