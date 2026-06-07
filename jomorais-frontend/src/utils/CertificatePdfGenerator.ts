import jsPDF from 'jspdf'
import icon from "../assets/images/icon.png"

export interface ICertificatePdfData {
  Codigo: number
  NumeroCertificado: string
  DataEmissao: string
  DataAssinatura?: string | null
  Status: string
  Observacoes?: string | null
  mediaFinal: number
  tb_alunos: {
    codigo: number
    nome: string
    pai?: string | null
    mae?: string | null
    n_documento_identificacao?: string | null
    tb_matriculas?: {
      codigo: number
      tb_cursos?: {
        designacao: string
      } | null
      tb_confirmacoes?: Array<{
        codigo: number
        tb_turmas?: {
          designacao: string
          tb_classes?: {
            designacao: string
          } | null
        } | null
      }> | null
    } | null
  }
  tb_disciplinas: {
    codigo: number
    designacao: string
  }
  tb_ano_lectivo: {
    codigo: number
    designacao: string
  }
  tb_utilizadores?: {
    codigo: number
    nome: string
  } | null
}

export class CertificatePdfGenerator {
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

  private static writeJustifiedMixed(
    doc: jsPDF,
    segments: Array<{ text: string; bold: boolean }>,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): number {
    const fontSize = doc.getFontSize()
    const scaleFactor = doc.internal.scaleFactor

    interface Word {
      word: string
      bold: boolean
    }
    const words: Word[] = []
    for (const seg of segments) {
      const parts = seg.text.split(/(\s+)/)
      for (const part of parts) {
        if (part.trim().length > 0) {
          words.push({ word: part.trim(), bold: seg.bold })
        }
      }
    }

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

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li]
      const isLast = li === lines.length - 1

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
        curX += getWordWidth(w) + (wi < line.length - 1 ? spacePerGap : 0)
      }

      y += lineHeight
    }

    return y
  }

  static generatePDF(data: ICertificatePdfData): void {
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

    // ── BORDA PREMIUM EXTERNA ──────────────────────────────────────────────
    doc.setDrawColor(180, 140, 60) // Cor dourada/bronze
    doc.setLineWidth(1.2)
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

    doc.setDrawColor(220, 200, 150) // Linha interna mais fina
    doc.setLineWidth(0.4)
    doc.rect(11.5, 11.5, pageWidth - 23, pageHeight - 23)

    // ── CABEÇALHO ──────────────────────────────────────────────────────────
    const logoSize = 24
    const logoX = (pageWidth - logoSize) / 2
    
    // Adicionar escudo/logotipo da escola
    try {
      doc.addImage(icon, 'PNG', logoX, y, logoSize, logoSize)
    } catch (e) {
      console.warn('Erro ao carregar imagem do logotipo no PDF:', e)
    }
    y += logoSize + 4

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('REPÚBLICA DE ANGOLA', pageWidth / 2, y, { align: 'center' })
    y += 5
    doc.text('GOVERNO DA PROVÍNCIA DE CABINDA', pageWidth / 2, y, { align: 'center' })
    y += 5
    
    doc.setFontSize(12)
    doc.setFont('Helvetica', 'bold')
    doc.text('INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS', pageWidth / 2, y, { align: 'center' })
    y += 10

    // Linha divisória fina
    doc.setDrawColor(180, 140, 60)
    doc.setLineWidth(0.6)
    doc.line(marginL + 10, y, pageWidth - marginR - 10, y)
    y += 12

    // ── TÍTULO DO CERTIFICADO ────────────────────────────────────────────────
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(15)
    doc.text('CERTIFICADO DE APROVEITAMENTO DISCIPLINAR', pageWidth / 2, y, { align: 'center' })
    y += 15

    // ── CORPO DO CERTIFICADO ─────────────────────────────────────────────────
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(11.5)
    const lh = 7.5

    const aluno = data.tb_alunos
    const nomeAluno = (aluno.nome || 'N/A').toUpperCase()
    const pai = aluno.pai ? aluno.pai.toUpperCase() : 'N/A'
    const mae = aluno.mae ? aluno.mae.toUpperCase() : 'N/A'
    const matricula = aluno.tb_matriculas
    const curso = matricula?.tb_cursos?.designacao || 'N/A'
    const confirmacao = matricula?.tb_confirmacoes?.[0]
    const turma = confirmacao?.tb_turmas?.designacao || 'N/A'
    const classe = confirmacao?.tb_turmas?.tb_classes?.designacao || 'N/A'
    const disciplina = data.tb_disciplinas.designacao
    const anoLectivo = data.tb_ano_lectivo.designacao
    const mediaValores = data.mediaFinal.toFixed(1)

    const textSegments = [
      { text: 'Certificamos para os efeitos convenientes que o(a) aluno(a) ', bold: false },
      { text: nomeAluno, bold: true },
      { text: ', filho(a) de ', bold: false },
      { text: pai, bold: true },
      { text: ' e de ', bold: false },
      { text: mae, bold: true },
      { text: ', matriculado(a) no curso técnico de ', bold: false },
      { text: curso, bold: true },
      { text: `, na ${classe}ª Classe, turma `, bold: false },
      { text: turma, bold: true },
      { text: ', concluiu com aproveitamento e aproveitou positivamente a disciplina de ', bold: false },
      { text: disciplina, bold: true },
      { text: ', no Ano Letivo ', bold: false },
      { text: anoLectivo, bold: true },
      { text: ', tendo obtido a média final de ', bold: false },
      { text: `${mediaValores} valores`, bold: true },
      { text: ', conforme os registos de avaliação académica arquivados nesta instituição de ensino.', bold: false }
    ]

    y = this.writeJustifiedMixed(doc, textSegments, marginL, y, maxWidth, lh)
    y += 15

    // ── DATA DE EMISSÃO ──────────────────────────────────────────────────────
    const dataDoc = this.formatDateLong(data.DataEmissao)
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`Cabinda, aos ${dataDoc}.`, marginL, y)
    y += 20

    // ── ASSINATURAS ──────────────────────────────────────────────────────────
    const sigX = pageWidth / 2
    doc.setFont('Helvetica', 'normal')
    doc.text('O Director do Instituto', sigX, y, { align: 'center' })
    y += 20

    // Linha de assinatura
    doc.setLineWidth(0.4)
    doc.setDrawColor(0, 0, 0)
    doc.line(sigX - 45, y, sigX + 45, y)
    y += 6

    doc.setFont('Helvetica', 'bold')
    doc.text('GABRIEL PRÓSPERO MABIALA', sigX, y, { align: 'center' })
    y += 20

    // ── RODAPÉ DE VERIFICAÇÃO PÚBLICA ────────────────────────────────────────
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 100, 100)
    
    // Caixa de verificação elegante no fundo do certificado
    const checkY = pageHeight - 38
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.rect(marginL, checkY, maxWidth, 18)
    
    doc.setFont('Helvetica', 'bold')
    doc.text('VERIFICAÇÃO PÚBLICA DE AUTENTICIDADE', marginL + 4, checkY + 5)
    
    doc.setFont('Helvetica', 'normal')
    doc.text(`Número do Certificado: ${data.NumeroCertificado}`, marginL + 4, checkY + 10)
    
    const host = window.location.origin
    doc.text(`Para verificar a autenticidade deste documento aceda a: ${host}/verificar/${data.NumeroCertificado}`, marginL + 4, checkY + 14)

    // Salvar PDF
    const cleanName = nomeAluno.replace(/\s+/g, '_')
    doc.save(`Certificado_${cleanName}_${data.NumeroCertificado}.pdf`)
  }
}
