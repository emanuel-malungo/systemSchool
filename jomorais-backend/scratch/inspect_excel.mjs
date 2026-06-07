import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const templatePath = 'c:\\Users\\User\\Videos\\project\\backend\\systemSchool\\PROJECT PEDAGOGICO\\MODELOS DE PAUTAS DO 1ª E 2ª TRIMESTRE\\1ª e 2ª trimestre  curso de analises clinicas\\11CL - AC-A-VESP.xlsx';

async function run() {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    console.log('Worksheets:', workbook.worksheets.map(w => w.name));
    
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      console.log('No worksheets found');
      return;
    }

    let outputText = '';
    outputText += `Sheet Name: ${sheet.name}\n`;
    outputText += `Max Row: ${sheet.actualRowCount}\n`;
    outputText += `Max Col: ${sheet.actualColumnCount}\n`;

    for (let r = 55; r <= 80; r++) {
      const row = sheet.getRow(r);
      const values = [];
      for (let c = 1; c <= 60; c++) {
        const cell = row.getCell(c);
        values.push({
          col: c,
          address: cell.address,
          value: cell.value,
          master: cell.master ? cell.master.address : null
        });
      }
      const filledValues = values.filter(v => v.value !== null);
      if (filledValues.length > 0) {
        outputText += `\nRow ${r}:\n`;
        filledValues.forEach(v => {
          outputText += `  Col ${v.col} (${v.address}): ${JSON.stringify(v.value)} ${v.master && v.master !== v.address ? `(Merged into ${v.master})` : ''}\n`;
        });
      }
    }

    fs.writeFileSync('scratch/inspect_output.txt', outputText);
    console.log('Saved inspection output to scratch/inspect_output.txt');
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
