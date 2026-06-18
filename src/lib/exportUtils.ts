/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function exportToCSV(data: any[], filename: string, headers: Record<string, string>) {
  if (!data || data.length === 0) return;

  const keys = Object.keys(headers);
  
  // Format header row
  const headerRow = keys.map(key => {
    const headerName = headers[key];
    // Escape double quotes inside header names
    return `"${headerName.replace(/"/g, '""')}"`;
  }).join(",");
  
  const csvRows = [headerRow];
  
  // Format body rows
  data.forEach(item => {
    const values = keys.map(key => {
      let val = item[key];
      if (val === undefined || val === null) return "";
      
      // Escape commas and double quotes
      let formattedVal = String(val).replace(/"/g, '""');
      return `"${formattedVal}"`;
    });
    csvRows.push(values.join(","));
  });
  
  // Prepend UTF-8 BOM so Excel opens Vietnamese characters without encoding issues
  const csvContent = "\uFEFF" + csvRows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Download link trigger
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
