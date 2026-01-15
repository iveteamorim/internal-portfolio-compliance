import KpiCard from "@/components/KpiCard";
import ProgressBar from "@/components/ProgressBar";
import StatusPill from "@/components/StatusPill";
import { fetchDashboardStats } from "@/lib/data";

export default async function DashboardPage() {
  const { items, documents, tasks } = await fetchDashboardStats();
  const activeItems = items.filter((item) => item.status === "active");
  const blockedItems = items.filter((item) => item.status === "blocked");
  const pendingDocs = documents.filter((doc) => doc.status === "pending");
  const marketProgress = ["EU", "US", "CA"].map((market) => {
    const marketTasks = tasks.filter((task) => task.market === market);
    const done = marketTasks.filter((task) => task.status === "done").length;
    const pct = marketTasks.length ? Math.round((done / marketTasks.length) * 100) : 0;
    return { market, pct, total: marketTasks.length, done };
  });

  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
      <KpiCard label="Active items" value={activeItems.length} detail="Ready for launch" />
      <KpiCard label="Blocked items" value={blockedItems.length} detail="Missing requirements" />
      <KpiCard label="Pending docs" value={pendingDocs.length} detail="Need approval" />

      <div className="card" style={{ gridColumn: "span 2" }}>
        <h3 style={{ marginTop: 0 }}>Market checklist</h3>
        <div className="grid" style={{ gap: 16 }}>
          {marketProgress.map((entry) => (
            <div key={entry.market} style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{entry.market}</strong>
                <span style={{ color: "#6c645d" }}>
                  {entry.done}/{entry.total} done
                </span>
              </div>
              <ProgressBar value={entry.pct} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Key alerts</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <StatusPill label="Pending docs" tone="warning" />
            <p style={{ margin: "8px 0 0", color: "#6c645d" }}>
              Prioritize stability study reviews.
            </p>
          </div>
          <div>
            <StatusPill label="Portfolio blocked" tone="danger" />
            <p style={{ margin: "8px 0 0", color: "#6c645d" }}>
              Missing labeling requirements for CA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
