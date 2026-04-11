import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export interface AdjustmentRow {
  created_at: string;
  item_code: string;
  roll_number: string;
  adjustment_type: string;
  quantity: number;
  reason: string;
  adjusted_by: string;
}

export async function exportAdjustmentPdf(data: AdjustmentRow[], fileName: string = "adjustments-log") {
  const doc = new jsPDF("l"); // Landscape for more columns
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Title
  doc.setFontSize(16);
  doc.text("Stock Adjustments Log", margin, margin + 5);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 12);
  doc.setTextColor(0);

  // Table data
  const tableData = data.map((row) => [
    new Date(row.created_at).toLocaleDateString(),
    row.item_code,
    row.roll_number,
    row.adjustment_type.charAt(0).toUpperCase() + row.adjustment_type.slice(1).replace(/_/g, " "),
    `${row.quantity}m`,
    row.reason.substring(0, 20) + (row.reason.length > 20 ? "..." : ""),
    row.adjusted_by,
  ]);

  // Create table
  const startY = margin + 20;
  const columns = ["Date", "Product", "Roll", "Type", "Qty", "Reason", "By"];
  const columnWidths = [20, 20, 20, 25, 15, 35, 25];

  // Header
  let currentY = startY;
  doc.setFillColor(200, 0, 95);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("", "bold");

  let currentX = margin;
  columns.forEach((col, idx) => {
    doc.text(col, currentX + 2, currentY + 5);
    currentX += columnWidths[idx];
  });

  // Rows
  doc.setTextColor(0);
  doc.setFont("", "normal");
  doc.setFontSize(8);
  currentY += 7;

  tableData.forEach((row, rowIdx) => {
    if (currentY > pageHeight - margin - 10) {
      doc.addPage();
      currentY = margin;
    }

    currentX = margin;
    row.forEach((cell, colIdx) => {
      doc.text(cell, currentX + 2, currentY + 4);
      currentX += columnWidths[colIdx];
    });

    currentY += 6;

    if (rowIdx % 2 === 0) {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, currentY - 6, pageWidth - 2 * margin, 6, "F");
    }
  });

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}-${new Date().toISOString().split("T")[0]}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAdjustmentExcel(data: AdjustmentRow[], fileName: string = "adjustments-log") {
  const exportData = data.map((row) => ({
    Date: new Date(row.created_at).toLocaleDateString(),
    Product: row.item_code,
    Roll: row.roll_number,
    Type: row.adjustment_type.charAt(0).toUpperCase() + row.adjustment_type.slice(1).replace(/_/g, " "),
    "Quantity (m)": row.quantity,
    Reason: row.reason,
    "Adjusted By": row.adjusted_by,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  const colWidths = [15, 15, 15, 18, 15, 35, 15];
  worksheet["!cols"] = colWidths.map((w) => ({ wch: w }));

  XLSX.utils.book_append_sheet(workbook, worksheet, "Adjustments");

  const excelFileName = `${fileName}-${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, excelFileName);
}
