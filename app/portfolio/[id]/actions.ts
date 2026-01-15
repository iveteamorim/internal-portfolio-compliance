"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getSessionUser, getUserRole } from "@/lib/auth";

export async function approveDocumentAction(formData: FormData) {
  const documentId = String(formData.get("documentId") ?? "");
  const portfolioItemId = String(formData.get("portfolioItemId") ?? "");

  if (!documentId || !portfolioItemId) {
    return { error: "Missing document data." };
  }

  const user = await getSessionUser();
  const role = await getUserRole(user?.email);
  if (role !== "admin") {
    return { error: "Only admins can approve documents." };
  }

  const supabase = createSupabaseServerClient();

  const { data: actor } = await supabase
    .from("users")
    .select("id")
    .eq("email", user?.email ?? "")
    .single();

  const { error: docError } = await supabase
    .from("documents")
    .update({ status: "approved" })
    .eq("id", documentId);

  if (docError) {
    return { error: docError.message };
  }

  await supabase.from("audit_events").insert({
    actor_id: actor?.id ?? null,
    action: "Approved document",
    target_type: "document",
    target_id: documentId,
    metadata: "Approved via UI"
  });

  const { data: currentItem } = await supabase
    .from("portfolio_items")
    .select("status")
    .eq("id", portfolioItemId)
    .single();

  const { data: tasks, error: tasksError } = await supabase
    .from("compliance_tasks")
    .select("status")
    .eq("portfolio_item_id", portfolioItemId);

  if (!tasksError) {
    const hasBlocking = (tasks ?? []).some(
      (task) => task.status === "open" || task.status === "blocked"
    );
    const nextStatus = hasBlocking ? "blocked" : "active";
    await supabase.from("portfolio_items").update({ status: nextStatus }).eq("id", portfolioItemId);
    if (currentItem?.status && currentItem.status !== nextStatus) {
      await supabase.from("audit_events").insert({
        actor_id: actor?.id ?? null,
        action: "Changed portfolio status",
        target_type: "portfolio",
        target_id: portfolioItemId,
        metadata: `${currentItem.status} -> ${nextStatus}`
      });
    }
  }

  return { error: undefined };
}
