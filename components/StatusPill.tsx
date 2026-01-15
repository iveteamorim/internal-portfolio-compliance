type StatusPillProps = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneMap: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  default: "#efe7de",
  success: "#d9eadf",
  warning: "#f3e5c0",
  danger: "#f4d6d6"
};

export default function StatusPill({ label, tone = "default" }: StatusPillProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: toneMap[tone]
      }}
    >
      {label}
    </span>
  );
}
