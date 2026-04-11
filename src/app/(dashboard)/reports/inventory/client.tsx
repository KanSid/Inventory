"use client";

import { ExportButtons } from "@/components/reports/export-buttons";
import { exportInventoryPdf, exportInventoryExcel, type InventoryRow } from "@/lib/exports/inventory-export";

export function InventoryReportClient({ data }: { data: InventoryRow[] }) {
  const handleExportPdf = async () => {
    await exportInventoryPdf(data, "inventory-snapshot");
  };

  const handleExportExcel = async () => {
    await exportInventoryExcel(data, "inventory-snapshot");
  };

  return (
    <ExportButtons
      onExportPdf={handleExportPdf}
      onExportExcel={handleExportExcel}
      fileName="inventory-snapshot"
    />
  );
}
