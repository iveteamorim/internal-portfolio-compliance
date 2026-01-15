import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getUserRole } from "@/lib/auth";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const role = await getUserRole(data.user.email);
  if (role !== "admin" && role !== "operator") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const version = String(body.version ?? "").trim();
  const portfolioItemId = String(body.portfolioItemId ?? "").trim();
  const storageUrl = String(body.storageUrl ?? "").trim();

  if (!title || !version || !portfolioItemId || !storageUrl) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const { data: actor } = await supabase
    .from("users")
    .select("id")
    .eq("email", data.user.email)
    .single();

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({
      title,
      version,
      status: "pending",
      portfolio_item_id: portfolioItemId,
      uploaded_by: actor?.id ?? null,
      storage_url: storageUrl
    })
    .select("id")
    .single();

  if (docError) {
    return NextResponse.json({ error: docError.message }, { status: 400 });
  }

  await supabase.from("audit_events").insert({
    actor_id: actor?.id ?? null,
    action: "Uploaded document",
    target_type: "document",
    target_id: doc?.id ?? portfolioItemId,
    metadata: title
  });

  return NextResponse.json({ ok: true });
}
