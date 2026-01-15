import RoleGate from "@/components/RoleGate";
import ImportCsvForm from "@/components/ImportCsvForm";
import DocumentMigrationMock from "@/components/DocumentMigrationMock";

export default function ImportPage() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Document migration</h2>
        <p style={{ color: "#6c645d" }}>
          Simulates importing data from spreadsheets/SharePoint. The CSV creates
          new portfolio items and compliance tasks by market.
        </p>
        <RoleGate
          permission="import.run"
          fallback={<span className="tag">Read-only access</span>}
        >
          <ImportCsvForm />
        </RoleGate>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Document import (mock)</h3>
        <p style={{ color: "#6c645d" }}>
          Maps legacy links to storage and creates pending documents in the DB.
        </p>
        <RoleGate permission="import.run">
          <DocumentMigrationMock />
        </RoleGate>
      </div>
    </div>
  );
}
