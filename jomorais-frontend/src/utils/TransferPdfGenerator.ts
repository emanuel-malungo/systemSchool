import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, UnderlineType, Tab, Header, Footer } from 'docx'
import icon from "../assets/images/icon.png"

export interface ITransferPdfData {
  transferencia: {
    codigo: number
    dataTransferencia: string
    codigoMotivo: number
    obs?: string
    tb_alunos: {
      codigo: number
      nome: string
      dataNascimento: string
      sexo: string
      pai?: string
      mae?: string
      n_documento_identificacao?: string
      provinciaEmissao?: string
      dataEmissao?: string
      morada?: string
      tb_comunas?: {
        designacao: string
        tb_municipios?: {
          designacao: string
          tb_provincias?: {
            designacao: string
          }
        }
      }
      tb_nacionalidades?: {
        designacao: string
      }
      tb_matriculas?: {
        codigo: number
        tb_cursos?: {
          designacao: string
        }
        tb_confirmacoes?: Array<{
          codigo: number
          tb_turmas?: {
            designacao: string
            tb_classes?: {
              designacao: string
            }
            tb_periodos?: {
              designacao: string
            }
          }
        }>
      } | null
    }
  }
  proveniencia?: {
    codigo: number
    designacao: string
    localizacao?: string
  } | null
  instituicao: {
    nome: string
    endereco?: string
    telefone?: string
    email?: string
  }
  utilizador?: {
    nome: string
  } | null
}

export class TransferPdfGenerator {
  
  /** Formata a data por extenso em Português (pt-AO) */
  private static formatDateLong(dateStr: string | null | undefined): string {
    if (!dateStr) return '___/___/______'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '___/___/______'
      return date.toLocaleDateString('pt-AO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return '___/___/______'
    }
  }

  /**
   * Desenha texto misto (partes normais e bold) numa linha, retornando a lista de segmentos
   * para uso com splitTextToSize justificado.
   * Usa a abordagem de escrever segmento a segmento na mesma linha.
   * Retorna a posição X final após o último segmento.
   */
  private static textWidth(doc: jsPDF, text: string): number {
    return (doc.getStringUnitWidth(text) * doc.getFontSize()) / doc.internal.scaleFactor
  }

  /**
   * Escreve um bloco de texto justificado com suporte a marcações bold inline.
   * Usa marcação simples: segmentos são objetos { text, bold }.
   * Retorna o novo Y após o bloco.
   */
  private static writeJustifiedMixed(
    doc: jsPDF,
    segments: Array<{ text: string; bold: boolean; underline?: boolean }>,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): number {
    const fontSize = doc.getFontSize()
    const scaleFactor = doc.internal.scaleFactor

    // Tokenizar em palavras mantendo referência ao estilo
    interface Word {
      word: string
      bold: boolean
      underline: boolean
    }
    const words: Word[] = []
    for (const seg of segments) {
      const parts = seg.text.split(/(\s+)/)
      for (const part of parts) {
        if (part.trim().length > 0) {
          words.push({ word: part.trim(), bold: seg.bold, underline: seg.underline ?? false })
        } else if (part.length > 0 && words.length > 0) {
          // espaço — marca no próximo
        }
      }
    }

    // Agrupar em linhas
    const lines: Word[][] = []
    let currentLine: Word[] = []
    let currentWidth = 0

    const getWordWidth = (w: Word): number => {
      doc.setFont('Helvetica', w.bold ? 'bold' : 'normal')
      return (doc.getStringUnitWidth(w.word) * fontSize) / scaleFactor
    }

    const spaceWidth = (): number => {
      doc.setFont('Helvetica', 'normal')
      return (doc.getStringUnitWidth(' ') * fontSize) / scaleFactor
    }

    for (const word of words) {
      const ww = getWordWidth(word)
      const gap = currentLine.length > 0 ? spaceWidth() : 0
      if (currentWidth + gap + ww > maxWidth && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = [word]
        currentWidth = ww
      } else {
        currentLine.push(word)
        currentWidth += gap + ww
      }
    }
    if (currentLine.length > 0) lines.push(currentLine)

    // Renderizar cada linha
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li]
      const isLast = li === lines.length - 1

      // Calcular largura total das palavras nesta linha
      let totalWordWidth = 0
      for (const w of line) {
        totalWordWidth += getWordWidth(w)
      }

