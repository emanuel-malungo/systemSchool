import jsPDF from 'jspdf'

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
    const logoSize = 22

    // Desenhar escudo simulado (círculo verde + contorno)
    doc.setFillColor(34, 120, 34)
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 'F')
    doc.setFillColor(255, 200, 0)
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 - 3, 'F')
    doc.setFillColor(34, 120, 34)
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 - 5, 'F')
    // Texto "ITPS" dentro do logo
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(5)
    doc.setTextColor(255, 255, 255)
    doc.text('ITPS', logoX + logoSize / 2, logoY + logoSize / 2 + 1, { align: 'center' })
    doc.setTextColor(0, 0, 0)

    // Nome da instituição alinhado verticalmente ao centro do logo
    const instNome = (instituicao.nome || 'INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS').toUpperCase()
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(13)
    const textX = logoX + logoSize + 5
    doc.text(instNome, textX, logoY + logoSize / 2 + 2)

    y = logoY + logoSize + 4

    // Linha horizontal sob o cabeçalho
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.8)
    doc.line(marginL, y, pageWidth - marginR, y)
    y += 14

    // ── TÍTULO ──────────────────────────────────────────────────────────────
    const anoEmissao = transferencia.dataTransferencia
      ? new Date(transferencia.dataTransferencia).getFullYear()
      : new Date().getFullYear()
    const numGuia = String(transferencia.codigo).padStart(3, '0')
    const sigla = 'DCITPSJM'
    const titulo = `GUIA DE TRANSFERÊNCIA Nº.${numGuia}/${sigla}/${anoEmissao}`

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(13)
    const tituloWidth = (doc.getStringUnitWidth(titulo) * 13) / doc.internal.scaleFactor
    const tituloX = (pageWidth - tituloWidth) / 2
    doc.text(titulo, tituloX, y)
    // Sublinhado do título
    doc.setLineWidth(0.4)
    doc.line(tituloX, y + 1, tituloX + tituloWidth, y + 1)
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
      { text: ` da ${classe}ª Classe, n.º`, bold: false },
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
    const cidade = 'Cabinda'
    const dataDoc = this.formatDateLong(transferencia.dataTransferencia)
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`${cidade}, ${dataDoc}.`, marginL, y)
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
    doc.setTextColor(120, 120, 120)
    if (instituicao.endereco || instituicao.telefone) {
      const rodape = [
        instituicao.endereco,
        instituicao.telefone ? `Tel: ${instituicao.telefone}` : '',
        instituicao.email ? `Email: ${instituicao.email}` : ''
      ].filter(Boolean).join(' | ')
      doc.text(rodape, pageWidth / 2, pageHeight - 10, { align: 'center' })
    }
    doc.setTextColor(0, 0, 0)

    // Salvar PDF
    const fileName = `Guia_Transferencia_${nomeAluno.replace(/\s+/g, '_')}_${numGuia}.pdf`
    doc.save(fileName)
  }
}
