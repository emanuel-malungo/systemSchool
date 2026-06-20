import ExcelJS from 'exceljs';

async function run() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('scratch/test_output.xlsx');
  const sheet = workbook.worksheets[0];
  
  console.log(`Sheet Name: ${sheet.name}`);
  console.log(`Max Row: ${sheet.actualRowCount}`);
  console.log(`Max Col: ${sheet.actualColumnCount}`);
  
  // Let's print rows from student list end onwards.
  // In test_build.mjs, there are 3 students, so endRow = 17 + 3 - 1 = 19.
  // Therefore, row 19 is the last student.
  // Row 20 is the council row inside the table.
  // Row 21 & 22 are empty.
  // Row 23 is the signature row (endRow + 4 = 19 + 4 = 23).
  
  for (let r = 19; r <= 30; r++) {
    const row = sheet.getRow(r);
    console.log(`\nRow ${r}:`);
    for (let c = 1; c <= 25; c++) {
      const cell = row.getCell(c);
      const val = cell.value;
      const border = cell.border;
      const mergeMaster = cell.master && cell.master.address !== cell.address ? cell.master.address : null;
      
      if (val !== null || border || mergeMaster) {
        let borderStr = '';
        if (border) {
          borderStr = `[Border: ${Object.keys(border).join(',')}]`;
        }
        console.log(`  Col ${c} (${cell.address}): value=${JSON.stringify(val)} master=${mergeMaster} ${borderStr}`);
      }
    }
  }
}

run().catch(console.error);
