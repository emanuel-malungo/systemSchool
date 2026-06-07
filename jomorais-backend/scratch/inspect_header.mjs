import ExcelJS from 'exceljs';

const templatePath = 'c:\\Users\\User\\Videos\\project\\backend\\systemSchool\\PROJECT PEDAGOGICO\\MODELOS DE PAUTAS DO 1ª E 2ª TRIMESTRE\\1ª e 2ª trimestre  curso de analises clinicas\\11CL - AC-A-VESP.xlsx';

async function run() {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const sheet = workbook.worksheets[1] || workbook.worksheets[0]; // Let's check sheet 2 (index 1) which was shown in screenshot tab 2
    console.log('Using worksheet:', sheet.name);

    for (let r = 1; r <= 13; r++) {
      const row = sheet.getRow(r);
      console.log(`\n--- Row ${r} (Height: ${row.height}) ---`);
      for (let c = 1; c <= 54; c++) {
        const cell = row.getCell(c);
        if (cell.value !== null && cell.value !== undefined) {
          const isMaster = cell.master ? (cell.master.address === cell.address) : true;
          if (isMaster) {
            console.log(`Cell ${cell.address}:`);
            console.log(`  Value:`, JSON.stringify(cell.value));
            console.log(`  Font:`, cell.font ? { name: cell.font.name, size: cell.font.size, bold: cell.font.bold, color: cell.font.color } : 'None');
            console.log(`  Alignment:`, cell.alignment);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
