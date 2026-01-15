"use client";

import { Role } from "@/lib/types";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type RoleContextValue = {
  role: Role;
  userEmail?: string | null;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({
  children,
  initialRole,
  userEmail
}: {
  children: ReactNode;
  initialRole: Role;
  userEmail?: string | null;
}) {
  const [role] = useState<Role>(initialRole);
  const value = useMemo(() => ({ role, userEmail }), [role, userEmail]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
}
