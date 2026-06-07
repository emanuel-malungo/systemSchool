import { GradeManagementService } from '../src/services/grade-management.services.js';
import fs from 'fs';

async function test() {
  try {
    console.log('Generating Excel buffer for Turma 35, Trimestre 1, Ano Letivo 1...');
    const buffer = await GradeManagementService.exportPautaExcel(35, 1, 1);

    fs.writeFileSync('scratch/generated_pauta.xlsx', buffer);
    console.log('Successfully saved generated Excel to scratch/generated_pauta.xlsx');
  } catch (error) {
    console.error('Error generating Excel:', error);
  }
}

test();
