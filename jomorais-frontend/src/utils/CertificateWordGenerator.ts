import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  VerticalAlign,
  TabStopType,
  LeaderType,
  UnderlineType,
  ShadingType,
} from 'docx'

import icon from '../assets/images/insignea.jpg'
import type { ICertificatePdfData } from './CertificatePdfGenerator'

export class CertificateWordGenerator {
  // ── Helpers ──

  private static formatDateLong(dateStr: string | null | undefined): string {
    if (!dateStr) return '___/___/______'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '___/___/______'
      return date.toLocaleDateString('pt-AO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return '___/___/______'
    }
  }

  private static formatDateShort(dateStr: string | null | undefined): string {
    if (!dateStr) return '___/___/______'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '___/___/______'
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return '___/___/______'
    }
  }

  private static numberToWords(n: number | string): string {
    const num = Math.round(Number(n))
    if (isNaN(num) || num < 0) return '-'
    const words = [
      'Zero', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove',
      'Dez', 'Onze', 'Doze', 'Treze', 'Catorze', 'Quinze', 'Dezasseis', 'Dezassete',
      'Dezoito', 'Dezanove', 'Vinte',
    ]
    return words[num] || String(num)
  }

  private static async loadLogo(): Promise<ArrayBuffer | undefined> {
    try {
      const response = await fetch(icon)
      return await response.arrayBuffer()
    } catch (e) {
      console.warn('Could not load logo for Word document', e)
      return undefined
    }
  }

  private static downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── Borders helpers ──

  private static noBorders() {
    return {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    }
  }

  private static thinBorders() {
    return {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    }
  }

  // ── Entry point ──

  static async generateWord(data: ICertificatePdfData): Promise<void> {
    const confirmacao = data.tb_alunos.tb_matriculas?.tb_confirmacoes?.[0]
    const classeDesignacao = confirmacao?.tb_turmas?.tb_classes?.designacao || ''
    const isNonaClasse = classeDesignacao.toLowerCase().includes('9ª')

    if (isNonaClasse) {
      await this.generate9thClassWord(data)
    } else {
      await this.generateMiddleClassWord(data)
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // LAYOUT 1: CERTIFICADO DA 9ª CLASSE (ENSINO GERAL)
  // ══════════════════════════════════════════════════════════════════

  private static async generate9thClassWord(data: ICertificatePdfData): Promise<void> {
    const logoBuffer = await this.loadLogo()

    const aluno = data.tb_alunos
    const nomeAluno = (aluno.nome || 'N/A').toUpperCase()
    const pai = (aluno.pai || 'N/A').toUpperCase()
    const mae = (aluno.mae || 'N/A').toUpperCase()
    const dataNasc = this.formatDateShort(aluno.dataNascimento)
    const biNum = aluno.n_documento_identificacao || 'N/A'
    const biData = aluno.dataEmissao ? this.formatDateShort(aluno.dataEmissao) : 'N/A'
    const naturalidade = aluno.naturalidade || aluno.tb_comunas?.designacao || 'Cabinda'
    const municipio = aluno.tb_comunas?.tb_municipios?.designacao || 'Cabinda'
    const provincia = aluno.tb_comunas?.tb_municipios?.tb_provincias?.designacao || 'Cabinda'
    const dataDoc = this.formatDateLong(data.DataEmissao)
    const anoConclusao = data.tb_ano_lectivo.designacao
    const nomeDirectora = 'Júlia Maria da Conceição Franque'

    const font = 'Times New Roman'

    // ── Build header ──
    const headerChildren: Paragraph[] = []

    // Logo + Header text in a table
    const logoCell = new TableCell({
      width: { size: 15, type: WidthType.PERCENTAGE },
      borders: this.noBorders(),
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: logoBuffer
            ? [new ImageRun({ data: logoBuffer, transformation: { width: 55, height: 55 }, type: 'png' })]
            : [],
        }),
      ],
    })

    const headerTextCell = new TableCell({
      width: { size: 85, type: WidthType.PERCENTAGE },
      borders: this.noBorders(),
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'República de Angola', font, size: 21 })],
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Ministério da Educação', font, size: 21 })],
        }),
        new Paragraph({
          children: [new TextRun({ text: 'ENSINO GERAL', font, size: 21, bold: true })],
        }),
      ],
    })

    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },
      rows: [new TableRow({ children: [logoCell, headerTextCell] })],
    })

    headerChildren.push(
      new Paragraph({ children: [] }), // top spacing
    )

    // ── Título ──
    const titleParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 200 },
      children: [
        new TextRun({
          text: 'CERTIFICADO DE HABILITAÇÕES',
          font,
          size: 28,
          bold: true,
          underline: { type: UnderlineType.SINGLE },
        }),
      ],
    })

    // ── Corpo do texto (parágrafo 1) ──
    const p1 = new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 120, line: 300 },
      children: [
        new TextRun({ text: `${nomeDirectora}, Directora do `, font, size: 21 }),
        new TextRun({ text: 'Complexo Escolar Anexo ao Magistério de Cabinda', font, size: 21, bold: true }),
        new TextRun({ text: ' Certifica que ', font, size: 21 }),
        new TextRun({ text: nomeAluno, font, size: 21, bold: true }),
        new TextRun({ text: ', filho de ', font, size: 21 }),
        new TextRun({ text: pai, font, size: 21, bold: true }),
        new TextRun({ text: ' e de ', font, size: 21 }),
        new TextRun({ text: mae, font, size: 21, bold: true }),
        new TextRun({ text: `, nascido aos ${dataNasc}, em ${naturalidade}, Município de `, font, size: 21 }),
        new TextRun({ text: municipio, font, size: 21, bold: true }),
        new TextRun({ text: `, Província de ${provincia}, Portador do BI/CP Nº. `, font, size: 21 }),
        new TextRun({ text: biNum, font, size: 21, bold: true }),
        new TextRun({ text: ` emitido, aos ${biData}, pelo Arquivo de Identificação de Cabinda.`, font, size: 21 }),
      ],
    })

    // ── Corpo do texto (parágrafo 2) ──
    const p2 = new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200, line: 300 },
      children: [
        new TextRun({ text: 'Concluiu no ano lectivo de ', font, size: 21 }),
        new TextRun({ text: anoConclusao, font, size: 21, bold: true }),
        new TextRun({ text: ', o ', font, size: 21 }),
        new TextRun({ text: 'I Ciclo de Ensino Secundário Geral', font, size: 21, bold: true }),
        new TextRun({ text: ', conforme o disposto na alínea ', font, size: 21 }),
        new TextRun({ text: 'c) do artigo 109 da LBSEE nº 17/16 de 7 de Outubro', font, size: 21, bold: true }),
        new TextRun({ text: ', com a Média Final de ', font, size: 21 }),
        new TextRun({ text: `${data.mediaFinal} valores`, font, size: 21, bold: true }),
        new TextRun({ text: ' obtida nas seguintes classificações por ciclos de aprendizagem:', font, size: 21 }),
      ],
    })

    // ── Subtítulo Escola ──
    const escolaParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: 'COMPLEXO ESCOLAR PRIVADO JOMORAIS', font, size: 22, bold: true }),
      ],
    })

    // ── Tabela de Notas (7ª, 8ª, 9ª) ──
    const nonaSubjects = [
      'Língua Portuguesa', 'Matemática', 'Biologia', 'Geografia', 'História',
      'Química', 'Física', 'Moral e Cívica', 'Educação Visual e Plástica',
      'Língua Inglesa', 'Língua Francesa', 'Educação Laboral', 'Empreendedorismo', 'Educação Física',
    ]

    const getGrade = (sub: string, cl: string): number | string => {
      const matched = data.gradeDetails?.find(d =>
        d.designacao.toLowerCase().includes(sub.toLowerCase())
      )
      if (!matched || !matched.notas) return '-'
      const found = Object.entries(matched.notas).find(([k]) => k.includes(cl))
      return found ? found[1].nota : '-'
    }

    // Table Header Row
    const headerCellStyle = {
      shading: { fill: 'E6E6E6', type: ShadingType.CLEAR, color: 'auto' },
      borders: this.thinBorders(),
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    }

    const gradeTableHeaderRow = new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          ...headerCellStyle,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DISCIPLINAS', font, size: 16, bold: true })] })],
        }),
        new TableCell({
          width: { size: 14, type: WidthType.PERCENTAGE },
          ...headerCellStyle,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '7ª CLASSE', font, size: 16, bold: true })] })],
        }),
        new TableCell({
          width: { size: 14, type: WidthType.PERCENTAGE },
          ...headerCellStyle,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '8ª CLASSE', font, size: 16, bold: true })] })],
        }),
        new TableCell({
          width: { size: 14, type: WidthType.PERCENTAGE },
          ...headerCellStyle,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '9ª CLASSE', font, size: 16, bold: true })] })],
        }),
        new TableCell({
          width: { size: 12, type: WidthType.PERCENTAGE },
          ...headerCellStyle,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Média Final', font, size: 16, bold: true })] })],
        }),
        new TableCell({
          width: { size: 16, type: WidthType.PERCENTAGE },
          ...headerCellStyle,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Média por Extenso', font, size: 16, bold: true })] })],
        }),
      ],
    })

    const gradeTableRows = nonaSubjects.map(sub => {
      const g7 = getGrade(sub, '7ª')
      const g8 = getGrade(sub, '8ª')
      const g9 = getGrade(sub, '9ª')

      let mediaDisc: number | string = '-'
      const grades = [g7, g8, g9].filter(g => typeof g === 'number') as number[]
      if (grades.length > 0) {
        mediaDisc = Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
      }

      const cellStyle = {
        borders: this.thinBorders(),
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 20, bottom: 20, left: 40, right: 40 },
      }

      return new TableRow({
        children: [
          new TableCell({
            ...cellStyle,
            children: [new Paragraph({ children: [new TextRun({ text: sub.toUpperCase(), font, size: 15 })] })],
          }),
          new TableCell({
            ...cellStyle,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: g7 === '-' ? '-' : `${g7} (valores)`, font, size: 15 })] })],
          }),
          new TableCell({
            ...cellStyle,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: g8 === '-' ? '-' : `${g8} (valores)`, font, size: 15 })] })],
          }),
          new TableCell({
            ...cellStyle,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: g9 === '-' ? '-' : `${g9} (valores)`, font, size: 15 })] })],
          }),
          new TableCell({
            ...cellStyle,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: mediaDisc === '-' ? '-' : String(mediaDisc), font, size: 15, bold: true })] })],
          }),
          new TableCell({
            ...cellStyle,
            children: [new Paragraph({ children: [new TextRun({ text: mediaDisc === '-' ? '-' : this.numberToWords(mediaDisc), font, size: 15 })] })],
          }),
        ],
      })
    })

    const gradesTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [gradeTableHeaderRow, ...gradeTableRows],
    })

    // ── Texto de Livro de Termos ──
    const pTerms = new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 200, after: 100, line: 300 },
      children: [
        new TextRun({ text: 'Para efeitos legais, lhe é passado o presente ', font, size: 21 }),
        new TextRun({ text: 'CERTIFICADO', font, size: 21, bold: true }),
        new TextRun({ text: ' que consta no livro de termos nº ', font, size: 21 }),
        new TextRun({ text: '004', font, size: 21, bold: true }),
        new TextRun({ text: ' folhas ', font, size: 21 }),
        new TextRun({ text: '004', font, size: 21, bold: true }),
        new TextRun({ text: ' assinado e autenticado com o carimbo/selo branco em uso neste estabelecimento de ensino.', font, size: 21 }),
      ],
    })

    // ── Data de emissão ──
    const pDate = new Paragraph({
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({ text: `Complexo Escolar Anexo Ao Magistério em Cabinda, aos ${dataDoc}.`, font, size: 21 }),
      ],
    })

    // ── Assinaturas ──
    const signatureTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: this.noBorders(),
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Conferido por', font, size: 21 })] }),
                new Paragraph({ children: [] }),
                new Paragraph({ children: [] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: '____________________________', font, size: 21 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: this.noBorders(),
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'O(A) Director(a)', font, size: 21 })] }),
                new Paragraph({ children: [] }),
                new Paragraph({ children: [] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: '____________________________', font, size: 21 })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: nomeDirectora, font, size: 18, bold: true })],
                }),
              ],
            }),
          ],
        }),
      ],
    })

    // ── Rodapé: verificação ──
    const host = window.location.origin
    const footerParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: `Autenticidade verificável em: ${host}/verificar/${data.NumeroCertificado} (Certificado: ${data.NumeroCertificado})`,
          font,
          size: 15,
          color: '666666',
          italics: true,
        }),
      ],
    })

    // ── Montar Documento ──
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1134, right: 1247, bottom: 1134, left: 1247 },
              borders: {
                pageBorders: {
                  offsetFrom: 'text',
                },
                pageBorderTop: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 16 },
                pageBorderBottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 16 },
                pageBorderLeft: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 16 },
                pageBorderRight: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 16 },
              },
            },
          },
          children: [
            headerTable,
            new Paragraph({
              spacing: { after: 100 },
              children: [],
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 4 } },
            }),
            titleParagraph,
            p1,
            p2,
            escolaParagraph,
            gradesTable,
            pTerms,
            pDate,
            signatureTable,
            footerParagraph,
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    this.downloadBlob(blob, `Certificado_9Classe_${nomeAluno.replace(/\s+/g, '_')}.docx`)
  }

  // ══════════════════════════════════════════════════════════════════
  // LAYOUT 2: CERTIFICADO DO ENSINO MÉDIO (TÉCNICO PROFISSIONAL)
  // ══════════════════════════════════════════════════════════════════

  private static async generateMiddleClassWord(data: ICertificatePdfData): Promise<void> {
    const logoBuffer = await this.loadLogo()

    const aluno = data.tb_alunos
    const nomeAluno = (aluno.nome || 'N/A').toUpperCase()
    const pai = (aluno.pai || 'N/A').toUpperCase()
    const mae = (aluno.mae || 'N/A').toUpperCase()
    const dataNasc = this.formatDateShort(aluno.dataNascimento)
    const biNum = aluno.n_documento_identificacao || 'N/A'
    const curso = aluno.tb_matriculas?.tb_cursos?.designacao || 'N/A'
    const anoConclusao = data.tb_ano_lectivo.designacao
    const confirmacao = aluno.tb_matriculas?.tb_confirmacoes?.[0]
    const turma = confirmacao?.tb_turmas?.designacao || 'A'
    const nomeDirectora = 'Madalena de Fátima Muila Ngimbi'
    const dataDoc = this.formatDateLong(data.DataEmissao)

    let cursoNome = curso
    if (!cursoNome.toLowerCase().startsWith('técnico de')) {
      cursoNome = `Técnico de ${curso}`
    }
    cursoNome = cursoNome.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))

    let areaFormacao = ''
    if (curso.toLowerCase().includes('análises clínicas') || curso.toLowerCase().includes('enfermagem') || curso.toLowerCase().includes('saúde')) {
      areaFormacao = ', da Área de Formação de Saúde'
    } else if (curso.toLowerCase().includes('informática') || curso.toLowerCase().includes('tecnologia')) {
      areaFormacao = ', da Área de Formação de Tecnologias'
    }

    const isFeminino = aluno.sexo?.toLowerCase() === 'f' || aluno.sexo?.toLowerCase() === 'feminino'
    const filhoFilha = isFeminino ? 'filha' : 'filho'
    const nascidoNascida = isFeminino ? 'nascida' : 'nascido'
    const portadorPortadora = isFeminino ? 'portadora' : 'portador'

    const font = 'Times New Roman'

    // ── Cabeçalho: Tabela com Insígnia | Texto Central | Nº Certificado ──
    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },
      rows: [
        new TableRow({
          children: [
            // Coluna 1: Espaço vazio (para equilibrar a coluna direita)
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              borders: this.noBorders(),
              children: [],
            }),
            // Coluna 2: Insígnia e Texto Central
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: this.noBorders(),
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 60 },
                  children: logoBuffer
                    ? [new ImageRun({ data: logoBuffer, transformation: { width: 45, height: 45 }, type: 'jpg' })]
                    : [],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { line: 240 },
                  children: [new TextRun({ text: 'REPÚBLICA DE ANGOLA', font, size: 18 })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { line: 240 },
                  children: [new TextRun({ text: 'MINISTÉRIO DA EDUCAÇÃO', font, size: 18 })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { line: 240 },
                  children: [new TextRun({ text: 'INSTITUTO TÉCNICO DE SAÚDE DE CABINDA', font, size: 18, bold: true })],
                }),
              ],
            }),
            // Coluna 3: Número do Certificado
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              borders: this.noBorders(),
              verticalAlign: VerticalAlign.BOTTOM,
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: data.NumeroCertificado || '001-AC-25/26', font, size: 12 })],
                }),
              ],
            }),
          ],
        }),
      ],
    })

    // ── Título: Certificado de Habilitações (size 14pt, Script MT Bold) ──
    const titleParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 0, line: 240 },
      children: [
        new TextRun({ text: 'Certificado de Habilitações', bold: true, font: 'Script MT Bold', size: 28 }),
      ],
    })

    // ── Subtítulo: (Instituto Técnico Privado de Saúde Jomorais) (size 12pt, Calibri) ──
    const subtitleParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120, line: 240 },
      children: [
        new TextRun({ text: '(Instituto Técnico Privado de Saúde Jomorais)', font: 'Calibri', bold: true, size: 24, color: 'C80000' }),
      ],
    })

    // ── Corpo do texto ──
    const bodyParagraph = new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 100, line: 240 },
      children: [
        new TextRun({ text: 'A Directora do Instituto, ', font, size: 20 }),
        new TextRun({ text: nomeDirectora, font, size: 20, bold: true }),
        new TextRun({ text: ', certifica de acordo com o art.º 25 e 27 dos estatutos de Subsistema do Ensino Técnico Profissional, aprovado pelo Decreto nº 90/04, de 3 de Dezembro de 2004, que ', font, size: 20 }),
        new TextRun({ text: nomeAluno, font, size: 20, bold: true, color: 'C80000' }),
        new TextRun({ text: `, ${filhoFilha} de ${pai} e de ${mae}, natural de Cabinda, província de Cabinda, ${nascidoNascida} aos `, font, size: 20 }),
        new TextRun({ text: dataNasc, font, size: 20, bold: true }),
        new TextRun({ text: `, ${portadorPortadora} do bilhete de identidade n.º ${biNum}, passado pelo Arquivo de Identificação de Cabinda, concluiu, em regime diurno, no ano lectivo ${anoConclusao}, o curso `, font, size: 20 }),
        new TextRun({ text: cursoNome, font, size: 20, bold: true }),
        new TextRun({ text: areaFormacao, font, size: 20 }),
        new TextRun({ text: `, tendo obtido as seguintes classificações, conforme consta na pauta do ano ${anoConclusao}, Turma ${turma}, n.º `, font, size: 20 }),
        new TextRun({ text: `${aluno.codigo}:`, font, size: 20, bold: true, highlight: 'yellow' }),
      ],
    })

    // ── Mapear disciplinas por componente ──
    const sociocultural = ['Língua Portuguesa', 'Língua Inglesa', 'Formação de Atitudes Integradoras', 'Educação Física']
    const cientifica = ['Matemática', 'Biologia', 'Física', 'Química', 'Bioquímica', 'Informática']

    const getGradeForMid = (sub: string): number => {
      const disc = data.gradeDetails?.find(d =>
        d.designacao.toLowerCase().replace(/\s+/g, '') === sub.toLowerCase().replace(/\s+/g, '') ||
        (sub.toLowerCase().includes('projeto') && d.designacao.toLowerCase().includes('projecto')) ||
        (sub.toLowerCase().includes('projecto') && d.designacao.toLowerCase().includes('projeto'))
      )
      if (!disc || !disc.notas) return 0
      const matchedGrade = Object.values(disc.notas)[0]
      return matchedGrade ? Math.round(matchedGrade.nota) : 0
    }

    const listSociocultural = sociocultural.map(sub => ({ name: sub, grade: getGradeForMid(sub) }))
    const listCientifica = cientifica.map(sub => ({ name: sub, grade: getGradeForMid(sub) }))

    const listTecnica: Array<{ name: string; grade: number }> = []
    data.gradeDetails?.forEach(d => {
      const nameLower = d.designacao.toLowerCase()
      const isSociocult = sociocultural.some(s => nameLower.includes(s.toLowerCase()))
      const isCient = cientifica.some(c => nameLower.includes(c.toLowerCase()))
      const isSpecial = nameLower.includes('estágio') || nameLower.includes('prova de aptidão') ||
        nameLower.includes('projeto') || nameLower.includes('projecto') || nameLower.includes('pap') ||
        nameLower.includes('gestão de saúde') || nameLower.includes('exame prático') ||
        nameLower.includes('exame pratico') || nameLower.includes('prova prática')

      if (!isSociocult && !isCient && !isSpecial) {
        const grade = Object.values(d.notas)[0]
        listTecnica.push({ name: d.designacao, grade: grade ? Math.round(grade.nota) : 0 })
      }
    })

    if (listTecnica.length === 0) {
      const isSaude = curso.toLowerCase().includes('análises clínicas') ||
        curso.toLowerCase().includes('enfermagem') || curso.toLowerCase().includes('saúde')
      const defaultTec = isSaude ? [
        'Psicologia', 'Ética e Deontologia Profissional', 'Introdução ao Laboratório de Análises Clínicas',
        'Anatomia e Fisiologia Humana', 'Microbiologia', 'Hematologia', 'Imunologia', 'Bioquímica Clínica',
        'Patologia Geral', 'Imunohematologia', 'Microbiologia de Águas e Alimentos', 'Tecnologia Laboratorial',
        'Parasitologia', 'Urinologia', 'Epidemiologia', 'Práticas de Análises Clínicas',
      ] : [
        'Sistemas de Exploração', 'Arquitetura de Computadores', 'Redes de Computadores',
        'Programação e Sistemas de Informação', 'Tecnologias de Informação e Comunicação',
        'Sistemas Digitais', 'Instalação e Manutenção de Computadores',
      ]
      defaultTec.forEach(t => listTecnica.push({ name: t, grade: getGradeForMid(t) }))
    }

    const projGrade = getGradeForMid('Projecto Tecnológico') || getGradeForMid('Projeto Tecnológico') || 14
    const gestaoSaudeGrade = getGradeForMid('Gestão de Saúde') || 15
    const estagioGrade = getGradeForMid('Estágio Curricular') || getGradeForMid('Estágio') || 14
    const papGrade = getGradeForMid('Prova de Aptidão Profissional') || getGradeForMid('PAP') || 15

    const isSaude = curso.toLowerCase().includes('análises clínicas') ||
      curso.toLowerCase().includes('enfermagem') || curso.toLowerCase().includes('saúde')
    const hasGestaoSaude = data.gradeDetails?.some(d =>
      d.designacao.toLowerCase().includes('gestão de saúde') || d.designacao.toLowerCase().includes('gestao de saude')
    )

    // ── Build Grade Table ──
    const cellStyle = {
      borders: this.noBorders(),
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    }

    const makeGradeRow = (name: string, grade: number, isBold: boolean = false, isHighlight: boolean = false) => {
      const shadingObj = isHighlight
        ? { fill: 'E6E6E6', type: ShadingType.CLEAR, color: 'auto' }
        : undefined

      return new TableRow({
        children: [
          new TableCell({
            ...cellStyle,
            width: { size: 75, type: WidthType.PERCENTAGE },
            ...(shadingObj ? { shading: shadingObj } : {}),
            children: [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: 9000, leader: LeaderType.DOT }],
                children: [
                  new TextRun({ text: name, font, size: 20, bold: isBold }),
                  new TextRun({ text: '\t', font, size: 20 }),
                ],
              }),
            ],
          }),
          new TableCell({
            ...cellStyle,
            width: { size: 10, type: WidthType.PERCENTAGE },
            ...(shadingObj ? { shading: shadingObj } : {}),
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: grade.toString().padStart(2, '0'), font, size: 20, bold: isBold })],
              }),
            ],
          }),
          new TableCell({
            ...cellStyle,
            width: { size: 15, type: WidthType.PERCENTAGE },
            ...(shadingObj ? { shading: shadingObj } : {}),
            children: [
              new Paragraph({
                children: [new TextRun({ text: `(${this.numberToWords(grade)})`, font, size: 20, bold: isBold })],
              }),
            ],
          }),
        ],
      })
    }

    const makeSectionHeaderRow = (title: string) => {
      return new TableRow({
        children: [
          new TableCell({
            ...cellStyle,
            columnSpan: 3,
            children: [new Paragraph({ children: [new TextRun({ text: title, font, size: 20, bold: true })] })],
          }),
        ],
      })
    }

    const gradeRows: TableRow[] = []

    // Componente Sociocultural header + Nota column header
    gradeRows.push(new TableRow({
      children: [
        new TableCell({
          ...cellStyle,
          width: { size: 75, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Componente Sociocultural', font, size: 20, bold: true })] })],
        }),
        new TableCell({
          ...cellStyle,
          columnSpan: 2,
          width: { size: 25, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Nota', font, size: 20, bold: true })] })],
        }),
      ],
    }))
    listSociocultural.forEach(item => gradeRows.push(makeGradeRow(item.name, item.grade)))

    gradeRows.push(makeSectionHeaderRow('Componente Científica'))
    listCientifica.forEach(item => gradeRows.push(makeGradeRow(item.name, item.grade)))

    gradeRows.push(makeSectionHeaderRow('Componente Técnica, Tecnológica e Prática'))
    listTecnica.forEach(item => gradeRows.push(makeGradeRow(item.name, item.grade)))

    // Projecto Tecnológico
    gradeRows.push(makeGradeRow('Projecto Tecnológico', projGrade))

    // Gestão de Saúde (condicional)
    if (isSaude || hasGestaoSaude) {
      gradeRows.push(makeGradeRow('Gestão de Saúde', gestaoSaudeGrade))
    }

    // Estágio Curricular
    gradeRows.push(makeGradeRow('Estágio Curricular (E C)', estagioGrade, true))

    // Classificação Final do Plano Curricular (PC)
    const allAcademicGrades = [...listSociocultural, ...listCientifica, ...listTecnica].map(i => i.grade).filter(g => g > 0)
    const pcVal = Math.round(allAcademicGrades.reduce((a, b) => a + b, 0) / allAcademicGrades.length) || 14
    gradeRows.push(makeGradeRow('Classificação Final do Plano Curricular (PC)', pcVal, true))

    // PAP
    gradeRows.push(makeGradeRow('Classificação Da Prova de Aptidão Profissional (PAP)', papGrade, true))

    // Classificação Final do Curso
    const finalCourseGrade = Math.round((4 * pcVal + estagioGrade + papGrade) / 6)
    gradeRows.push(makeGradeRow('Classificação Final do Curso = (4xPC+EC+PAP) /6', finalCourseGrade, true, true))

    const gradesTable = new Table({
      width: { size: 85, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      borders: this.noBorders(),
      rows: gradeRows,
    })

    // ── Texto de validação ──
    const pEnd = new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 150, after: 100, line: 260 },
      children: [
        new TextRun({ text: 'Pelo que, para efeitos legais e de harmonia com a legislação em vigor, ', font, size: 21 }),
        new TextRun({ text: 'mandámos-lhe passar o presente certificado', font, size: 21, bold: true }),
        new TextRun({ text: ', que vai por nós assinado e autenticado pelo selo branco em uso neste Instituto.', font, size: 21 }),
      ],
    })

    // ── Data e local ──
    const pDatePlace = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({ text: 'Instituto Técnico de Saúde de Cabinda, em Cabinda, ', font, size: 21 }),
        new TextRun({ text: `${dataDoc}. -`, font, size: 21, bold: true }),
      ],
    })

    // ── Assinaturas ──
    const signatureTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: this.noBorders(),
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Conferido por', font, size: 20 })] }),
                new Paragraph({ children: [] }),
                new Paragraph({ children: [] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: '____________________________', font, size: 20 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: this.noBorders(),
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'A Directora do Instituto', font, size: 20 })] }),
                new Paragraph({ children: [] }),
                new Paragraph({ children: [] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: '____________________________', font, size: 20 })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: nomeDirectora, font, size: 24, italics: true })],
                }),
              ],
            }),
          ],
        }),
      ],
    })

    // ── Montar Documento ──
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1134, right: 1247, bottom: 1134, left: 1247 },
              borders: {
                pageBorders: {
                  offsetFrom: 'text',
                },
                pageBorderTop: { style: BorderStyle.TRIPLE, size: 12, color: '000000', space: 16 },
                pageBorderBottom: { style: BorderStyle.TRIPLE, size: 12, color: '000000', space: 16 },
                pageBorderLeft: { style: BorderStyle.TRIPLE, size: 12, color: '000000', space: 16 },
                pageBorderRight: { style: BorderStyle.TRIPLE, size: 12, color: '000000', space: 16 },
              },
            },
          },
          children: [
            headerTable,
            titleParagraph,
            subtitleParagraph,
            bodyParagraph,
            gradesTable,
            pEnd,
            pDatePlace,
            signatureTable,
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    this.downloadBlob(blob, `Certificado_Medio_${nomeAluno.replace(/\s+/g, '_')}.docx`)
  }
}
