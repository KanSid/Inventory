"use client";

import { ExportButtons } from "@/components/reports/export-buttons";
import { exportAdjustmentPdf, exportAdjustmentExcel, type AdjustmentRow } from "@/lib/exports/adjustment-export";

export function AdjustmentReportClient({ data }: { data: AdjustmentRow[] }) {
  return (
    <ExportButtons
      onExportPdf={async () => await exportAdjustmentPdf(data, "adjustments-log")}
      onExportExcel={async () => await exportAdjustmentExcel(data, "adjustments-log")}
      fileName="adjustments-log"
    />
  );
}
