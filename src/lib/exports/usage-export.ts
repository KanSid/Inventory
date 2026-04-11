import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export interface UsageRow {
  usage_date: string;
  item_code: string;
  bride_name: string;
  quantity_used: number;
  logged_by: string;
}

export async function exportUsagePdf(data: UsageRow[], fileName: string = "usage-report") {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Title
  doc.setFontSize(16);
  doc.text("Stock Usage Report", margin, margin + 5);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 12);
  doc.setTextColor(0);

  // Table data
  const tableData = data.map((row) => [
    new Date(row.usage_date).toLocaleDateString(),
    row.item_code,
    row.bride_name,
    `${row.quantity_used}m`,
    row.logged_by,
  ]);

  // Create table
  const startY = margin + 20;
  const columns = ["Date", "Product", "Bride", "Quantity", "Logged By"];
  const columnWidths = [20, 25, 30, 20, 35];

  // Header
  let currentY = startY;
  doc.setFillColor(200, 0, 95);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("", "bold");

  let currentX = margin;
  columns.forEach((col, idx) => {
    doc.text(col, currentX + 2, currentY + 5);
    currentX += columnWidths[idx];
  });

  // Rows
  doc.setTextColor(0);
  doc.setFont("", "normal");
  doc.setFontSize(9);
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

export async function exportUsageExcel(data: UsageRow[], fileName: string = "usage-report") {
  const exportData = data.map((row) => ({
    Date: new Date(row.usage_date).toLocaleDateString(),
    Product: row.item_code,
    Bride: row.bride_name,
    "Quantity (m)": row.quantity_used,
    "Logged By": row.logged_by,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  const colWidths = [15, 20, 25, 15, 20];
  worksheet["!cols"] = colWidths.map((w) => ({ wch: w }));

  XLSX.utils.book_append_sheet(workbook, worksheet, "Usage");

  const excelFileName = `${fileName}-${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, excelFileName);
}
