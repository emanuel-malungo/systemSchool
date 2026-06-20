import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

function columnToLetter(column) {
  let temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function abbreviateDiscipline(name) {
  if (!name) return '';
  const map = {
    'LÍNGUA PORTUGUESA': 'L. Port.',
    'MATEMÁTICA': 'Mat.',
    'BIOLOGIA': 'Biol.',
    'INGLÊS': 'Inglês',
    'QUÍMICA ORGÂNICA': 'Qca Org.',
    'MICROBIOLOGIA': 'Microbiol.',
    'HEMATOLOGIA': 'Hemat.',
    'IMUNOLOGIA': 'Imunol.',
    'URINÁLISE': 'Urinol.',
    'URINOLOGIA': 'Urinol.',
    'PARASITOLOGIA': 'Parasitol.',
    'EDUCAÇÃO FÍSICA': 'Ed. Física',
    'ANATOMIA E FISIOLOGIA HUMANA': 'A.F.H',
    'FÍSICA': 'Física',
    'QUÍMICA': 'Química',
    'INFORMÁTICA': 'Inform.',
    'EMPREENDEDORISMO': 'Empreend.',
    'GEOGRAFIA': 'Geog.',
    'HISTÓRIA': 'Hist.'
  };
  
  const upperName = name.toUpperCase().trim();
  if (map[upperName]) return map[upperName];
  
  // Generic fallback if not mapped
  if (name.length > 10) {
    return name.substring(0, 1).toUpperCase() + name.substring(1, 8).toLowerCase() + '.';
  }
  return name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase();
}

export async function buildPautaExcelTemplate(params) {
  const {
    pautaData,
    codigoTrimestre,
    descClasse,
    descCurso,
    descPeriodo,
    descTurma,
    descTrimestre,
    descAno,
    totalM,
    totalF
  } = params;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('PAUTA');

  // Hide grid lines to make the background clean white
  sheet.views = [{ showGridLines: false }];

  // Base Styles
  const borderStyle = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  const headerFill = null;

  // Helper for merging and styling range
  function styleAndMergeRange(rangeStr, val, font, fill, border, alignment) {
    sheet.mergeCells(rangeStr);
    const [startCell, endCell] = rangeStr.split(':');
    const start = sheet.getCell(startCell);
    const end = sheet.getCell(endCell || startCell);
    
    const startCol = start.col;
    const startRow = start.row;
    const endCol = end.col;
    const endRow = end.row;
    
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = sheet.getCell(r, c);
        if (border) cell.border = border;
        if (fill) cell.fill = fill;
        if (font) cell.font = font;
        if (alignment) cell.alignment = alignment;
      }
    }
    if (val !== undefined && val !== null) {
      start.value = val;
    }
  }

  // Get unique disciplines
  const allDisciplinesSet = new Set();
  for (const info of Object.values(pautaData.pauta)) {
    if (info.disciplinas) {
      info.disciplinas.forEach(d => allDisciplinesSet.add(d.disciplina));
    }
  }
  const disciplines = Array.from(allDisciplinesSet).sort();

  // Calculate dynamic column indices and variables in advance
  let colIndex = 6;
  const disciplineColsMap = {};
  disciplines.forEach(dName => {
    disciplineColsMap[dName] = { 
      justColIdx: colIndex, 
      injustColIdx: colIndex + 1, 
      gradeColIdx: colIndex + 2 
    };
    colIndex += 3;
  });

  let obsColLetter = columnToLetter(colIndex);
  let mediaColLetter = columnToLetter(colIndex + 1);
  let idadeColLetter = columnToLetter(colIndex + 2);
  let generoColLetter = columnToLetter(colIndex + 3);
  let statsStartColIndex = colIndex + 4;

  const maxColIndex = 5 + (3 * disciplines.length) + 4 + 8;
  const maxColLetter = columnToLetter(maxColIndex);
  const endRow = 17 + pautaData.totalAlunos - 1;

  // Set heights for the logo/title rows matching the template
  sheet.getRow(1).height = 10;
  sheet.getRow(2).height = 18;
  sheet.getRow(3).height = 18;
  sheet.getRow(4).height = 18;
  sheet.getRow(5).height = 18;
  sheet.getRow(6).height = 12; // Spacer/Separator row
  sheet.getRow(7).height = 30; // Title row
  sheet.getRow(8).height = 25; // Subtitle row
  sheet.getRow(9).height = 16.5; 
  sheet.getRow(10).height = 18;
  sheet.getRow(11).height = 20.25;
  sheet.getRow(12).height = 19.5;
  sheet.getRow(13).height = 20.25;

  // Dynamic header width ending exactly at the OBS column index (minimum 42 to prevent card overlap)
  const headerMaxColIndex = Math.max(colIndex, 42);
  const headerMaxColLetter = columnToLetter(headerMaxColIndex);

  // Row 1-4: Institution Name next to logo
  const titleVal = 'INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS';
  styleAndMergeRange(`D2:${headerMaxColLetter}4`, titleVal,
    { name: 'Calibri', size: 20, bold: true },
    null, null, { horizontal: 'left', vertical: 'middle' }
  );

  // Add Logo (icon.png)
  const logoPath = path.join(process.cwd(), 'src/assets/icon.png');
  if (fs.existsSync(logoPath)) {
    const logoId = workbook.addImage({
      filename: logoPath,
      extension: 'png'
    });
    sheet.addImage(logoId, {
      tl: { col: 1.1, row: 1.1 },
      ext: { width: 55, height: 55 }
    });
  }

  // Row 5: Separator line (Green)
  styleAndMergeRange(`B5:${headerMaxColLetter}5`, '', 
    null, null, 
    { bottom: { style: 'medium', color: { argb: 'FF385723' } } }, 
    null
  );

  // Row 7: Title
  styleAndMergeRange(`B7:${headerMaxColLetter}7`, 'PAUTA DE APROVEITAMENTO ESCOLAR',
    { name: 'Arial Rounded MT Bold', size: 20, bold: true },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  // Row 8: Area de formacao
  styleAndMergeRange(`C8:${headerMaxColLetter}8`, {
    richText: [
      { text: 'ÁREA DE FORMAÇÃO: ', font: { name: 'Algerian', size: 18, bold: true } },
      { text: 'SAÚDE', font: { name: 'Algerian', size: 18, bold: true, color: { argb: 'FF0070C0' } } }
    ]
  },
    null, null, null, { horizontal: 'center', vertical: 'middle' }
  );

  // --- METADATA CARDS LAYOUT CALCULATION (Rows 9-12) ---
  const leftStartCol = 2; // B
  const leftEndCol = 4;   // D
  
  // Dynamic columns for metadata to scale based on sheet width
  const classStartCol = 7; // G
  const classEndCol = 14;  // N (Widened significantly to fit very long turma names)
  
  const dateEndCol = headerMaxColIndex;
  const dateStartCol = headerMaxColIndex - 3;
  
  const statsCardEndCol = dateStartCol - 1;
  const statsCardStartCol = statsCardEndCol - 1;
  
  const periodEndCol = statsCardStartCol - 1;
  const periodStartCol = periodEndCol - 3;
  
  let courseStartCol = classEndCol + 2; // P (16)
  let courseEndCol = periodStartCol - 2;
  if (courseEndCol < courseStartCol) {
    courseEndCol = courseStartCol + 3;
  }

  const classStartColLetter = columnToLetter(classStartCol);
  const classEndColLetter = columnToLetter(classEndCol);
  const courseStartColLetter = columnToLetter(courseStartCol);
  const courseEndColLetter = columnToLetter(courseEndCol);
  const periodStartColLetter = columnToLetter(periodStartCol);
  const periodEndColLetter = columnToLetter(periodEndCol);
  const statsCardStartColLetter = columnToLetter(statsCardStartCol);
  const statsCardEndColLetter = columnToLetter(statsCardEndCol);
  const dateStartColLetter = columnToLetter(dateStartCol);
  const dateEndColLetter = columnToLetter(dateEndCol);

  // --- LEFT SIGNATURE: O Director do Instituto ---
  styleAndMergeRange('B10:D10', 'O Director do Instituto',
    { name: 'Blackadder ITC', size: 12, bold: true, color: { argb: 'FF000000' } },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  // Signature line as text instead of empty cell bottom border
  styleAndMergeRange('B11:D11', '____________________________',
    { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } },
    null, null, { horizontal: 'center', vertical: 'bottom' }
  );

  const dirNameVal = (pautaData.instituicao?.director || 'GABRIEL PRÓSPERO MABIALA').toUpperCase();
  styleAndMergeRange('B12:D12', dirNameVal,
    { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF000000' } },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  styleAndMergeRange('B13:D13', `DATA ____ / ____ / 2026`,
    { name: 'Agency FB', size: 11, bold: true, color: { argb: 'FF000000' } },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  // --- CLASS / TURMA CARD (Rows 9-10 and 11-12, no gaps, left aligned) ---
  styleAndMergeRange(`${classStartColLetter}9:${classEndColLetter}10`, descClasse,
    { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0070C0' } },
    null, null, { horizontal: 'left', vertical: 'middle' }
  );

  const turmaLabelEndCol = classStartCol + 1;
  const turmaLabelEndColLetter = columnToLetter(turmaLabelEndCol);
  const turmaValStartCol = turmaLabelEndCol + 1;
  const turmaValStartColLetter = columnToLetter(turmaValStartCol);

  styleAndMergeRange(`${classStartColLetter}11:${turmaLabelEndColLetter}12`, 'TURMA:',
    { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0070C0' } },
    null, null, { horizontal: 'left', vertical: 'middle' }
  );

  styleAndMergeRange(`${turmaValStartColLetter}11:${classEndColLetter}12`, descTurma,
    { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFF0000' } },
    null, null, { horizontal: 'left', vertical: 'middle' }
  );

  // --- COURSE CARD (Centered, rows 9-12 merged, richText with black CURSO: and blue course name) ---
  styleAndMergeRange(`${courseStartColLetter}9:${courseEndColLetter}12`, {
    richText: [
      { text: 'CURSO: ', font: { name: 'Calibri', size: 26, bold: true, color: { argb: 'FF000000' } } },
      { text: descCurso.toUpperCase(), font: { name: 'Calibri', size: 26, bold: true, color: { argb: 'FF0070C0' } } }
    ]
  },
    null, 
    null,
    { bottom: { style: 'thin', color: { argb: 'FF000000' } } }, 
    { horizontal: 'center', vertical: 'middle' }
  );

  // --- PERIOD / SEMESTER / YEAR CARD (Right Aligned, Calibri 14/12) ---
  styleAndMergeRange(`${periodStartColLetter}9:${periodEndColLetter}9`, {
    richText: [
      { text: 'PERÍODO: ', font: { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0070C0' } } },
      { text: descPeriodo.toUpperCase(), font: { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFF0000' } } }
    ]
  },
    null, null, null, { horizontal: 'right', vertical: 'middle' }
  );

  const trimParts = descTrimestre.split(' ');
  const trimNum = trimParts[0] || '1º';
  const trimLabel = trimParts.slice(1).join(' ') || 'TRIMESTRE';
  styleAndMergeRange(`${periodStartColLetter}10:${periodEndColLetter}11`, {
    richText: [
      { text: trimNum, font: { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0070C0' } } },
      { text: ' ' },
      { text: trimLabel.toUpperCase(), font: { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFF0000' } } }
    ]
  },
    null, null, null, { horizontal: 'right', vertical: 'middle' }
  );

  styleAndMergeRange(`${columnToLetter(periodStartCol - 1)}12:${periodEndColLetter}12`, {
    richText: [
      { text: 'ANO LECTIVO: ', font: { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF0070C0' } } },
      { text: descAno.toUpperCase(), font: { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFF0000' } } }
    ]
  },
    null, null, null, { horizontal: 'right', vertical: 'middle' }
  );

  // --- STATS CARD (2 Columns, Center Aligned, Calibri 14 Bold) ---
  // Label Column
  const cellMFLabel = sheet.getCell(`${statsCardStartColLetter}10`);
  cellMFLabel.value = 'MF:';
  cellMFLabel.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF000000' } };
  cellMFLabel.alignment = { horizontal: 'center', vertical: 'middle' };

  const cellMLabel = sheet.getCell(`${statsCardStartColLetter}11`);
  cellMLabel.value = 'M:';
  cellMLabel.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF000000' } };
  cellMLabel.alignment = { horizontal: 'center', vertical: 'middle' };

  const cellFLabel = sheet.getCell(`${statsCardStartColLetter}12`);
  cellFLabel.value = 'F:';
  cellFLabel.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF000000' } };
  cellFLabel.alignment = { horizontal: 'center', vertical: 'middle' };

  // Formula Column
  const cellMFValue = sheet.getCell(`${statsCardEndColLetter}10`);
  cellMFValue.value = { formula: `COUNTIF(${generoColLetter}17:${generoColLetter}${endRow},"M")+COUNTIF(${generoColLetter}17:${generoColLetter}${endRow},"F")` };
  cellMFValue.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0070C0' } };
  cellMFValue.alignment = { horizontal: 'center', vertical: 'middle' };

  const cellMValue = sheet.getCell(`${statsCardEndColLetter}11`);
  cellMValue.value = { formula: `COUNTIF(${generoColLetter}17:${generoColLetter}${endRow},"M")` };
  cellMValue.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF000000' } };
  cellMValue.alignment = { horizontal: 'center', vertical: 'middle' };

  const cellFValue = sheet.getCell(`${statsCardEndColLetter}12`);
  cellFValue.value = { formula: `COUNTIF(${generoColLetter}17:${generoColLetter}${endRow},"F")` };
  cellFValue.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFF0000' } };
  cellFValue.alignment = { horizontal: 'center', vertical: 'middle' };

  // --- DATE BOX ---
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().substring(2)}`;
  
  const dateBorder = {
    top: { style: 'medium', color: { argb: 'FF000000' } },
    left: { style: 'medium', color: { argb: 'FF000000' } },
    bottom: { style: 'medium', color: { argb: 'FF000000' } },
    right: { style: 'medium', color: { argb: 'FF000000' } }
  };
  
  styleAndMergeRange(`${dateStartColLetter}10:${dateEndColLetter}12`, formattedDate,
    { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0070C0' } },
    null, dateBorder, { horizontal: 'center', vertical: 'middle' }
  );

  // Setup base student table headers
  const headerPositions = [
    { cell: 'B14', val: 'Nº', merge: 'B14:B16', rotate: true },
    { cell: 'C14', val: 'Nº PROC', merge: 'C14:C16', rotate: true },
    { cell: 'D14', val: 'NOME', merge: 'D14:D16', rotate: false },
    { cell: 'E14', val: 'DISCIPLINA A REPETIR', merge: 'E14:E16', rotate: false }
  ];

  headerPositions.forEach(hp => {
    const alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    if (hp.rotate) {
      alignment.textRotation = 45;
    }
    styleAndMergeRange(hp.merge, hp.val,
      { name: 'Calibri', size: 9, bold: true, italic: true },
      headerFill, borderStyle, alignment
    );
  });

  // Reset colIndex for layout drawing (variables already calculated)
  colIndex = 6;

  disciplines.forEach(dName => {
    const colLetter1 = columnToLetter(colIndex);
    const colLetter2 = columnToLetter(colIndex + 1);
    const colLetter3 = columnToLetter(colIndex + 2);

    styleAndMergeRange(`${colLetter1}14:${colLetter3}14`, abbreviateDiscipline(dName), 
      { name: 'Agency FB', size: 9, bold: true, color: { argb: 'FF0070C0' } },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle', wrapText: true }
    );

    styleAndMergeRange(`${colLetter1}15:${colLetter2}15`, 'FALTAS',
      { name: 'Calibri', size: 8, bold: true, italic: true },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );

    styleAndMergeRange(`${colLetter3}15:${colLetter3}16`, `MT${codigoTrimestre}º`,
      { name: 'Calibri', size: 10, bold: true, italic: true, color: { argb: 'FFFF0000' } },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );

    styleAndMergeRange(`${colLetter1}16:${colLetter1}16`, 'J',
      { name: 'Calibri', size: 8, bold: true, italic: true },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );

    styleAndMergeRange(`${colLetter2}16:${colLetter2}16`, 'I',
      { name: 'Calibri', size: 8, bold: true, italic: true },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );

    disciplineColsMap[dName] = { 
      justColIdx: colIndex, 
      injustColIdx: colIndex + 1, 
      gradeColIdx: colIndex + 2 
    };

    colIndex += 3;
  });

  obsColLetter = columnToLetter(colIndex);
  mediaColLetter = columnToLetter(colIndex + 1);
  idadeColLetter = columnToLetter(colIndex + 2);
  generoColLetter = columnToLetter(colIndex + 3);

  const extraCols = [
    { letter: obsColLetter, val: 'OBS' },
    { letter: mediaColLetter, val: 'MÉDIA' },
    { letter: idadeColLetter, val: 'Idade' },
    { letter: generoColLetter, val: 'Género' }
  ];

  extraCols.forEach(col => {
    styleAndMergeRange(`${col.letter}14:${col.letter}16`, col.val,
      { name: 'Calibri', size: 10, bold: true },
      headerFill, borderStyle, 
      { horizontal: 'center', vertical: 'middle', textRotation: col.val === 'Idade' || col.val === 'Género' ? 90 : 0 }
    );
  });

  statsStartColIndex = colIndex + 4;
  const statsStartCol = columnToLetter(statsStartColIndex);
  const statsEndCol = columnToLetter(statsStartColIndex + 7);

  styleAndMergeRange(`${statsStartCol}14:${statsEndCol}14`, 'DADOS ESTATÍSTICOS',
    { name: 'Calibri', size: 11, bold: true },
    headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
  );

  const statCategories = [
    { label: 'MATRICULADOS', offset: 0 },
    { label: 'TRANSITA', offset: 2 },
    { label: 'N/TRANSITA', offset: 4 },
    { label: 'Desistido/a', offset: 6 }
  ];

  statCategories.forEach(cat => {
    const colL1 = columnToLetter(statsStartColIndex + cat.offset);
    const colL2 = columnToLetter(statsStartColIndex + cat.offset + 1);
    styleAndMergeRange(`${colL1}15:${colL2}15`, cat.label,
      { name: 'Calibri', size: 8, bold: true },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );
  });

  for (let i = 0; i < 8; i++) {
    const colL = columnToLetter(statsStartColIndex + i);
    styleAndMergeRange(`${colL}16:${colL}16`, i % 2 === 0 ? 'M' : 'F',
      { name: 'Calibri', size: 8, bold: true },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );
  }

  sheet.getRow(14).height = 25;
  sheet.getRow(15).height = 18;
  sheet.getRow(16).height = 15;

  let stats = {
    matriculados: { m: 0, f: 0 },
    transita: { m: 0, f: 0 },
    nTransita: { m: 0, f: 0 },
    desistidos: { m: 0, f: 0 }
  };

  let rowNum = 17;
  let index = 1;

  for (const [alunoId, info] of Object.entries(pautaData.pauta)) {
    const row = sheet.getRow(rowNum);
    row.height = 20;

    const cellB = row.getCell(2);
    cellB.value = index;
    cellB.alignment = { horizontal: 'center', vertical: 'middle' };
    cellB.border = borderStyle;
    cellB.font = { name: 'Calibri', size: 9 };

    const cellC = row.getCell(3);
    cellC.value = parseInt(info.aluno?.codigo) || index;
    cellC.alignment = { horizontal: 'center', vertical: 'middle' };
    cellC.border = borderStyle;
    cellC.font = { name: 'Calibri', size: 9 };

    const cellD = row.getCell(4);
    cellD.value = (info.aluno?.nome || 'N/A').toUpperCase();
    cellD.alignment = { horizontal: 'left', vertical: 'middle' };
    cellD.border = borderStyle;
    cellD.font = { name: 'Calibri', size: 9, bold: true };

    const repeatDiscs = [];

    disciplines.forEach(dName => {
      const dObj = info.disciplinas?.find(d => d.disciplina === dName);
      const { justColIdx, injustColIdx, gradeColIdx } = disciplineColsMap[dName];

      const cellJust = row.getCell(justColIdx);
      cellJust.value = '-';
      cellJust.border = borderStyle;
      cellJust.alignment = { horizontal: 'center', vertical: 'middle' };
      cellJust.font = { name: 'Calibri', size: 9, color: { argb: 'FF7F7F7F' } };

      const cellInjust = row.getCell(injustColIdx);
      cellInjust.border = borderStyle;
      cellInjust.alignment = { horizontal: 'center', vertical: 'middle' };
      if (dObj && dObj.faltas !== undefined && dObj.faltas > 0) {
        cellInjust.value = dObj.faltas;
        cellInjust.font = { name: 'Calibri', size: 9 };
      } else {
        cellInjust.value = '-';
        cellInjust.font = { name: 'Calibri', size: 9, color: { argb: 'FF7F7F7F' } };
      }

      const cellG = row.getCell(gradeColIdx);
      cellG.border = borderStyle;
      cellG.alignment = { horizontal: 'center', vertical: 'middle' };

      if (dObj && dObj.nota !== undefined && dObj.nota !== null) {
        const n = dObj.nota;
        cellG.value = n;
        cellG.numFmt = '0.0';
        if (n < 10) {
          cellG.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFF0000' } };
          repeatDiscs.push(dName.substring(0, 5));
        } else {
          cellG.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF0070C0' } };
        }
      } else {
        cellG.value = '-';
        cellG.font = { name: 'Calibri', size: 9, color: { argb: 'FF7F7F7F' } };
      }
    });

    const cellE = row.getCell(5);
    cellE.value = repeatDiscs.join(', ');
    cellE.font = { name: 'Calibri', size: 8, italic: true };
    cellE.alignment = { horizontal: 'center', vertical: 'middle' };
    cellE.border = borderStyle;

    const birthYear = info.aluno?.dataNascimento ? new Date(info.aluno.dataNascimento).getFullYear() : 0;
    const currentYear = new Date().getFullYear();
    const idade = birthYear > 0 ? currentYear - birthYear : '-';
    const generoRaw = info.aluno?.sexo?.toUpperCase() || '';
    const genero = (generoRaw === 'M' || generoRaw.startsWith('MASC')) ? 'M' : ((generoRaw === 'F' || generoRaw.startsWith('FEM') || generoRaw === 'W') ? 'F' : '-');
    const isM = genero === 'M';
    const isF = genero === 'F';
    const isDesistente = info.aluno?.codigo_Status !== 1;

    if (isM) stats.matriculados.m++;
    if (isF) stats.matriculados.f++;
    if (isDesistente) {
      if (isM) stats.desistidos.m++;
      if (isF) stats.desistidos.f++;
    }

    const cellObs = row.getCell(colIndex);
    cellObs.border = borderStyle;
    cellObs.alignment = { horizontal: 'center', vertical: 'middle' };

    const cellMedia = row.getCell(colIndex + 1);
    cellMedia.border = borderStyle;
    cellMedia.alignment = { horizontal: 'center', vertical: 'middle' };

    const cellIdade = row.getCell(colIndex + 2);
    cellIdade.border = borderStyle;
    cellIdade.alignment = { horizontal: 'center', vertical: 'middle' };
    cellIdade.value = idade;
    cellIdade.font = { name: 'Calibri', size: 9 };

    const cellGenero = row.getCell(colIndex + 3);
    cellGenero.border = borderStyle;
    cellGenero.alignment = { horizontal: 'center', vertical: 'middle' };
    cellGenero.value = genero;
    cellGenero.font = { name: 'Calibri', size: 9 };

    const hasGrades = info.disciplinas?.some(d => d.nota !== null);
    const media = info.mediaGeral || 0;

    if (hasGrades) {
      const gradeCells = disciplines.map(dName => {
        const { gradeColIdx } = disciplineColsMap[dName];
        return `${columnToLetter(gradeColIdx)}${rowNum}`;
      });
      
      cellMedia.value = { formula: `AVERAGE(${gradeCells.join(',')})` };
      cellMedia.numFmt = '0.0';
      cellMedia.font = { name: 'Calibri', size: 9, bold: true, color: { argb: media < 10 ? 'FFFF0000' : 'FF0070C0' } };

      if (!isDesistente) {
        if (info.situacao === 'TRANS') {
          cellObs.value = 'TRANSITA';
          cellObs.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF0070C0' } };
          if (isM) stats.transita.m++;
          if (isF) stats.transita.f++;
        } else {
          cellObs.value = 'N/TRANSITA';
          cellObs.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFF0000' } };
          if (isM) stats.nTransita.m++;
          if (isF) stats.nTransita.f++;
        }
      }
    } else {
      cellMedia.value = '-';
    }

    if (isDesistente) {
      cellObs.value = isM ? 'DESISTIDO' : 'DESISTIDA';
      cellObs.font = { name: 'Calibri', size: 9, bold: true, italic: true, color: { argb: 'FF7F7F7F' } };
      cellMedia.value = '-';
    } else if (!hasGrades) {
      cellObs.value = '-';
    }

    index++;
    rowNum++;
  }

  const startRow = 17;
  const genderColLetter = columnToLetter(colIndex + 3);
  const obsColLetterReal = columnToLetter(colIndex);

  const formulas = [
    { offset: 0, formula: `COUNTIF(${genderColLetter}${startRow}:${genderColLetter}${endRow},"M")` },
    { offset: 1, formula: `COUNTIF(${genderColLetter}${startRow}:${genderColLetter}${endRow},"F")` },
    { offset: 2, formula: `COUNTIFS(${obsColLetterReal}${startRow}:${obsColLetterReal}${endRow},"TRANSITA",${genderColLetter}${startRow}:${genderColLetter}${endRow},"M")` },
    { offset: 3, formula: `COUNTIFS(${obsColLetterReal}${startRow}:${obsColLetterReal}${endRow},"TRANSITA",${genderColLetter}${startRow}:${genderColLetter}${endRow},"F")` },
    { offset: 4, formula: `COUNTIFS(${obsColLetterReal}${startRow}:${obsColLetterReal}${endRow},"N/TRANSITA",${genderColLetter}${startRow}:${genderColLetter}${endRow},"M")` },
    { offset: 5, formula: `COUNTIFS(${obsColLetterReal}${startRow}:${obsColLetterReal}${endRow},"N/TRANSITA",${genderColLetter}${startRow}:${genderColLetter}${endRow},"F")` },
    { offset: 6, formula: `COUNTIFS(${obsColLetterReal}${startRow}:${obsColLetterReal}${endRow},"DESISTIDO",${genderColLetter}${startRow}:${genderColLetter}${endRow},"M")` },
    { offset: 7, formula: `COUNTIFS(${obsColLetterReal}${startRow}:${obsColLetterReal}${endRow},"DESISTIDA",${genderColLetter}${startRow}:${genderColLetter}${endRow},"F")` }
  ];

  formulas.forEach(f => {
    const colLetter = columnToLetter(statsStartColIndex + f.offset);
    const cell = sheet.getCell(`${colLetter}${startRow}`);
    cell.value = { formula: f.formula };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: (f.offset % 2 === 0) ? 'FF0070C0' : 'FFC00000' } };
    cell.border = borderStyle;
  });

  sheet.getColumn('A').width = 2; // Margem
  sheet.getColumn('B').width = 4; // Nº
  sheet.getColumn('C').width = 10; // Nº PROC
  
  // Calculate flexible width for NOME column
  let maxNameLength = 30; // minimum
  for (const info of Object.values(pautaData.pauta)) {
    const nomeLen = (info.aluno?.nome || 'N/A').length;
    if (nomeLen > maxNameLength) {
      maxNameLength = nomeLen;
    }
  }
  sheet.getColumn('D').width = maxNameLength + 2; // NOME

  sheet.getColumn('E').width = 16; // DISCIPLINA A REPETIR
  
  disciplines.forEach(dName => {
    const { justColIdx, injustColIdx, gradeColIdx } = disciplineColsMap[dName];
    sheet.getColumn(justColIdx).width = 4;
    sheet.getColumn(injustColIdx).width = 4;
    sheet.getColumn(gradeColIdx).width = 7;
  });
  
  sheet.getColumn(obsColLetter).width = 12;
  sheet.getColumn(mediaColLetter).width = 9;
  sheet.getColumn(idadeColLetter).width = 7;
  sheet.getColumn(generoColLetter).width = 8;

  for (let i = 0; i < 8; i++) {
    sheet.getColumn(statsStartColIndex + i).width = 4;
  }

  let footRow = endRow + 2;
  styleAndMergeRange(`B${footRow}:F${footRow}`, `DATA DO CONSELHO DE TURMA ______ / ______ / ${new Date().getFullYear()}`,
    { name: 'Calibri', size: 11, bold: true },
    null, null, { horizontal: 'left', vertical: 'middle' }
  );

  footRow += 3;
  const obsColReal = columnToLetter(colIndex);
  const startSubDirColIdx = Math.max(12, colIndex - 15);
  const startSubDirCol = columnToLetter(startSubDirColIdx);
  const nomeDirTurma = pautaData.directorTurma?.tb_docente?.nome || '';
  const nomeSubdir = pautaData.instituicao?.subDirector || '';

  styleAndMergeRange(`B${footRow}:F${footRow}`, 'A Directora de Turma',
    { name: 'Calibri', size: 11, bold: true },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  styleAndMergeRange(`${startSubDirCol}${footRow}:${obsColReal}${footRow}`, 'O Subdirector Pedagógico',
    { name: 'Calibri', size: 11, bold: true },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  footRow++;
  styleAndMergeRange(`B${footRow}:F${footRow}`, '_____________________________________',
    { name: 'Calibri', size: 11 },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  styleAndMergeRange(`${startSubDirCol}${footRow}:${obsColReal}${footRow}`, '_____________________________________',
    { name: 'Calibri', size: 11 },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  footRow++;
  styleAndMergeRange(`B${footRow}:F${footRow}`, nomeDirTurma,
    { name: 'Calibri', size: 10, bold: true },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  styleAndMergeRange(`${startSubDirCol}${footRow}:${obsColReal}${footRow}`, nomeSubdir,
    { name: 'Calibri', size: 10, bold: true },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  for (let r = 14; r <= 16; r++) {
    for (let c = 2; c <= statsStartColIndex + 7; c++) {
      const cell = sheet.getRow(r).getCell(c);
      if (!cell.border) cell.border = borderStyle;
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
