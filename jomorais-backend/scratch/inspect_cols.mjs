import ExcelJS from 'exceljs';

async function main() {
  const workbook = new ExcelJS.Workbook();
  const filePath = 'C:\\Users\\User\\Videos\\project\\backend\\systemSchool\\PROJECT PEDAGOGICO\\MODELOS DE PAUTAS DO 1ª E 2ª TRIMESTRE\\1ª e 2ª trimestre  curso de analises clinicas\\11CL - AC-A-VESP.xlsx';
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  console.log("== Merged Ranges ==");
  for (const merge of Object.values(sheet._merges)) {
    console.log(`Merge: ${merge.model.left}:${merge.model.top} to ${merge.model.right}:${merge.model.bottom}`);
  }

  console.log("== Cell J11 ==");
  const cellJ11 = sheet.getCell('J11');
  console.log(JSON.stringify(cellJ11.value, null, 2));

  console.log("== Cell H11 ==");
  const cellH11 = sheet.getCell('H11');
  console.log(JSON.stringify(cellH11.value, null, 2));
}
main().catch(console.error);
