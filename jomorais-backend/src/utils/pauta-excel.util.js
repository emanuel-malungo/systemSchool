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

  // Make grid lines visible
  sheet.views = [{ showGridLines: true }];

  // Base Styles
  const borderStyle = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF2F2F2' }
  };

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

  // Set heights for the logo/title rows
  sheet.getRow(1).height = 10;
  sheet.getRow(2).height = 18;
  sheet.getRow(3).height = 18;
  sheet.getRow(4).height = 18;
  sheet.getRow(5).height = 18;
  sheet.getRow(6).height = 12; // Spacer/Separator row
  sheet.getRow(7).height = 25; // Title row
  sheet.getRow(8).height = 18; // Subtitle row
  sheet.getRow(9).height = 10; // Spacing before cards
  sheet.getRow(10).height = 20;
  sheet.getRow(11).height = 20;
  sheet.getRow(12).height = 20;
  sheet.getRow(13).height = 20;

  // Row 1-4: Institution Name
  const titleVal = 'INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS';
  styleAndMergeRange('D2:R4', titleVal,
    { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF1F497D' } },
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

  // Row 5: Separator line
  styleAndMergeRange(`B5:${maxColLetter}5`, '', 
    null, null, 
    { bottom: { style: 'medium', color: { argb: 'FF1F497D' } } }, 
    null
  );

  // Row 7: Subtitle
  styleAndMergeRange('B7:R7', 'PAUTA DE APROVEITAMENTO ESCOLAR',
    { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF1F497D' } },
    null, null, { horizontal: 'left', vertical: 'middle' }
  );

  // Row 8: Area de formacao
  styleAndMergeRange('B8:R8', {
    richText: [
      { text: 'ÁREA DE FORMAÇÃO: ', font: { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF555555' } } },
      { text: 'SAÚDE', font: { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0070C0' } } }
    ]
  },
    null, null, null, { horizontal: 'left', vertical: 'middle' }
  );

  // --- LEFT CARD: O Director do Instituto ---
  styleAndMergeRange('B10:D10', 'O Director do Instituto',
    { name: 'Segoe UI', size: 10, bold: true, italic: true, color: { argb: 'FF555555' } },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  styleAndMergeRange('B11:D11', '________________________________________',
    { name: 'Segoe UI', size: 10, color: { argb: 'FF888888' } },
    null, null, { horizontal: 'center', vertical: 'bottom' }
  );

  const dirNameVal = (pautaData.instituicao?.director || 'GABRIEL PRÓSPERO MADIALA').toUpperCase();
  styleAndMergeRange('B12:D12', dirNameVal,
    { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF333333' } },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  styleAndMergeRange('B13:D13', `DATA ______ / ______ / ${new Date().getFullYear()}`,
    { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF555555' } },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  // --- MIDDLE CARD: Academic Metadata ---
  const cardFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F7FA' } };
  const cardBorderColor = 'FFD0D5DD';

  for (let r = 10; r <= 12; r++) {
    for (let c = 6; c <= 12; c++) {
      const cell = sheet.getCell(r, c);
      cell.fill = cardFill;
      const cellBorder = {};
      if (r === 10) cellBorder.top = { style: 'thin', color: { argb: cardBorderColor } };
      if (r === 12) cellBorder.bottom = { style: 'thin', color: { argb: cardBorderColor } };
      if (c === 6) cellBorder.left = { style: 'thin', color: { argb: cardBorderColor } };
      if (c === 12) cellBorder.right = { style: 'thin', color: { argb: cardBorderColor } };
      cell.border = cellBorder;
    }
  }

  // F10: CURSO Label
  const cellF10 = sheet.getCell('F10');
  cellF10.value = 'CURSO:';
  cellF10.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF555555' } };
  cellF10.alignment = { horizontal: 'right', vertical: 'middle' };

  // G10:L10: CURSO Value
  styleAndMergeRange('G10:L10', descCurso,
    { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF1F497D' } },
    cardFill, null, { horizontal: 'left', vertical: 'middle' }
  );

  // F11: CLASSE Label
  const cellF11 = sheet.getCell('F11');
  cellF11.value = 'CLASSE:';
  cellF11.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF555555' } };
  cellF11.alignment = { horizontal: 'right', vertical: 'middle' };

  // G11:H11: CLASSE Value
  styleAndMergeRange('G11:H11', descClasse,
    { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF333333' } },
    cardFill, null, { horizontal: 'left', vertical: 'middle' }
  );

  // I11: TURMA Label
  const cellI11 = sheet.getCell('I11');
  cellI11.value = 'TURMA:';
  cellI11.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF555555' } };
  cellI11.alignment = { horizontal: 'right', vertical: 'middle' };

  // J11:L11: TURMA Value
  styleAndMergeRange('J11:L11', descTurma,
    { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFF0000' } },
    cardFill, null, { horizontal: 'left', vertical: 'middle' }
  );

  // F12: PERÍODO Label
  const cellF12 = sheet.getCell('F12');
  cellF12.value = 'PERÍODO:';
  cellF12.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF555555' } };
  cellF12.alignment = { horizontal: 'right', vertical: 'middle' };

  // G12:H12: PERÍODO Value
  styleAndMergeRange('G12:H12', descPeriodo,
    { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF333333' } },
    cardFill, null, { horizontal: 'left', vertical: 'middle' }
  );

  // I12: ANO LECTIVO Label
  const cellI12 = sheet.getCell('I12');
  cellI12.value = 'ANO LECTIVO:';
  cellI12.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF555555' } };
  cellI12.alignment = { horizontal: 'right', vertical: 'middle' };

  // J12:L12: ANO LECTIVO Value
  styleAndMergeRange('J12:L12', descAno,
    { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF333333' } },
    cardFill, null, { horizontal: 'left', vertical: 'middle' }
  );

  // --- RIGHT CARD: Semester & Stats & Date ---
  for (let r = 10; r <= 12; r++) {
    for (let c = 14; c <= 18; c++) {
      const cell = sheet.getCell(r, c);
      cell.fill = cardFill;
      const cellBorder = {};
      if (r === 10) cellBorder.top = { style: 'thin', color: { argb: cardBorderColor } };
      if (r === 12) cellBorder.bottom = { style: 'thin', color: { argb: cardBorderColor } };
      if (c === 14) cellBorder.left = { style: 'thin', color: { argb: cardBorderColor } };
      if (c === 18) cellBorder.right = { style: 'thin', color: { argb: cardBorderColor } };
      cell.border = cellBorder;
    }
  }

  // N10: TRIMESTRE Label
  const cellN10 = sheet.getCell('N10');
  cellN10.value = 'TRIMESTRE:';
  cellN10.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF555555' } };
  cellN10.alignment = { horizontal: 'right', vertical: 'middle' };

  // O10:R10: TRIMESTRE Value
  styleAndMergeRange('O10:R10', descTrimestre,
    { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFF0000' } },
    cardFill, null, { horizontal: 'left', vertical: 'middle' }
  );

  // N11: ALUNOS Label
  const cellN11 = sheet.getCell('N11');
  cellN11.value = 'ALUNOS:';
  cellN11.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF555555' } };
  cellN11.alignment = { horizontal: 'right', vertical: 'middle' };

  // O11:R11: ALUNOS Value
  const countFormula = `CONCATENATE("Total: ", COUNTIF(${generoColLetter}17:${generoColLetter}${endRow},"M")+COUNTIF(${generoColLetter}17:${generoColLetter}${endRow},"F"), " (M: ", COUNTIF(${generoColLetter}17:${generoColLetter}${endRow},"M"), ", F: ", COUNTIF(${generoColLetter}17:${generoColLetter}${endRow},"F"), ")")`;
  styleAndMergeRange('O11:R11', { formula: countFormula },
    { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF1F497D' } },
    cardFill, null, { horizontal: 'left', vertical: 'middle' }
  );

  // N12: EMISSÃO Label
  const cellN12 = sheet.getCell('N12');
  cellN12.value = 'EMISSÃO:';
  cellN12.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF555555' } };
  cellN12.alignment = { horizontal: 'right', vertical: 'middle' };

  // O12:R12: EMISSÃO Value
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().substring(2)}`;
  styleAndMergeRange('O12:R12', formattedDate,
    { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF333333' } },
    cardFill, null, { horizontal: 'left', vertical: 'middle' }
  );

  // Setup base student table headers
  const headerPositions = [
    { cell: 'B14', val: 'Nº', merge: 'B14:B16' },
    { cell: 'C14', val: 'Nº PROC', merge: 'C14:C16' },
    { cell: 'D14', val: 'NOME', merge: 'D14:D16' },
    { cell: 'E14', val: 'DISCIPLINA A REPETIR', merge: 'E14:E16' }
  ];

  headerPositions.forEach(hp => {
    styleAndMergeRange(hp.merge, hp.val,
      { name: 'Calibri', size: 10, bold: true },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle', wrapText: true }
    );
  });

  // Reset colIndex for layout drawing (variables already calculated)
  colIndex = 6;

  disciplines.forEach(dName => {
    const colLetter1 = columnToLetter(colIndex);
    const colLetter2 = columnToLetter(colIndex + 1);
    const colLetter3 = columnToLetter(colIndex + 2);

    styleAndMergeRange(`${colLetter1}14:${colLetter3}14`, dName.toUpperCase(), 
      { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF005080' } },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle', wrapText: true }
    );

    styleAndMergeRange(`${colLetter1}15:${colLetter2}15`, 'FALTAS',
      { name: 'Calibri', size: 8, bold: true },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );

    styleAndMergeRange(`${colLetter3}15:${colLetter3}16`, `MT${codigoTrimestre}º`,
      { name: 'Calibri', size: 8, bold: true, color: { argb: 'FFC00000' } },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );

    styleAndMergeRange(`${colLetter1}16:${colLetter1}16`, 'J',
      { name: 'Calibri', size: 7, bold: true },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );

    styleAndMergeRange(`${colLetter2}16:${colLetter2}16`, 'I',
      { name: 'Calibri', size: 7, bold: true },
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

    for (let i = 0; i < 8; i++) {
      const cellStat = row.getCell(statsStartColIndex + i);
      cellStat.border = borderStyle;
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
    sheet.mergeCells(`${colLetter}${startRow}:${colLetter}${endRow}`);
    const cell = sheet.getCell(`${colLetter}${startRow}`);
    cell.value = { formula: f.formula };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: (f.offset % 2 === 0) ? 'FF0070C0' : 'FFC00000' } };
  });

  sheet.getColumn('A').width = 2; // Margem
  sheet.getColumn('B').width = 4; // Nº
  sheet.getColumn('C').width = 10; // Nº PROC
  sheet.getColumn('D').width = 30; // NOME
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
    sheet.getColumn(statsStartColIndex + i).width = 6;
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
