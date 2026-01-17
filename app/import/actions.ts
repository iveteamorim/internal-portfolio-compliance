"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getSessionUser, getUserRole } from "@/lib/auth";
import { Market, PortfolioStatus } from "@/lib/types";

const allowedMarkets: Market[] = ["EU", "US", "CA"];
const mockLegacyLinks = [
  { legacy: "sharepoint://reg/PI-1001/stability.pdf", title: "Legacy Stability Report" },
  { legacy: "sharepoint://reg/PI-1004/label.docx", title: "Legacy Label Review" },
  { legacy: "sharepoint://reg/PI-1007/safety.pdf", title: "Legacy Safety Assessment" }
];

export async function importCsvAction(formData: FormData) {
  const payload = String(formData.get("payload") ?? "");
  if (!payload) {
    return { ok: false, error: "No data to import." };
  }

  const user = await getSessionUser();
  const role = await getUserRole(user?.email);
  if (role !== "admin" && role !== "operator") {
    return { ok: false, error: "Not authorized to import." };
  }

  let rows: Array<{
    name: string;
    owner: string;
    markets: string;
    status: string;
    task_market: string;
    task_requirement: string;
  }> = [];

  try {
    rows = JSON.parse(payload);
  } catch {
    return { ok: false, error: "Invalid format." };
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, error: "Empty CSV." };
  }

  const supabase = createSupabaseServerClient();

  const itemsByKey = new Map<string, {
    name: string;
    owner: string;
    status: PortfolioStatus;
    markets: Market[];
  }>();

  rows.forEach((row) => {
    const name = row.name?.trim();
    const owner = row.owner?.trim();
    if (!name || !owner) {
      return;
    }
    const key = `${name}::${owner}`;
    const markets = row.markets
      .split("|")
      .map((market) => market.trim())
      .filter((market) => allowedMarkets.includes(market as Market)) as Market[];
    const status = (row.status?.trim() as PortfolioStatus) || "draft";

    if (!itemsByKey.has(key)) {
      itemsByKey.set(key, {
        name,
        owner,
        status,
        markets: markets.length ? markets : ["EU"]
      });
    }
  });

  const itemsToInsert = Array.from(itemsByKey.values());
  const { data: insertedItems, error: insertError } = await supabase
    .from("portfolio_items")
    .insert(itemsToInsert)
    .select("id, name, owner");

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  const idLookup = new Map<string, string>();
  (insertedItems ?? []).forEach((item) => {
    idLookup.set(`${item.name}::${item.owner}`, item.id);
  });

  const tasksToInsert = rows
    .map((row) => {
      const name = row.name?.trim();
      const owner = row.owner?.trim();
      const requirement = row.task_requirement?.trim();
      const market = row.task_market?.trim();
      if (!name || !owner || !requirement || !market) {
        return null;
      }
      const portfolioItemId = idLookup.get(`${name}::${owner}`);
      if (!portfolioItemId) {
        return null;
      }
      if (!allowedMarkets.includes(market as Market)) {
        return null;
      }
      return {
        portfolio_item_id: portfolioItemId,
        market,
        requirement,
        status: "open" as const
      };
    })
    .filter(Boolean);

  if (tasksToInsert.length) {
    const { error: taskError } = await supabase
      .from("compliance_tasks")
      .insert(tasksToInsert);
    if (taskError) {
      return { ok: false, error: taskError.message };
    }
  }

  return { ok: true, importedItems: itemsToInsert.length, importedTasks: tasksToInsert.length };
}

export async function importMockDocumentsAction() {
  const user = await getSessionUser();
  const role = await getUserRole(user?.email);
  if (role !== "admin" && role !== "operator") {
    return { ok: false, error: "Not authorized to import." };
  }

  const supabase = createSupabaseServerClient();
  const { data: actor } = await supabase
    .from("users")
    .select("id")
    .eq("email", user?.email ?? "")
    .single();

  const { data: items, error: itemsError } = await supabase
    .from("portfolio_items")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(mockLegacyLinks.length);

  if (itemsError || !items?.length) {
    return { ok: false, error: "No portfolio items available." };
  }

  let inserted = 0;
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const legacy = mockLegacyLinks[i];
    const fileName = `${legacy.title.toLowerCase().replace(/\s+/g, "-")}.txt`;
    const path = `migrations/${item.id}/${Date.now()}-${fileName}`;
    const content = `Legacy source: ${legacy.legacy}\nImported for ${item.name}.`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, Buffer.from(content), { upsert: true });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        title: legacy.title,
        version: "v1.0",
        status: "pending",
        portfolio_item_id: item.id,
        uploaded_by: actor?.id ?? null,
        storage_url: urlData.publicUrl
      })
      .select("id")
      .single();

    if (docError) {
      return { ok: false, error: docError.message };
    }

    await supabase.from("audit_events").insert({
      actor_id: actor?.id ?? null,
      action: "Document migrated",
      target_type: "document",
      target_id: doc?.id ?? item.id,
      metadata: legacy.legacy
    });

    inserted += 1;
  }

  return { ok: true, imported: inserted };
}
