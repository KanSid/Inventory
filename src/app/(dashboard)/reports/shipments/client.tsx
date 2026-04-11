"use client";

import { ExportButtons } from "@/components/reports/export-buttons";
import { exportShipmentPdf, exportShipmentExcel, type ShipmentRow } from "@/lib/exports/shipment-export";

export function ShipmentReportClient({ data }: { data: ShipmentRow[] }) {
  return (
    <ExportButtons
      onExportPdf={async () => await exportShipmentPdf(data, "shipment-history")}
      onExportExcel={async () => await exportShipmentExcel(data, "shipment-history")}
      fileName="shipment-history"
    />
  );
}
