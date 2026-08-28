"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveAdminSettings } from "@/app/(dashboard)/settings/admin/actions";

interface AdminConfig {
  id: number;
  low_stock_threshold: number;
  reorder_point: number;
  default_user_role: string;
  report_auto_export_enabled: boolean;
  report_auto_export_schedule: string;
  notify_low_stock: boolean;
  notify_new_shipment: boolean;
  notify_report_ready: boolean;
  data_retention_days: number;
}

interface AdminSettingsFormProps {
  config: AdminConfig | null;
}

export function AdminSettingsForm({ config }: AdminSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaults: AdminConfig = {
    id: 1,
    low_stock_threshold: 10,
    reorder_point: 20,
    default_user_role: "viewer",
    report_auto_export_enabled: false,
    report_auto_export_schedule: "weekly",
    notify_low_stock: true,
    notify_new_shipment: true,
    notify_report_ready: false,
    data_retention_days: 365,
    ...config,
  };

  function handleSubmit(formData: FormData) {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await saveAdminSettings(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Inventory Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inventory Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="low_stock_threshold">
                Low Stock Threshold (meters)
              </label>
              <input
                id="low_stock_threshold"
                name="low_stock_threshold"
                type="number"
                step="0.1"
                min="0"
                defaultValue={defaults.low_stock_threshold}
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">Products at or below this level show a low stock warning</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="reorder_point">
                Reorder Point (meters)
              </label>
              <input
                id="reorder_point"
                name="reorder_point"
                type="number"
                step="0.1"
                min="0"
                defaultValue={defaults.reorder_point}
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">Suggested stock level to trigger reorder action</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Role Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">User Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="default_user_role">
              Default Role for New Users
            </label>
            <select
              id="default_user_role"
              name="default_user_role"
              defaultValue={defaults.default_user_role}
              className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="viewer">Viewer (read-only)</option>
              <option value="inventory_manager">Inventory Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Report Auto-Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Auto-Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="report_auto_export_enabled"
              name="report_auto_export_enabled"
              type="checkbox"
              defaultChecked={defaults.report_auto_export_enabled}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label className="text-sm font-medium text-foreground" htmlFor="report_auto_export_enabled">
              Enable automatic report exports
            </label>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="report_auto_export_schedule">
              Export Schedule
            </label>
            <select
              id="report_auto_export_schedule"
              name="report_auto_export_schedule"
              defaultValue={defaults.report_auto_export_schedule}
              className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "notify_low_stock", label: "Notify on low stock alerts", checked: defaults.notify_low_stock },
            { name: "notify_new_shipment", label: "Notify on new shipment received", checked: defaults.notify_new_shipment },
            { name: "notify_report_ready", label: "Notify when scheduled report is ready", checked: defaults.notify_report_ready },
          ].map(({ name, label, checked }) => (
            <div key={name} className="flex items-center gap-3">
              <input
                id={name}
                name={name}
                type="checkbox"
                defaultChecked={checked}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <label className="text-sm text-foreground" htmlFor={name}>{label}</label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="data_retention_days">
            Activity Log Retention (days)
          </label>
          <input
            id="data_retention_days"
            name="data_retention_days"
            type="number"
            min="30"
            max="3650"
            defaultValue={defaults.data_retention_days}
            className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">How long to keep activity log entries (minimum 30 days)</p>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-emerald-600 font-medium">Settings saved successfully.</p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-[120px]"
        >
          {isPending ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
