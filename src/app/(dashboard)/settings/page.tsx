import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Users, ScrollText, SlidersHorizontal } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const sections = [
    {
      title: "Admin Settings",
      description: "Inventory thresholds, notification preferences, and data retention policies",
      icon: SlidersHorizontal,
      href: "/settings/admin",
      color: "text-rose-600",
    },
    {
      title: "User Management",
      description: "Manage user accounts, assign roles, deactivate users, and initiate password resets",
      icon: Users,
      href: "/settings/users",
      color: "text-blue-600",
    },
    {
      title: "Activity Log",
      description: "Timeline of all stock adjustments, shipments, configuration changes, and user actions",
      icon: ScrollText,
      href: "/settings/activity-log",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Admin configuration and system management"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <section.icon size={20} className={section.color} />
                  {section.title}
                </CardTitle>
                <CardDescription className="text-sm">{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-rose-600 font-medium">Open →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
