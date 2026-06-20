import ExcelJS from 'exceljs';

async function main() {
  const workbook = new ExcelJS.Workbook();
  const filePath = 'C:\\Users\\User\\Videos\\project\\backend\\systemSchool\\PROJECT PEDAGOGICO\\MODELOS DE PAUTAS DO 1ª E 2ª TRIMESTRE\\1ª e 2ª trimestre  curso de analises clinicas\\11CL - AC-A-VESP.xlsx';
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const cells = ['E14'];
  cells.forEach(c => {
    const cell = sheet.getCell(c);
    console.log(`${c}: value=${cell.value}, font=${JSON.stringify(cell.font)}, alignment=${JSON.stringify(cell.alignment)}`);
  });
}
main().catch(console.error);
