"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Sheet } from "lucide-react";

interface ExportButtonsProps {
  onExportPdf: () => Promise<void>;
  onExportExcel: () => Promise<void>;
  fileName: string;
}

export function ExportButtons({ onExportPdf, onExportExcel, fileName }: ExportButtonsProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const handlePdfClick = async () => {
    try {
      setLoadingPdf(true);
      await onExportPdf();
    } catch (error) {
      alert(`PDF export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleExcelClick = async () => {
    try {
      setLoadingExcel(true);
      await onExportExcel();
    } catch (error) {
      alert(`Excel export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePdfClick}
        disabled={loadingPdf || loadingExcel}
      >
        <FileText size={16} className="mr-2" />
        {loadingPdf ? "Exporting..." : "Export PDF"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExcelClick}
        disabled={loadingPdf || loadingExcel}
      >
        <Sheet size={16} className="mr-2" />
        {loadingExcel ? "Exporting..." : "Export Excel"}
      </Button>
    </div>
  );
}
