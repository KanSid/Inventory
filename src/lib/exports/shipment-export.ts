import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export interface ShipmentRow {
  shipment_number: string;
  supplier_name: string;
  status: string;
  received_date: string | null;
  item_count: number;
  total_meters: number;
}

export async function exportShipmentPdf(data: ShipmentRow[], fileName: string = "shipment-history") {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Title
  doc.setFontSize(16);
  doc.text("Shipment History Report", margin, margin + 5);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 12);
  doc.setTextColor(0);

  // Table data
  const tableData = data.map((row) => [
    row.shipment_number,
    row.supplier_name,
    row.status.charAt(0).toUpperCase() + row.status.slice(1),
    row.received_date ? new Date(row.received_date).toLocaleDateString() : "Pending",
    row.item_count.toString(),
    `${row.total_meters}m`,
  ]);

  // Create table
  const startY = margin + 20;
  const columns = ["Shipment #", "Supplier", "Status", "Received", "Items", "Total (m)"];
  const columnWidths = [25, 40, 20, 25, 15, 20];

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

export async function exportShipmentExcel(data: ShipmentRow[], fileName: string = "shipment-history") {
  const exportData = data.map((row) => ({
    "Shipment #": row.shipment_number,
    Supplier: row.supplier_name,
    Status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
    "Received Date": row.received_date ? new Date(row.received_date).toLocaleDateString() : "Pending",
    "Item Count": row.item_count,
    "Total Meters": row.total_meters,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  const colWidths = [18, 25, 15, 18, 15, 15];
  worksheet["!cols"] = colWidths.map((w) => ({ wch: w }));

  XLSX.utils.book_append_sheet(workbook, worksheet, "Shipments");

  const excelFileName = `${fileName}-${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, excelFileName);
}
