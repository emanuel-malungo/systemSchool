import { buildPautaExcelTemplate } from '../src/utils/pauta-excel.util.js';
import fs from 'fs';

async function test() {
  const pautaData = {
    totalAlunos: 3,
    instituicao: {
      director: "GABRIEL PRÓSPERO MABIALA",
      subDirector: "ALBERTO SASSA TATI"
    },
    directorTurma: {
      tb_docente: {
        nome: "RUTH DEMBI QUIFOCO ZEMBO"
      }
    },
    pauta: {
      "1": {
        aluno: {
          codigo: 101,
          nome: "Afonso Gomes",
          sexo: "M",
          dataNascimento: "2008-05-15",
          codigo_Status: 1
        },
        disciplinas: [
          { disciplina: "Matemática", nota: 14.5, faltas: 2 },
          { disciplina: "Física", nota: 9.0, faltas: 0 },
          { disciplina: "Química", nota: 12.0, faltas: 1 }
        ],
        mediaGeral: 11.83,
        situacao: "TRANS"
      },
      "2": {
        aluno: {
          codigo: 102,
          nome: "Maria Sousa",
          sexo: "F",
          dataNascimento: "2007-11-20",
          codigo_Status: 1
        },
        disciplinas: [
          { disciplina: "Matemática", nota: 16.0, faltas: 0 },
          { disciplina: "Física", nota: 11.5, faltas: 1 },
          { disciplina: "Química", nota: 15.0, faltas: 0 }
        ],
        mediaGeral: 14.17,
        situacao: "TRANS"
      },
      "3": {
        aluno: {
          codigo: 103,
          nome: "Pedro Antunes",
          sexo: "M",
          dataNascimento: "2009-02-10",
          codigo_Status: 2 // Desistente
        },
        disciplinas: [
          { disciplina: "Matemática", nota: null, faltas: 0 },
          { disciplina: "Física", nota: null, faltas: 0 },
          { disciplina: "Química", nota: null, faltas: 0 }
        ],
        mediaGeral: 0,
        situacao: "DESIST."
      }
    }
  };

  const params = {
    pautaData,
    codigoTrimestre: 2,
    descClasse: "10ª CLASSE",
    descCurso: "",
    descPeriodo: "VESPERTINO",
    descTurma: "10ª ÚNICA-ANÁLISES CLÌNICAS-MATINAL",
    descTrimestre: "2º TRIMESTRE",
    descAno: "2025/2026",
    totalM: 2,
    totalF: 1
  };

  console.log("Building excel buffer...");
  const buffer = await buildPautaExcelTemplate(params);
  console.log(`Buffer generated successfully, size: ${buffer.length} bytes`);

  const outputPath = "scratch/test_output.xlsx";
  fs.writeFileSync(outputPath, buffer);
  console.log(`Saved output to ${outputPath}`);
}

test().catch(console.error);
