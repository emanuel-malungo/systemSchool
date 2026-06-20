import ExcelJS from 'exceljs';

async function main() {
  const workbook = new ExcelJS.Workbook();
  const filePath = "scratch/test_output.xlsx";
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet(1) || workbook.worksheets[0];
  
  console.log("=== MERGED RANGES IN OUTPUT ===");
  const merges = sheet.model.merges || [];
  merges.forEach(range => {
    const [start, end] = range.split(':');
    const cell = sheet.getCell(start);
    console.log(`${range} | Val: ${JSON.stringify(cell.value)}`);
  });
}

main().catch(console.error);
