type KpiCardProps = {
  label: string;
  value: string | number;
  detail?: string;
};

export default function KpiCard({ label, value, detail }: KpiCardProps) {
  return (
    <div className="card">
      <div style={{ fontSize: 12, textTransform: "uppercase", color: "#6c645d" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, margin: "8px 0" }}>{value}</div>
      {detail ? <div style={{ color: "#6c645d" }}>{detail}</div> : null}
    </div>
  );
}
