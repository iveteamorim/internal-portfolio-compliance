export type Role = "admin" | "operator" | "viewer";
export type Market = "EU" | "US" | "CA";

export type PortfolioStatus = "draft" | "active" | "blocked" | "archived";
export type DocumentStatus = "pending" | "approved" | "obsolete";
export type TaskStatus = "open" | "done" | "blocked";

export type PortfolioItem = {
  id: string;
  name: string;
  owner: string;
  status: PortfolioStatus;
  markets: Market[];
  createdAt: string;
  updatedAt: string;
};

export type Document = {
  id: string;
  title: string;
  version: string;
  status: DocumentStatus;
  portfolioItemId: string;
  uploadedBy: string;
  uploadedAt: string;
  storageUrl: string;
};

export type ComplianceTask = {
  id: string;
  portfolioItemId: string;
  market: Market;
  requirement: string;
  status: TaskStatus;
};

export type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  createdAt: string;
  targetType: "document" | "portfolio" | "task";
  targetId: string;
  metadata?: string;
};
