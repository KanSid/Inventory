import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export interface InventoryRow {
  item_code: string;
  description: string;
  total_stock: number;
  active_count: number;
  stock_unit: string;
  stock_status: string;
}

export async function exportInventoryPdf(data: InventoryRow[], fileName: string = "inventory-snapshot") {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Title
  doc.setFontSize(16);
  doc.text("Inventory Snapshot", margin, margin + 5);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 12);
  doc.setTextColor(0);

  // Table data
  const tableData = data.map((row) => [
    row.item_code,
    row.description,
    row.stock_unit === "pieces" ? `${Math.round(row.total_stock)} pcs` : `${row.total_stock.toFixed(1)}m`,
    row.active_count.toString(),
    row.stock_status.replace(/_/g, " ").charAt(0).toUpperCase() + row.stock_status.slice(1).replace(/_/g, " "),
  ]);

  // Create table
  const startY = margin + 20;
  const columns = ["Code", "Description", "Total Stock", "Entries", "Status"];
  const columnWidths = [25, 60, 30, 20, 35];

  // Header
  let currentY = startY;
  doc.setFillColor(200, 0, 95); // D'Aisle rose
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

    // Alternating row background
    if (rowIdx % 2 === 0) {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, currentY - 6, pageWidth - 2 * margin, 6, "F");
    }
  });

  // Download
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}-${new Date().toISOString().split("T")[0]}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportInventoryExcel(data: InventoryRow[], fileName: string = "inventory-snapshot") {
  const exportData = data.map((row) => ({
    "Item Code": row.item_code,
    Description: row.description,
    "Total Stock": row.stock_unit === "pieces" ? `${Math.round(row.total_stock)} pcs` : `${row.total_stock.toFixed(1)}m`,
    "Unit": row.stock_unit === "pieces" ? "pieces" : "meters",
    "Entry Count": row.active_count,
    Status: row.stock_status.replace(/_/g, " "),
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  // Set column widths
  const colWidths = [15, 30, 15, 12, 15];
  worksheet["!cols"] = colWidths.map((w) => ({ wch: w }));

  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

  const excelFileName = `${fileName}-${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, excelFileName);
}
