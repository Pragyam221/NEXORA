/**
 * Exports an array of objects to a CSV file and triggers a browser download.
 */
export function exportToCSV<T extends Record<string, any>>(data: T[], filename: string): void {
  if (!data || data.length === 0) {
    alert('No data available to export with current filters.');
    return;
  }

  // Extract all keys
  const headers = Object.keys(data[0]);

  // Construct CSV rows
  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) {
        return '""';
      }
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      } else {
        val = String(val);
      }
      // Escape double quotes
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\r\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
