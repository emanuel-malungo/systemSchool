import fs from 'fs';

const filePath = 'src/utils/pauta-excel.util.js';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 499; i <= 645; i++) {
  if (lines[i].includes('Calibri')) {
    lines[i] = lines[i].replace(/Calibri/g, 'Arial Narrow');
  }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Font updated successfully.');