      const totalSpaceAvailable = maxWidth - totalWordWidth
      const gaps = line.length - 1
      const spacePerGap = isLast || gaps === 0 ? spaceWidth() : totalSpaceAvailable / gaps

      let curX = x
      for (let wi = 0; wi < line.length; wi++) {
        const w = line[wi]
        doc.setFont('Helvetica', w.bold ? 'bold' : 'normal')
        doc.text(w.word, curX, y)

        if (w.underline) {
          const ww = getWordWidth(w)
          doc.setLineWidth(0.3)
          doc.line(curX, y + 0.8, curX + ww, y + 0.8)
        }

        curX += getWordWidth(w) + (wi < line.length - 1 ? spacePerGap : 0)
      }

      y += lineHeight
    }

    return y
  }

  /**
   * Gera o PDF oficial da Guia de Transferência fiel ao modelo institucional.
   */
  static generatePDF(data: ITransferPdfData): void {
    const { transferencia, proveniencia, instituicao } = data
    const aluno = transferencia.tb_alunos

    // Inicializar documento A4 vertical
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const marginL = 25
    const marginR = 20
    const maxWidth = pageWidth - marginL - marginR
    let y = 20

    // ── CABEÇALHO: Logo à esquerda + Nome da instituição à direita ──────────

    const logoX = marginL
    const logoY = y
    const logoSize = 16

    doc.addImage(icon, 'PNG', logoX, logoY, logoSize, logoSize)

    // Nome da instituição ao lado da logo
    const instNome = (instituicao.nome || 'INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS').toUpperCase()
    doc.setFont('Agency FB', 'bold')
    doc.setFontSize(16)
    const textX = logoX + logoSize + 3
    doc.text(instNome, textX, logoY + logoSize / 2 + 2)

    y = logoY + logoSize + 3
    doc.setLineWidth(0.5)
    doc.line(marginL, y, pageWidth - marginR, y)
    y += 8

    // Título do documento no corpo
    const anoEmissao = transferencia.dataTransferencia
      ? new Date(transferencia.dataTransferencia).getFullYear()
      : new Date().getFullYear()
    const numGuia = String(transferencia.codigo).padStart(3, '0')
    const sigla = 'DCITPSJM'
    const titulo = `GUIA DE TRANSFERÊNCIA Nº.${numGuia}/${sigla}/${anoEmissao}`

    doc.setFont('Comic Sans MS', 'bolditalic')
    doc.setFontSize(14)
    doc.text(titulo, pageWidth / 2, y, { align: 'center' })
    
    // Sublinhado do título
    const titleWidth = (doc.getStringUnitWidth(titulo) * 14) / doc.internal.scaleFactor
    doc.setLineWidth(0.4)
    doc.line((pageWidth - titleWidth) / 2, y + 1, (pageWidth + titleWidth) / 2, y + 1)

    y += 14

    // ── CORPO DO TEXTO ───────────────────────────────────────────────────────
    doc.setFontSize(11)
    const lh = 6.5 // line height

    // Dados do aluno
    const nomeAluno = (aluno.nome || 'N/A').toUpperCase()
    const matricula = aluno.tb_matriculas  // singular (tb_matriculas?)
    const confirmacao = matricula?.tb_confirmacoes?.[0]
    const turma = confirmacao?.tb_turmas
    const classe = turma?.tb_classes?.designacao || 'N/A'
    const numTurma = turma?.designacao || 'N/A'   // ex: "22"
    const letraTurma = 'E'                          // letra da turma (campo separado se existir)
    const periodo = turma?.tb_periodos?.designacao || 'N/A'
    const curso = (matricula?.tb_cursos?.designacao || 'N/A').toUpperCase()
    const nProcesso = String(aluno.codigo).padStart(4, '0')
    const pai = (aluno.pai || 'N/A').toUpperCase()
    const mae = (aluno.mae || 'N/A').toUpperCase()
    const municipio = aluno.tb_comunas?.tb_municipios?.designacao || 'Cabinda'
    const provincia = aluno.tb_comunas?.tb_municipios?.tb_provincias?.designacao || 'Cabinda'
    const naturalidade = aluno.tb_comunas?.designacao || municipio
    const dataNasc = this.formatDateLong(aluno.dataNascimento)
    const biNum = aluno.n_documento_identificacao || 'N/A'
    const biProv = aluno.provinciaEmissao || 'Cabinda'
    const biData = aluno.dataEmissao ? this.formatDateLong(aluno.dataEmissao) : 'N/A'
    const escolaDestino = (proveniencia?.designacao || 'N/A').toUpperCase()

    // Parágrafo 1 — mistura bold (nomes) e normal — fiel ao modelo da imagem
    const p1: Array<{ text: string; bold: boolean; underline?: boolean }> = [
      { text: 'Para os fins julgados convenientes e conforme solicitado pelo (a) Encarregado (a) da educação, é transferido o aluno ', bold: false },
      { text: nomeAluno + ',', bold: true },
      { text: ` da ${classe}ª Classe, nº.`, bold: false },
      { text: numTurma + ',', bold: true },
      { text: ' turma: ', bold: false },
      { text: letraTurma + ',', bold: true },
      { text: ' período: ', bold: false },
      { text: periodo + ',', bold: true },
      { text: ' curso: ', bold: false },
      { text: curso + ',', bold: true },
      { text: ` processo nº.${nProcesso}, filho de `, bold: false },
      { text: pai, bold: true },
      { text: ' e ', bold: false },
      { text: mae + ',', bold: true },
      { text: ` natural de ${naturalidade}, município de ${municipio}, província de ${provincia}, nascido aos ${dataNasc}, portador da Bilhete de Identidade nº.`, bold: false },
      { text: biNum + ',', bold: true },
      { text: ` emitido pela Identificação de ${biProv}, ${biData}.`, bold: false },
    ]
    y = this.writeJustifiedMixed(doc, p1, marginL, y, maxWidth, lh)
    y += 6

    // "Para o ESCOLA DESTINO." — "Para o " normal, nome sublinhado bold
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Para o ', marginL, y)
    const paraOWidth = this.textWidth(doc, 'Para o ')
    doc.setFont('Helvetica', 'bold')
    doc.text(escolaDestino + '.', marginL + paraOWidth, y)
    // Sublinhado no nome da escola
    const escolaWidth = this.textWidth(doc, escolaDestino + '.')
    doc.setLineWidth(0.3)
    doc.line(marginL + paraOWidth, y + 0.8, marginL + paraOWidth + escolaWidth, y + 0.8)
    y += lh + 4

    // OBS
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(`OBS: Vai matricular-se na ${classe}ª Classe.`, marginL, y)
    y += lh + 4

    // CONSTITUÍ O SEU PROCESSO INDIVIDUAL
    const processoLabel = 'CONSTITUÍ O SEU PROCESSO INDIVIDUAL: '
    const processoTexto = 'cópia do bilhete de identidade, certificado de conclusão do I ciclo do Ensino Secundário Geral e Ficha Académica do Ensino Médio de Saúde.'
    const pProcesso: Array<{ text: string; bold: boolean }> = [
      { text: processoLabel, bold: true },
      { text: processoTexto, bold: false },
    ]
    y = this.writeJustifiedMixed(doc, pProcesso, marginL, y, maxWidth, lh)
    y += 6

    // Observação adicional se existir
    if (transferencia.obs && transferencia.obs.trim()) {
      doc.setFont('Helvetica', 'italic')
      doc.setFontSize(10)
      const obsLines = doc.splitTextToSize(`Observação: ${transferencia.obs}`, maxWidth)
      doc.text(obsLines, marginL, y, { align: 'justify' })
      y += obsLines.length * lh + 4
    }

    // Parágrafo de encerramento
    const encerramentoSegs: Array<{ text: string; bold: boolean }> = [
      { text: 'Por ser verdade e me ter sido solicitada, passou-se a presente ', bold: false },
      { text: 'GUIA DE TRANSFERÊNCIA', bold: true },
      { text: ' que vai por mim assinada e autenticada com o carimbo em uso nesta Instituição de Ensino.', bold: false },
    ]
    y = this.writeJustifiedMixed(doc, encerramentoSegs, marginL, y, maxWidth, lh)
    y += 10

    // ── DATA E LOCAL ─────────────────────────────────────────────────────────
    const dataDoc = this.formatDateLong(transferencia.dataTransferencia)
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`${instNome}, ${dataDoc}. –`, marginL, y)
    y += 20

    // ── ASSINATURA ───────────────────────────────────────────────────────────
    // Bloco de assinatura centralizado
    const sigX = pageWidth / 2
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('O Director do Instituto', sigX, y, { align: 'center' })
    y += 20

    // Linha de assinatura
    doc.setLineWidth(0.4)
    doc.line(sigX - 40, y, sigX + 40, y)
    y += 6

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('GABRIEL PRÓSPERO MABIALA', sigX, y, { align: 'center' })

    // ── RODAPÉ ───────────────────────────────────────────────────────────────
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0)

    const footerBairro = (instituicao.endereco ? `BAIRRO: ${instituicao.endereco.toUpperCase()}` : 'BAIRRO: 1º DE MAIO, NA RUA 3X3') 
      + '. TELEFONE: ' + (instituicao.telefone || '915 312 187')
    const footerEmail = 'EMAIL: ' + (instituicao.email || 'colegiojomorais@gmail.com')
    const footerFacebook = 'FACEBOOK: Colégio Jomorais'

    const footerY = pageHeight - 20
    doc.setLineWidth(0.5)
    doc.line(marginL, footerY, pageWidth - marginR, footerY)

    doc.text(footerBairro, pageWidth / 2, footerY + 5, { align: 'center' })
    doc.text(footerEmail, pageWidth / 2, footerY + 9, { align: 'center' })
    doc.text(footerFacebook, pageWidth / 2, footerY + 13, { align: 'center' })

    // Salvar PDF
    const fileName = `Guia_Transferencia_${nomeAluno.replace(/\s+/g, '_')}_${numGuia}.pdf`
    doc.save(fileName)
  }

  /**
   * Gera o mesmo documento em formato Word (.docx)
   */
  public static async generateWord(data: ITransferPdfData) {
    const { transferencia, proveniencia, instituicao } = data
    const aluno = transferencia.tb_alunos

    const nomeAluno = (aluno.nome || 'N/A').toUpperCase()
    const numGuia = String(transferencia.codigo).padStart(3, '0')
    const sigla = 'DCITPSJM'
    const anoEmissao = transferencia.dataTransferencia
      ? new Date(transferencia.dataTransferencia).getFullYear()
      : new Date().getFullYear()
    const titulo = `GUIA DE TRANSFERÊNCIA Nº.${numGuia}/${sigla}/${anoEmissao}`

    const matricula = aluno.tb_matriculas
    const confirmacao = matricula?.tb_confirmacoes?.[0]
    const classe = confirmacao?.tb_turmas?.tb_classes?.designacao || '___'
    const curso = matricula?.tb_cursos?.designacao || 'Enfermagem'
    const escolaDestino = (proveniencia?.designacao || 'Outra Instituição').toUpperCase()

    const biNum = aluno.n_documento_identificacao || '_________________'
    const biProv = aluno.provinciaEmissao || '________'
    const biData = this.formatDateLong(aluno.dataEmissao)

    let naturalidade = ''
    if (aluno.tb_comunas) {
      naturalidade += aluno.tb_comunas.designacao
      if (aluno.tb_comunas.tb_municipios) {
        naturalidade += `, Município de ${aluno.tb_comunas.tb_municipios.designacao}`
        if (aluno.tb_comunas.tb_municipios.tb_provincias) {
          naturalidade += `, Província de ${aluno.tb_comunas.tb_municipios.tb_provincias.designacao}`
        }
      }
    } else {
      naturalidade = '_____________________________'
    }

    const pai = aluno.pai || '_____________________________'
    const mae = aluno.mae || '_____________________________'
    const instNome = (instituicao.nome || 'INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS').toUpperCase()

    let logoBuffer: ArrayBuffer | undefined
    try {
      const response = await fetch(icon)
      logoBuffer = await response.arrayBuffer()
    } catch (e) {
      console.warn("Could not load logo for Word document", e)
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    ...(logoBuffer ? [
                      new ImageRun({
                        data: logoBuffer,
                        transformation: { width: 30, height: 30 },
                        type: "png"
                      }),
                      new TextRun({ text: "  " })
                    ] : []),
                    new TextRun({ text: instNome, font: "Agency FB", size: 32, bold: true }),
                  ],
                  border: { bottom: { color: "auto", space: 1, value: "double", size: 6 } }
                }),
              ]
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  border: { top: { color: "auto", space: 1, value: "single", size: 12 } },
                  children: [
                    new TextRun({ text: (instituicao.endereco ? `BAIRRO: ${instituicao.endereco.toUpperCase()}` : 'BAIRRO: 1º DE MAIO, NA RUA 3X3') + '. TELEFONE: ' + (instituicao.telefone || '915 312 187'), font: "Times New Roman", size: 16, bold: true })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'EMAIL: ' + (instituicao.email || 'colegiojomorais@gmail.com'), font: "Times New Roman", size: 16, bold: true })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'FACEBOOK: Colégio Jomorais', font: "Times New Roman", size: 16, bold: true })
                  ]
                })
              ]
            })
          },
          children: [
            
            // Título
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: titulo,
                  font: "Comic Sans MS",
                  size: 28, // 14pt (28 half-points)
                  bold: true,
                  italics: true,
                  underline: { type: UnderlineType.SINGLE }
                })
              ]
            }),
            new Paragraph({ text: "" }),

            // Corpo
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({ text: "Passa a favor do(a) Aluno(a): ", font: "Times New Roman", size: 24 }),
                new TextRun({ text: nomeAluno + ",", font: "Times New Roman", size: 24, bold: true }),
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({ text: "Filho de: ", font: "Times New Roman", size: 24 }),
                new TextRun({ text: pai, font: "Times New Roman", size: 24, bold: true }),
                new TextRun({ text: " e de ", font: "Times New Roman", size: 24 }),
                new TextRun({ text: mae + ",", font: "Times New Roman", size: 24, bold: true }),
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({ text: "Nascido aos ", font: "Times New Roman", size: 24 }),
                new TextRun({ text: this.formatDateLong(aluno.dataNascimento) + ",", font: "Times New Roman", size: 24, bold: true }),
                new TextRun({ text: " natural de: ", font: "Times New Roman", size: 24 }),
                new TextRun({ text: naturalidade + ",", font: "Times New Roman", size: 24, bold: true }),
                new TextRun({ text: " portador(a) do Bilhete de Identidade n.º ", font: "Times New Roman", size: 24 }),
                new TextRun({ text: biNum + ",", font: "Times New Roman", size: 24, bold: true }),
                new TextRun({ text: ` emitido pela Identificação de ${biProv}, ${biData}.`, font: "Times New Roman", size: 24 }),
              ]
            }),
            new Paragraph({ text: "" }),

            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({ text: "Para o ", font: "Times New Roman", size: 24 }),
                new TextRun({ text: escolaDestino + ".", font: "Times New Roman", size: 24, bold: true, underline: { type: UnderlineType.SINGLE } }),
              ]
            }),
            new Paragraph({ text: "" }),

            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({ text: `OBS: Vai matricular-se na ${classe}ª Classe.`, font: "Times New Roman", size: 24, bold: true }),
              ]
            }),
            new Paragraph({ text: "" }),

            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({ text: "CONSTITUÍ O SEU PROCESSO INDIVIDUAL: ", font: "Times New Roman", size: 24, bold: true }),
                new TextRun({ text: "cópia do bilhete de identidade, certificado de conclusão do I ciclo do Ensino Secundário Geral e Ficha Académica do Ensino Médio de Saúde.", font: "Times New Roman", size: 24 }),
              ]
            }),
            new Paragraph({ text: "" }),

            ...(transferencia.obs ? [
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({ text: `Observação: ${transferencia.obs}`, font: "Times New Roman", size: 20, italics: true }),
                ]
              }),
              new Paragraph({ text: "" })
            ] : []),

            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({ text: "Por ser verdade e me ter sido solicitada, passou-se a presente ", font: "Times New Roman", size: 24 }),
                new TextRun({ text: "GUIA DE TRANSFERÊNCIA", font: "Times New Roman", size: 24, bold: true }),
                new TextRun({ text: " que vai por mim assinada e autenticada com o carimbo em uso nesta Instituição de Ensino.", font: "Times New Roman", size: 24 }),
              ]
            }),
            new Paragraph({ text: "\n" }),

            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({ text: `${instNome}, ${this.formatDateLong(transferencia.dataTransferencia)}. –`, font: "Times New Roman", size: 24 }),
              ]
            }),
            new Paragraph({ text: "\n" }),

            // Assinatura
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "O Director do Instituto", font: "Times New Roman", size: 20 }),
              ]
            }),
            new Paragraph({ text: "\n\n" }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "________________________________________________", font: "Times New Roman", size: 20 }),
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "GABRIEL PRÓSPERO MABIALA", font: "Times New Roman", size: 20, bold: true }),
              ]
            }),
            new Paragraph({ text: "\n\n" }),

            new Paragraph({ text: "\n\n" })
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Guia_Transferencia_${nomeAluno.replace(/\s+/g, '_')}_${numGuia}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
