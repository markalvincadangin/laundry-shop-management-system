/**
 * exportToCSV: Generates and downloads a CSV file from an array of objects.
 * Mandated by FRONT-001 for administrative data portability.
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
) {
  if (data.length === 0) return;

  const actualHeaders = headers || (Object.keys(data[0]) as unknown as Record<keyof T, string>);
  const headerKeys = Object.keys(actualHeaders);
  const headerLabels = Object.values(actualHeaders);

  const csvRows = [
    headerLabels.join(","),
    ...data.map((row) =>
      headerKeys
        .map((key) => {
          const val = row[key];
          const escaped = ("" + val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
