import Link from "next/link";
import RoleGate from "@/components/RoleGate";
import StatusPill from "@/components/StatusPill";
import DocumentUploader from "@/components/DocumentUploader";
import {
  fetchAuditEvents,
  fetchDocumentsByPortfolio,
  fetchPortfolioItem,
  fetchTasksByPortfolio
} from "@/lib/data";
import { approveDocumentAction } from "./actions";

const statusTone = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "blocked":
      return "danger";
    case "draft":
      return "warning";
    default:
      return "default";
  }
};

const labelPortfolioStatus = (status: string) => {
  switch (status) {
    case "active":
      return "Active";
    case "blocked":
      return "Blocked";
    case "draft":
      return "Draft";
    case "archived":
      return "Archived";
    default:
      return status;
  }
};

const labelDocStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "obsolete":
      return "Obsolete";
    default:
      return status;
  }
};

const labelTaskStatus = (status: string) => {
  switch (status) {
    case "open":
      return "Open";
    case "done":
      return "Done";
    case "blocked":
      return "Blocked";
    default:
      return status;
  }
};

export default async function PortfolioDetailPage({ params }: { params: { id: string } }) {
  const item = await fetchPortfolioItem(params.id);

  if (!item) {
    return (
      <div className="card">
        <h2>Item not found</h2>
        <Link href="/portfolio">Back to portfolio</Link>
      </div>
    );
  }

  const [itemDocs, itemTasks, auditEvents] = await Promise.all([
    fetchDocumentsByPortfolio(item.id),
    fetchTasksByPortfolio(item.id),
    fetchAuditEvents()
  ]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="card" style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div className="tag">{item.id}</div>
          <h2 style={{ marginBottom: 8 }}>{item.name}</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <StatusPill label={labelPortfolioStatus(item.status)} tone={statusTone(item.status)} />
            <span style={{ color: "#6c645d" }}>Owner: {item.owner}</span>
            <span style={{ color: "#6c645d" }}>Markets: {item.markets.join(", ")}</span>
          </div>
        </div>
        <RoleGate
          permission="portfolio.edit"
          fallback={<span className="tag">Read-only</span>}
        >
          <button
            style={{
              alignSelf: "center",
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #ccc",
              background: "#ffffff"
            }}
          >
            Change status
          </button>
        </RoleGate>
      </div>

      <div className="tabs">
        <span className="tab">Overview</span>
        <span className="tab">Documents</span>
        <span className="tab">Compliance</span>
        <span className="tab">Activity</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <h3 style={{ marginTop: 0 }}>Documents</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Version</th>
                <th>Status</th>
                <th>Uploaded by</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itemDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.title}</td>
                  <td>{doc.version}</td>
                  <td>
                    <StatusPill
                      label={labelDocStatus(doc.status)}
                      tone={doc.status === "approved" ? "success" : "warning"}
                    />
                  </td>
                  <td>{doc.uploadedBy}</td>
                  <td>
                    <RoleGate permission="document.approve">
                      {doc.status === "pending" ? (
                        <form action={approveDocumentAction}>
                          <input type="hidden" name="documentId" value={doc.id} />
                          <input
                            type="hidden"
                            name="portfolioItemId"
                            value={item.id}
                          />
                          <button
                            type="submit"
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "1px solid #2f5d62",
                              background: "#2f5d62",
                              color: "#fff"
                            }}
                          >
                            Approve
                          </button>
                        </form>
                      ) : null}
                    </RoleGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <RoleGate permission="document.upload">
            <DocumentUploader portfolioItemId={item.id} />
          </RoleGate>
          <RoleGate permission="document.approve">
            <p style={{ color: "#6c645d", marginTop: 16 }}>
              Only admins can approve pending documents.
            </p>
          </RoleGate>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Compliance</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {itemTasks.slice(0, 6).map((task) => (
              <div key={task.id} style={{ display: "grid", gap: 4 }}>
                <strong>{task.requirement}</strong>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="tag">{task.market}</span>
                  <StatusPill
                    label={labelTaskStatus(task.status)}
                    tone={task.status === "done" ? "success" : "warning"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 3" }}>
          <h3 style={{ marginTop: 0 }}>Activity log</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {auditEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.createdAt}</td>
                  <td>{event.actor}</td>
                  <td>{event.action}</td>
                  <td>{event.metadata}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
