import { Role } from "@/lib/types";

type Permission =
  | "portfolio.view"
  | "portfolio.edit"
  | "document.upload"
  | "document.approve"
  | "document.delete"
  | "task.edit"
  | "audit.view"
  | "import.run";

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "portfolio.view",
    "portfolio.edit",
    "document.upload",
    "document.approve",
    "document.delete",
    "task.edit",
    "audit.view",
    "import.run"
  ],
  operator: [
    "portfolio.view",
    "portfolio.edit",
    "document.upload",
    "task.edit",
    "audit.view",
    "import.run"
  ],
  viewer: ["portfolio.view", "audit.view"]
};

export const can = (role: Role, permission: Permission) =>
  rolePermissions[role].includes(permission);
