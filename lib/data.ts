import { createSupabaseServerClient } from "@/lib/supabaseServer";
import {
  AuditEvent,
  ComplianceTask,
  Document,
  PortfolioItem
} from "@/lib/types";

export async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("id, name, owner, status, markets, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    data?.map((item) => ({
      id: item.id,
      name: item.name,
      owner: item.owner,
      status: item.status,
      markets: item.markets ?? [],
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) ?? []
  );
}

export async function fetchPortfolioItem(id: string): Promise<PortfolioItem | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("id, name, owner, status, markets, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    owner: data.owner,
    status: data.status,
    markets: data.markets ?? [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function fetchDocumentsByPortfolio(
  portfolioItemId: string
): Promise<Document[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, title, version, status, portfolio_item_id, uploaded_at, storage_url, uploaded_by:users(full_name)"
    )
    .eq("portfolio_item_id", portfolioItemId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    data?.map((doc) => ({
      id: doc.id,
      title: doc.title,
      version: doc.version,
      status: doc.status,
      portfolioItemId: doc.portfolio_item_id,
      uploadedBy: doc.uploaded_by?.full_name ?? "Unknown",
      uploadedAt: doc.uploaded_at,
      storageUrl: doc.storage_url
    })) ?? []
  );
}

export async function fetchTasksByPortfolio(
  portfolioItemId: string
): Promise<ComplianceTask[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("compliance_tasks")
    .select("id, portfolio_item_id, market, requirement, status")
    .eq("portfolio_item_id", portfolioItemId);

  if (error) {
    throw new Error(error.message);
  }

  return (
    data?.map((task) => ({
      id: task.id,
      portfolioItemId: task.portfolio_item_id,
      market: task.market,
      requirement: task.requirement,
      status: task.status
    })) ?? []
  );
}

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("audit_events")
    .select("id, action, target_type, target_id, metadata, created_at, actor:users(full_name)")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (
    data?.map((event) => ({
      id: event.id,
      actor: event.actor?.full_name ?? "Unknown",
      action: event.action,
      createdAt: new Date(event.created_at).toLocaleString(),
      targetType: event.target_type,
      targetId: event.target_id,
      metadata: event.metadata ?? undefined
    })) ?? []
  );
}

export async function fetchDashboardStats() {
  const supabase = createSupabaseServerClient();
  const { data: items, error: itemError } = await supabase
    .from("portfolio_items")
    .select("status")
    .order("created_at", { ascending: false });

  if (itemError) {
    throw new Error(itemError.message);
  }

  const { data: docs, error: docError } = await supabase
    .from("documents")
    .select("status");

  if (docError) {
    throw new Error(docError.message);
  }

  const { data: tasks, error: taskError } = await supabase
    .from("compliance_tasks")
    .select("market, status");

  if (taskError) {
    throw new Error(taskError.message);
  }

  return {
    items: items ?? [],
    documents: docs ?? [],
    tasks: tasks ?? []
  };
}
