import ExcelJS from 'exceljs';

async function main() {
  const workbook = new ExcelJS.Workbook();
  const filePath = "scratch/test_output.xlsx";
  console.log("Reading workbook...");
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet(1) || workbook.worksheets[0];
  console.log("Successfully read workbook!");
  console.log(`Worksheet: ${sheet.name}, Rows: ${sheet.rowCount}`);
  
  // Inspect a cell with border to verify it is correct
  const courseCell = sheet.getCell('K9');
  console.log("K9 cell border:", JSON.stringify(courseCell.border));
  console.log("K9 cell fill:", JSON.stringify(courseCell.fill));
}

main().catch(console.error);
