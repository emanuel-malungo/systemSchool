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

export async function buildPautaGeralExcelTemplate(params) {
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
  let colIndex = 5; // Starts at E for first discipline
  const disciplineColsMap = {};
  disciplines.forEach(dName => {
    disciplineColsMap[dName] = { 
      gradeColIdx: colIndex 
    };
    colIndex += 1;
  });

  let obsColLetter = columnToLetter(colIndex);
  let mediaColLetter = columnToLetter(colIndex + 1);
  let idadeColLetter = columnToLetter(colIndex + 2);
  let generoColLetter = columnToLetter(colIndex + 3);
  let statsStartColIndex = colIndex + 4;

  const maxColIndex = 4 + disciplines.length + 3 + 8; // A-D (4), disciplines, OBS/Media/Genero (3), Stats (8)
  const maxColLetter = columnToLetter(maxColIndex);
  const endRow = 13 + Object.keys(pautaData.pauta).length;

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

  // Dynamic header width
  const headerMaxColIndex = Math.max(colIndex, 15);
  const headerMaxColLetter = columnToLetter(headerMaxColIndex);

  // Row 1: COMPLEXO ESCOLAR PRIVADO JOMORAIS
  const titleVal = 'COMPLEXO ESCOLAR PRIVADO JOMORAIS';
  styleAndMergeRange(`D1:${headerMaxColLetter}2`, titleVal,
    { name: 'Times New Roman', size: 18, bold: true },
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
      tl: { col: 1.1, row: 0.1 },
      ext: { width: 45, height: 45 }
    });
  }

  // Row 2: Separator line (Green)
  styleAndMergeRange(`A3:${headerMaxColLetter}3`, '', 
    null, null, 
    { bottom: { style: 'medium', color: { argb: 'FF385723' } } }, 
    null
  );

  // Row 4-6: Visto Director do Complexo
  styleAndMergeRange('B4:D4', 'Visto',
    { name: 'Times New Roman', size: 10, bold: true },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );
  styleAndMergeRange('B5:D5', 'Director do Complexo',
    { name: 'Times New Roman', size: 9 },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );
  const dirNameVal = (pautaData.instituicao?.director || 'GABRIEL PRÓSPERO MABIALA').toUpperCase();
  styleAndMergeRange('B6:D6', dirNameVal,
    { name: 'Times New Roman', size: 10, bold: true },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  // Row 8: Metadata (Ano Lectivo, Classe, Turma, Sala, Periodo, Trimestre)
  const dashedBorder = {
    top: { style: 'dashDot', color: { argb: 'FF000000' } },
    bottom: { style: 'dashDot', color: { argb: 'FF000000' } },
    left: { style: 'dashDot', color: { argb: 'FF000000' } },
    right: { style: 'dashDot', color: { argb: 'FF000000' } }
  };

  const metaVal = {
    richText: [
      { text: '  Ano Lectivo: ', font: { name: 'Times New Roman', size: 14, color: { argb: 'FF000000' }, bold: true } },
      { text: descAno, font: { name: 'Times New Roman', size: 14, color: { argb: 'FFFF0000' }, bold: true } },
      { text: '          ' },
      { text: descClasse.split(' ')[0] + ' ', font: { name: 'Times New Roman', size: 14, color: { argb: 'FFFF0000' }, bold: true } },
      { text: descClasse.split(' ').slice(1).join(' '), font: { name: 'Times New Roman', size: 14, color: { argb: 'FF000000' }, bold: true } },
      { text: '          Turma: ', font: { name: 'Times New Roman', size: 14, color: { argb: 'FF000000' }, bold: true } },
      { text: descTurma, font: { name: 'Times New Roman', size: 14, color: { argb: 'FFFF0000' }, bold: true } },
      { text: '          Sala: ', font: { name: 'Times New Roman', size: 14, color: { argb: 'FF000000' }, bold: true } },
      { text: 'B1', font: { name: 'Times New Roman', size: 14, color: { argb: 'FFFF0000' }, bold: true } },
      { text: '          Período: ', font: { name: 'Times New Roman', size: 14, color: { argb: 'FF000000' }, bold: true } },
      { text: descPeriodo, font: { name: 'Times New Roman', size: 14, color: { argb: 'FFFF0000' }, bold: true } },
      { text: '                    ' },
      { text: descTrimestre, font: { name: 'Times New Roman', size: 14, color: { argb: 'FFFF0000' }, bold: true } }
    ]
  };

  styleAndMergeRange(`A8:${headerMaxColLetter}8`, metaVal,
    null,
    null, dashedBorder, { horizontal: 'left', vertical: 'middle' }
  );

  // Row 10: CURSO
  const cursoBorder = {
    right: { style: 'dashDot', color: { argb: 'FF000000' } }
  };
  styleAndMergeRange(`A10:${headerMaxColLetter}10`, `CURSO: ${descCurso.toUpperCase()}`,
    { name: 'Snap ITC', size: 12, bold: true },
    null, cursoBorder, { horizontal: 'center', vertical: 'middle' }
  );

  // Setup base student table headers
  const headerPositions = [
    { cell: 'B11', val: 'Nº', merge: 'B11:B12', rotate: false },
    { cell: 'C11', val: 'Nº MATRI', merge: 'C11:C12', rotate: false },
    { cell: 'D11', val: 'NOME COMPLETO', merge: 'D11:D12', rotate: false }
  ];

  headerPositions.forEach(hp => {
    const alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    styleAndMergeRange(hp.merge, hp.val,
      { name: 'Times New Roman', size: 10, bold: true },
      headerFill, borderStyle, alignment
    );
  });

  // Reset colIndex for layout drawing
  colIndex = 5;

  const firstDiscCol = columnToLetter(colIndex);
  const lastDiscCol = columnToLetter(colIndex + disciplines.length - 1);
  if (disciplines.length > 0) {
    styleAndMergeRange(`${firstDiscCol}11:${lastDiscCol}11`, 'DISCIPLINAS',
      { name: 'Times New Roman', size: 10, bold: true },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );
  }

  disciplines.forEach(dName => {
    const colL = columnToLetter(colIndex);

    styleAndMergeRange(`${colL}12:${colL}12`, abbreviateDiscipline(dName), 
      { name: 'Times New Roman', size: 10, bold: true },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle', wrapText: true }
    );

    disciplineColsMap[dName] = { 
      gradeColIdx: colIndex 
    };

    colIndex += 1;
  });

  obsColLetter = columnToLetter(colIndex);
  mediaColLetter = columnToLetter(colIndex + 1);
  generoColLetter = columnToLetter(colIndex + 2);

  const extraCols = [
    { letter: obsColLetter, val: 'Observação' },
    { letter: mediaColLetter, val: 'MÉDIA' },
    { letter: generoColLetter, val: 'Género' }
  ];

  extraCols.forEach(col => {
    let font = { name: 'Times New Roman', size: 10, bold: true };
    if (col.val === 'Género') {
      font = { name: 'Agency FB', size: 18, bold: true };
    }
    if (col.val === 'Observação') {
      font = { name: 'Times New Roman', size: 8, bold: true };
    }
    styleAndMergeRange(`${col.letter}11:${col.letter}12`, col.val,
      font,
      headerFill, borderStyle, 
      { horizontal: 'center', vertical: 'middle', textRotation: col.val === 'Observação' ? 45 : 0 }
    );
  });

  statsStartColIndex = colIndex + 3;
  const statsStartCol = columnToLetter(statsStartColIndex);
  const statsEndCol = columnToLetter(statsStartColIndex + 7);

  styleAndMergeRange(`${statsStartCol}11:${statsEndCol}11`, 'DADOS ESTATÍSTICOS',
    { name: 'Calibri', size: 12, bold: true },
    headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
  );

  const statCategories = [
    { label: 'MATRICULADOS', offset: 0, color: 'FF000000' },
    { label: 'TRANSITA', offset: 2, color: 'FF0070C0' },
    { label: 'N/TRANSITA', offset: 4, color: 'FFFF0000' },
    { label: 'Desistido/a', offset: 6, color: 'FFFF0000' }
  ];

  statCategories.forEach(cat => {
    const colL1 = columnToLetter(statsStartColIndex + cat.offset);
    const colL2 = columnToLetter(statsStartColIndex + cat.offset + 1);
    styleAndMergeRange(`${colL1}12:${colL2}12`, cat.label,
      { name: 'Times New Roman', size: 10, bold: true, color: { argb: cat.color } },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );
  });

  for (let i = 0; i < 8; i++) {
    const colL = columnToLetter(statsStartColIndex + i);
    styleAndMergeRange(`${colL}13:${colL}13`, i % 2 === 0 ? 'M' : 'F',
      { name: 'Times New Roman', size: 10, bold: true },
      headerFill, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );
  }

  sheet.getRow(11).height = 18;
  sheet.getRow(12).height = 25;
  sheet.getRow(13).height = 18;



  let rowNum = 14;
  let index = 1;

  for (const [alunoId, info] of Object.entries(pautaData.pauta)) {
    const row = sheet.getRow(rowNum);

    const cellB = row.getCell(2);
    cellB.value = index;
    cellB.alignment = { horizontal: 'center', vertical: 'middle' };
    cellB.border = borderStyle;
    cellB.font = { name: 'Arial Narrow', size: 9, bold: true };

    const cellC = row.getCell(3);
    cellC.value = parseInt(info.aluno?.codigo) || index;
    cellC.alignment = { horizontal: 'center', vertical: 'middle' };
    cellC.border = borderStyle;
    cellC.font = { name: 'Arial Narrow', size: 9 };

    const cellD = row.getCell(4);
    cellD.value = (info.aluno?.nome || 'N/A').toUpperCase();
    cellD.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    cellD.border = borderStyle;
    cellD.font = { name: 'Arial Narrow', size: 9, bold: true };

    disciplines.forEach(dName => {
      const dObj = info.disciplinas?.find(d => d.disciplina === dName);
      const { gradeColIdx } = disciplineColsMap[dName];

      const formatGradeCell = (cell, gradeVal, includeFailureRed) => {
        cell.border = borderStyle;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (gradeVal !== undefined && gradeVal !== null) {
          cell.value = gradeVal;
          cell.numFmt = '0.0';
          if (includeFailureRed && gradeVal < 10) {
            cell.font = { name: 'Arial Narrow', size: 9, bold: true, color: { argb: 'FFFF0000' } };
            return true;
          } else {
            cell.font = { name: 'Arial Narrow', size: 9, bold: true, color: { argb: 'FF0070C0' } };
          }
        } else {
          cell.value = '-';
          cell.font = { name: 'Arial Narrow', size: 9, color: { argb: 'FF7F7F7F' } };
        }
        return false;
      };

      const cellG = row.getCell(gradeColIdx);
      formatGradeCell(cellG, dObj ? dObj.nota : null, true);
    });

    const birthYear = info.aluno?.dataNascimento ? new Date(info.aluno.dataNascimento).getFullYear() : 0;
    const currentYear = new Date().getFullYear();
    const idade = birthYear > 0 ? currentYear - birthYear : '-';
    const generoRaw = info.aluno?.sexo?.toUpperCase() || '';
    const genero = (generoRaw === 'M' || generoRaw.startsWith('MASC')) ? 'M' : ((generoRaw === 'F' || generoRaw.startsWith('FEM') || generoRaw === 'W') ? 'F' : '-');
    const isM = genero === 'M';
    const isF = genero === 'F';
    const isDesistente = info.aluno?.codigo_Status !== 1;

    const cellObs = row.getCell(colIndex);
    cellObs.border = borderStyle;
    cellObs.alignment = { horizontal: 'center', vertical: 'middle' };

    const cellMedia = row.getCell(colIndex + 1);
    cellMedia.border = borderStyle;
    cellMedia.alignment = { horizontal: 'center', vertical: 'middle' };

    const cellGenero = row.getCell(colIndex + 2);
    cellGenero.border = borderStyle;
    cellGenero.alignment = { horizontal: 'center', vertical: 'middle' };
    cellGenero.value = genero;
    cellGenero.font = { name: 'Arial Narrow', size: 9 };

    const hasGrades = info.disciplinas?.some(d => d.nota !== null);
    const media = info.mediaGeral || 0;

    if (hasGrades) {
      const gradeCells = disciplines.map(dName => {
        const { gradeColIdx } = disciplineColsMap[dName];
        return `${columnToLetter(gradeColIdx)}${rowNum}`;
      });
      
      cellMedia.value = { formula: `AVERAGE(${gradeCells.join(',')})` };
      cellMedia.numFmt = '0.0';
      cellMedia.font = { name: 'Arial Narrow', size: 9, bold: true, color: { argb: media < 10 ? 'FFFF0000' : 'FF0070C0' } };

      if (!isDesistente) {
        if (info.situacao === 'TRANS') {
          cellObs.value = 'TRANSITA';
          cellObs.font = { name: 'Agency FB', size: 12, bold: true, color: { argb: 'FF0070C0' } };
        } else {
          cellObs.value = 'N/TRANSITA';
          cellObs.font = { name: 'Agency FB', size: 12, bold: true, color: { argb: 'FFFF0000' } };
        }
      }
    } else {
      cellMedia.value = '-';
    }

    if (isDesistente) {
      cellObs.value = isM ? 'DESISTIDO' : 'DESISTIDA';
      cellObs.font = { name: 'Agency FB', size: 12, bold: true, color: { argb: 'FFFF0000' } };
      cellMedia.value = '-';
    } else if (!hasGrades) {
      cellObs.value = '-';
    }

    index++;
    rowNum++;
  }

  // Add "DATA DO CONSELHO DE TURMA" row
  const councilRow = sheet.getRow(rowNum);
  councilRow.height = 25;
  for (let c = 2; c <= colIndex - 1; c++) {
    const cell = councilRow.getCell(c);
    cell.border = borderStyle;
  }
  
  sheet.mergeCells(`B${rowNum}:E${rowNum}`);
  const councilCell = councilRow.getCell(2); // B
  councilCell.value = 'DATA DO CONSELHO DE TURMA ______ / ______ / 2026';
  councilCell.font = { name: 'Calibri', size: 9 };
  councilCell.alignment = { horizontal: 'center', vertical: 'middle' };


  
  rowNum++;

  const dataStartRow = 14;
  const statsResultRow = 14;
  const obsColLetterReal = obsColLetter;
  const formulas = [
    { offset: 0, formula: `COUNTIF(${generoColLetter}${dataStartRow}:${generoColLetter}${endRow},"M")` },
    { offset: 1, formula: `COUNTIF(${generoColLetter}${dataStartRow}:${generoColLetter}${endRow},"F")` },
    { offset: 2, formula: `COUNTIFS(${obsColLetterReal}${dataStartRow}:${obsColLetterReal}${endRow},"TRANSITA",${generoColLetter}${dataStartRow}:${generoColLetter}${endRow},"M")` },
    { offset: 3, formula: `COUNTIFS(${obsColLetterReal}${dataStartRow}:${obsColLetterReal}${endRow},"TRANSITA",${generoColLetter}${dataStartRow}:${generoColLetter}${endRow},"F")` },
    { offset: 4, formula: `COUNTIFS(${obsColLetterReal}${dataStartRow}:${obsColLetterReal}${endRow},"N/TRANSITA",${generoColLetter}${dataStartRow}:${generoColLetter}${endRow},"M")` },
    { offset: 5, formula: `COUNTIFS(${obsColLetterReal}${dataStartRow}:${obsColLetterReal}${endRow},"N/TRANSITA",${generoColLetter}${dataStartRow}:${generoColLetter}${endRow},"F")` },
    { offset: 6, formula: `COUNTIFS(${obsColLetterReal}${dataStartRow}:${obsColLetterReal}${endRow},"DESISTIDO",${generoColLetter}${dataStartRow}:${generoColLetter}${endRow},"M")` },
    { offset: 7, formula: `COUNTIFS(${obsColLetterReal}${dataStartRow}:${obsColLetterReal}${endRow},"DESISTIDA",${generoColLetter}${dataStartRow}:${generoColLetter}${endRow},"F")` }
  ];

  formulas.forEach(f => {
    const colLetter = columnToLetter(statsStartColIndex + f.offset);
    const cell = sheet.getCell(`${colLetter}${statsResultRow}`);
    cell.value = { formula: f.formula };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: (f.offset % 2 === 0) ? 'FF0070C0' : 'FFC00000' } };
    cell.border = borderStyle;
  });

  const totalsRow = 15;
  statCategories.forEach(cat => {
    const colL1 = columnToLetter(statsStartColIndex + cat.offset);
    const colL2 = columnToLetter(statsStartColIndex + cat.offset + 1);
    styleAndMergeRange(`${colL1}${totalsRow}:${colL2}${totalsRow}`, { formula: `SUM(${colL1}${statsResultRow}:${colL2}${statsResultRow})` },
      { name: 'Times New Roman', size: 10, bold: true, color: { argb: cat.color } },
      null, borderStyle, { horizontal: 'center', vertical: 'middle' }
    );
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
  sheet.getColumn('D').width = Math.min(maxNameLength + 2, 45); // NOME

  disciplines.forEach(dName => {
    const { gradeColIdx } = disciplineColsMap[dName];
    sheet.getColumn(gradeColIdx).width = 7;
  });
  
  sheet.getColumn(obsColLetter).width = 12;
  sheet.getColumn(mediaColLetter).width = 9;
  sheet.getColumn(generoColLetter).width = 8;

  for (let i = 0; i < 8; i++) {
    sheet.getColumn(statsStartColIndex + i).width = 6;
  }

  // Find the student with the maximum grade to get their age
  let maxGradeVal = -1;
  let maxGradeAge = '';
  for (const info of Object.values(pautaData.pauta)) {
    const media = info.mediaGeral || 0;
    if (media > maxGradeVal) {
      maxGradeVal = media;
      const birthYear = info.aluno?.dataNascimento ? new Date(info.aluno.dataNascimento).getFullYear() : 0;
      const currentYear = new Date().getFullYear();
      maxGradeAge = birthYear > 0 ? (currentYear - birthYear) : '';
    }
  }

  // --- MÁXIMA TABLE BELOW STUDENT LIST ---
  let maxRow = endRow + 3;

  // Row 1
  styleAndMergeRange(`B${maxRow}:C${maxRow}`, 'MÁXIMA',
    { name: 'Times New Roman', size: 10, bold: true }, null, borderStyle, { horizontal: 'center', vertical: 'middle' }
  );

  styleAndMergeRange(`D${maxRow}:D${maxRow}`, { formula: `MAX(${mediaColLetter}14:${mediaColLetter}${endRow})` },
    { name: 'Times New Roman', size: 16, bold: true, color: { argb: 'FF0070C0' } }, null, borderStyle, { horizontal: 'center', vertical: 'middle' }
  );

  // Row 2
  maxRow += 1;
  styleAndMergeRange(`B${maxRow}:D${maxRow}`, 'NOME DO/A ALUNO/A',
    { name: 'Times New Roman', size: 9 }, null, borderStyle, { horizontal: 'center', vertical: 'middle' }
  );
  
  styleAndMergeRange(`E${maxRow}:${generoColLetter}${maxRow}`, { formula: `IFERROR(INDEX(D14:D${endRow}, MATCH(D${maxRow - 1}, ${mediaColLetter}14:${mediaColLetter}${endRow}, 0)), "")` },
    { name: 'Times New Roman', size: 9 }, null, borderStyle, { horizontal: 'center', vertical: 'middle' }
  );
  
  // Row 3
  maxRow += 1;
  styleAndMergeRange(`B${maxRow}:C${maxRow}`, '',
    { name: 'Times New Roman', size: 9 }, null, borderStyle, { horizontal: 'center', vertical: 'middle' }
  );
  styleAndMergeRange(`D${maxRow}:D${maxRow}`, maxGradeAge,
    { name: 'Times New Roman', size: 9 }, null, borderStyle, { horizontal: 'center', vertical: 'middle' }
  );

  // Row 4
  maxRow += 1;
  styleAndMergeRange(`B${maxRow}:C${maxRow}`, 'IDADE:',
    { name: 'Times New Roman', size: 9 }, null, borderStyle, { horizontal: 'center', vertical: 'middle' }
  );
  styleAndMergeRange(`D${maxRow}:D${maxRow}`, 'ANOS',
    { name: 'Times New Roman', size: 9 }, null, borderStyle, { horizontal: 'center', vertical: 'middle' }
  );

  // --- FOOTER ---
  let footRow = maxRow + 8; // Safely place the footer 8 rows below maxRow to prevent any overlap
  
  const nomeDirTurma = pautaData.directorTurma?.tb_docente?.nome || 'ANASTÁSIO ZOVO NZUZI';
  const nomeSubdir = pautaData.instituicao?.subDirector || 'ALBERTO SASSA TATI';

  // "COMPLEXO ESCOLAR PRIVADO JOMORAIS, 27 de março de 2026.-"
  const dateStrVal = {
    richText: [
      { text: 'COMPLEXO ESCOLAR PRIVADO JOMORAIS, ', font: { name: 'Times New Roman', size: 11, bold: false } },
      { text: '27 de março de 2026.-', font: { name: 'Times New Roman', size: 11, bold: true } }
    ]
  };
  
  // Center date text across the entire page (A to statsEndCol)
  styleAndMergeRange(`A${footRow - 4}:${statsEndCol}${footRow - 4}`, dateStrVal,
    null, null, null, { horizontal: 'center', vertical: 'middle' }
  );

  // Left Signature Block (Director)
  const leftStart = 'B';
  const leftEnd = 'F';
  
  // Right Signature Block (Subdirector)
  const rightStartColIdx = Math.max(7, statsStartColIndex - 2);
  const rightEndColIdx = rightStartColIdx + 5;
  const rightStart = columnToLetter(rightStartColIdx);
  const rightEnd = columnToLetter(rightEndColIdx);

  styleAndMergeRange(`${leftStart}${footRow}:${leftEnd}${footRow}`, 'O Director de Turma',
    { name: 'Blackadder ITC', size: 14, bold: true },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  styleAndMergeRange(`${rightStart}${footRow}:${rightEnd}${footRow}`, 'O Subdirector Pedagógico',
    { name: 'Blackadder ITC', size: 14, bold: true },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  footRow++;
  styleAndMergeRange(`${leftStart}${footRow}:${leftEnd}${footRow}`, '_____________________________________',
    { name: 'Times New Roman', size: 11 },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  styleAndMergeRange(`${rightStart}${footRow}:${rightEnd}${footRow}`, '_____________________________________',
    { name: 'Times New Roman', size: 11 },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  footRow++;
  styleAndMergeRange(`${leftStart}${footRow}:${leftEnd}${footRow}`, nomeDirTurma.toUpperCase(),
    { name: 'Times New Roman', size: 11 },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  styleAndMergeRange(`${rightStart}${footRow}:${rightEnd}${footRow}`, nomeSubdir.toUpperCase(),
    { name: 'Times New Roman', size: 11 },
    null, null, { horizontal: 'center', vertical: 'middle' }
  );

  // Border base headers
  for (let r = 11; r <= 13; r++) {
    for (let c = 2; c <= statsStartColIndex + 7; c++) {
      const cell = sheet.getRow(r).getCell(c);
      if (!cell.border) cell.border = borderStyle;
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
