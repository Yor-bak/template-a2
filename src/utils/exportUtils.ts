/**
 * Exports a 2D array as a UTF-8 CSV file with BOM for Excel compatibility.
 * First row should be the headers.
 */
export function exportToCSV(filename: string, rows: (string | number | undefined | null)[][]): void {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const s = cell == null ? "" : String(cell);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\r\n");

  const bom = "﻿";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
