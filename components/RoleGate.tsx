"use client";

import { can } from "@/lib/rbac";
import { Role } from "@/lib/types";
import { useRole } from "@/components/RoleProvider";
import { ReactNode } from "react";

type RoleGateProps = {
  permission: Parameters<typeof can>[1];
  children: ReactNode;
  fallback?: ReactNode;
};

export default function RoleGate({ permission, children, fallback }: RoleGateProps) {
  const { role } = useRole();

  if (can(role as Role, permission)) {
    return <>{children}</>;
  }

  return <>{fallback ?? null}</>;
}
