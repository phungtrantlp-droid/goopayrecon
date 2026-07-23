import * as xlsx from 'xlsx';

export const excelService = {
  parseExcel(buffer: Buffer): any[][] {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  },

  generateTemplate(headers: string[], sheetName: string = 'Template'): Buffer {
    const ws = xlsx.utils.aoa_to_sheet([headers]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, sheetName);
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  },

  generateExport(sheets: { name: string; headers: string[]; data: any[][] }[]): Buffer {
    const wb = xlsx.utils.book_new();
    for (const sheet of sheets) {
      const aoa = [sheet.headers, ...sheet.data];
      const ws = xlsx.utils.aoa_to_sheet(aoa);
      xlsx.utils.book_append_sheet(wb, ws, sheet.name);
    }
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  },

  rowsToObjects(rows: any[][], headers: string[]): Record<string, any>[] {
    const result: Record<string, any>[] = [];
    if (rows.length <= 1) return result;

    const fileHeaders = rows[0] as string[];
    const headerMap = new Map<string, number>();
    fileHeaders.forEach((header, index) => {
      headerMap.set(header.trim(), index);
    });

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || row.every((val) => val === undefined || val === null || val === '')) {
         continue; // skip empty rows
      }
      const obj: Record<string, any> = {};
      let hasData = false;
      for (const expectedHeader of headers) {
        const index = headerMap.get(expectedHeader);
        if (index !== undefined) {
          obj[expectedHeader] = row[index];
          if (row[index] !== undefined && row[index] !== null && row[index] !== '') {
            hasData = true;
          }
        } else {
          obj[expectedHeader] = undefined;
        }
      }
      if (hasData) {
        result.push(obj);
      }
    }
    return result;
  },
};
