// src/utils/PautaPdfGenerator.ts
// Generates a PDF of a pauta (class schedule) using jsPDF and jspdf-autotable.
// Ensure npm packages are installed: `npm install jspdf jspdf-autotable`.

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types representing the data structure returned by the backend for a pauta.
interface DisciplinaInfo {
  designacao: string;
}
interface NotaInfo {
  disciplina: string;
  nota?: number;
}
interface AlunoInfo {
  nome: string;
}
interface BoletimInfo {
  numero: number;
  aluno: AlunoInfo;
  notas: NotaInfo[];
  mediaGeral: number;
  situacao: string;
  faltas: number;
}
export interface IPautaTurmaData {
  turma: { codigo: number; designacao: string };
  anoLetivo: string | number;
  trimestre: string | number;
  disciplinas: DisciplinaInfo[];
  boletins: BoletimInfo[];
}

export const PautaPdfGenerator = {
  generatePDF(pautaData: IPautaTurmaData) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    let y = margin;

    doc.setFontSize(16);
    doc.text('Gestão de Pauta', margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Turma: ${pautaData.turma.designacao}`, margin, y);
    y += 6;
    doc.text(`Ano Lectivo: ${pautaData.anoLetivo}`, margin, y);
    y += 6;
    doc.text(`Trimestre: ${pautaData.trimestre}`, margin, y);
    y += 10;

    // Table header
    const headers: string[] = ['Nº', 'Aluno'];
    pautaData.disciplinas.forEach((d: DisciplinaInfo) => headers.push(d.designacao));
    headers.push('Média', 'Situação', 'Faltas');

    // Build table rows
    const rows = pautaData.boletins.map((b) => {
      const row: (string | number)[] = [b.numero.toString(), b.aluno.nome];
      pautaData.disciplinas.forEach((d: DisciplinaInfo) => {
        const notaObj = b.notas.find((n: NotaInfo) => n.disciplina === d.designacao);
        row.push(notaObj?.nota?.toString() ?? '-');
      });
      row.push(b.mediaGeral.toString(), b.situacao, b.faltas.toString());
      return row;
    });

    // Render table using autotable
    autoTable(doc, {
      startY: y,
      head: [headers],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 30 } },
    });

    doc.save(`pauta_${pautaData.turma.codigo}_${pautaData.trimestre}.pdf`);
  },
};
