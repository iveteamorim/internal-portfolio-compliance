import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Role } from "@/lib/types";

export async function getSessionUser() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getUserRole(email: string | null | undefined): Promise<Role> {
  if (!email) {
    return "viewer";
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("email, user_roles(role_id, roles(name))")
    .eq("email", email)
    .single();

  if (error || !data) {
    return "viewer";
  }

  const roleName = (data as { user_roles?: Array<{ roles?: { name?: string } }> })
    .user_roles?.[0]?.roles?.name;
  if (roleName === "admin" || roleName === "operator" || roleName === "viewer") {
    return roleName;
  }

  return "viewer";
}
