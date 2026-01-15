"use client";

import { useRole } from "@/components/RoleProvider";

export default function RoleSwitcher() {
  const { role, userEmail } = useRole();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span className="tag">Role: {role}</span>
      <span className="tag">{userEmail ?? "anon"}</span>
    </div>
  );
}
