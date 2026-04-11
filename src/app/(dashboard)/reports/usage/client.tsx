"use client";

import { ExportButtons } from "@/components/reports/export-buttons";
import { exportUsagePdf, exportUsageExcel, type UsageRow } from "@/lib/exports/usage-export";

export function UsageReportClient({ data }: { data: UsageRow[] }) {
  return (
    <ExportButtons
      onExportPdf={async () => await exportUsagePdf(data, "usage-report")}
      onExportExcel={async () => await exportUsageExcel(data, "usage-report")}
      fileName="usage-report"
    />
  );
}
