"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ACTION_LABELS: Record<string, string> = {
  stock_adjustment_added: "Stock Adjustment",
  stock_usage_logged: "Stock Usage",
  shipment_received: "Shipment Received",
  shipment_cancelled: "Shipment Cancelled",
  shipment_created: "Shipment Created",
  user_role_changed: "Role Changed",
  user_deactivated: "User Deactivated",
  user_reactivated: "User Reactivated",
  user_password_reset: "Password Reset",
  config_updated: "Config Updated",
  report_exported: "Report Exported",
  login: "Login",
  logout: "Logout",
};

interface ActivityLogFiltersProps {
  users: { id: string; full_name: string }[];
  actionTypes: string[];
  currentFilters: {
    user_id?: string;
    action_type?: string;
    from?: string;
    to?: string;
  };
}

export function ActivityLogFilters({ users, actionTypes, currentFilters }: ActivityLogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleChange(formData: FormData) {
    const params = new URLSearchParams();
    const fields = ["user_id", "action_type", "from", "to"] as const;
    for (const field of fields) {
      const val = formData.get(field) as string;
      if (val) params.set(field, val);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleReset() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form action={handleChange} className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">User</label>
            <select
              name="user_id"
              defaultValue={currentFilters.user_id ?? ""}
              className="rounded border border-input px-2 py-1.5 text-sm focus:border-primary focus:outline-none min-w-[160px]"
            >
              <option value="">All users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Action Type</label>
            <select
              name="action_type"
              defaultValue={currentFilters.action_type ?? ""}
              className="rounded border border-input px-2 py-1.5 text-sm focus:border-primary focus:outline-none min-w-[160px]"
            >
              <option value="">All actions</option>
              {actionTypes.map((a) => (
                <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">From Date</label>
            <input
              type="date"
              name="from"
              defaultValue={currentFilters.from ?? ""}
              className="rounded border border-input px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">To Date</label>
            <input
              type="date"
              name="to"
              defaultValue={currentFilters.to ?? ""}
              className="rounded border border-input px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              Filter
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
