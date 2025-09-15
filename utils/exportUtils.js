import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// 📊 Export chart to PDF (as image)
export const exportChartAsPDF = async (elementId, filename = "chart") => {
  const chart = document.getElementById(elementId);
  if (!chart) return alert("Chart not found!");

  const canvas = await html2canvas(chart);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF();
  pdf.addImage(imgData, "PNG", 10, 10, 180, 100);
  pdf.save(`${filename}.pdf`);
};

// 📋 Export table to PDF
export const exportTableAsPDF = (columns, data, title = "Table") => {
  const doc = new jsPDF();
  doc.text(title, 10, 10);

  autoTable(doc, {
    head: [columns.map(col => col.title)],
    body: data.map(row => columns.map(col => row[col.dataIndex])),
  });

  doc.save(`${title}.pdf`);
};

// 📄 Export table to CSV
export const exportTableAsCSV = (columns, data, filename = "table.csv") => {
  const csvHeader = columns.map(col => col.title).join(",");
  const csvRows = data.map(row =>
    columns.map(col => `"${row[col.dataIndex] || ""}"`).join(",")
  );
  const csvContent = [csvHeader, ...csvRows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
