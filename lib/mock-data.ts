import {
  AuditEvent,
  ComplianceTask,
  Document,
  Market,
  PortfolioItem
} from "@/lib/types";

const markets: Market[] = ["EU", "US", "CA"];

export const portfolioItems: PortfolioItem[] = Array.from({ length: 10 }).map(
  (_, index) => {
    const status =
      index % 4 === 0
        ? "blocked"
        : index % 3 === 0
        ? "draft"
        : "active";
    return {
      id: `PI-${1000 + index}`,
      name: `Formula ${index + 1}`,
      owner: ["Alicia", "Bruno", "Camila", "Diego"][index % 4],
      status,
      markets: markets.slice(0, (index % 3) + 1),
      createdAt: "2024-05-01",
      updatedAt: "2024-06-15"
    };
  }
);

export const documents: Document[] = Array.from({ length: 30 }).map(
  (_, index) => {
    const status =
      index % 5 === 0 ? "pending" : index % 4 === 0 ? "obsolete" : "approved";
    const portfolioItemId = portfolioItems[index % portfolioItems.length].id;
    return {
      id: `DOC-${2000 + index}`,
      title: `Stability Report ${index + 1}`,
      version: `v${(index % 3) + 1}.0`,
      status,
      portfolioItemId,
      uploadedBy: ["Alicia", "Bruno", "Camila", "Diego"][index % 4],
      uploadedAt: "2024-06-20",
      storageUrl: `https://storage.example.com/${portfolioItemId}/doc-${index}`
    };
  }
);

export const complianceTasks: ComplianceTask[] = Array.from({ length: 40 }).map(
  (_, index) => {
    const status = index % 6 === 0 ? "blocked" : index % 3 === 0 ? "done" : "open";
    const portfolioItemId = portfolioItems[index % portfolioItems.length].id;
    return {
      id: `TASK-${3000 + index}`,
      portfolioItemId,
      market: markets[index % markets.length],
      requirement: [
        "Ingredient disclosure",
        "Label review",
        "Stability data",
        "Safety assessment",
        "Regulatory filing"
      ][index % 5],
      status
    };
  }
);

export const auditEvents: AuditEvent[] = [
  {
    id: "AUD-1",
    actor: "Lucia (Admin)",
    action: "Approved document",
    createdAt: "2024-06-21 09:45",
    targetType: "document",
    targetId: "DOC-2004",
    metadata: "Version v2.0"
  },
  {
    id: "AUD-2",
    actor: "Bruno (Operator)",
    action: "Changed portfolio status",
    createdAt: "2024-06-21 10:15",
    targetType: "portfolio",
    targetId: "PI-1003",
    metadata: "draft -> blocked"
  },
  {
    id: "AUD-3",
    actor: "Lucia (Admin)",
    action: "Deleted document",
    createdAt: "2024-06-22 11:00",
    targetType: "document",
    targetId: "DOC-2018",
    metadata: "Superseded"
  }
];
