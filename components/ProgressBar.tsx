type ProgressBarProps = {
  value: number;
};

export default function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div
      style={{
        background: "#f1ebe4",
        borderRadius: 999,
        height: 8,
        overflow: "hidden",
        width: "100%"
      }}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: "100%",
          background: "#2f5d62"
        }}
      />
    </div>
  );
}
