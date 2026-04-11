import { createClient } from "@/lib/supabase/server";
import { BridesClient } from "@/components/brides/brides-client";

export default async function BridesPage() {
  const supabase = await createClient();

  const { data: brides } = await supabase
    .from("brides")
    .select("*")
    .order("name");

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  return <BridesClient brides={brides ?? []} canEdit={canEdit} />;
}
