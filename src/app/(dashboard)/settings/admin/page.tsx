import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { AdminSettingsForm } from "@/components/settings/admin-settings-form";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: config } = await supabase
    .from("admin_config")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Settings"
        description="System-wide configuration and preferences"

      />
      <AdminSettingsForm config={config} />
    </div>
  );
}
