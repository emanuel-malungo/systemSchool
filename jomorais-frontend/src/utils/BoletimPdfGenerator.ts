import jsPDF from 'jspdf'

export interface IBoletimAlunoData {
  numero: number
  aluno: {
    codigo: number
    nome: string
    dataNascimento?: string
  }
  notas: Array<{
    codigoDisciplina: number
    disciplina: string
    nota: number
  }>
  mediaGeral: number
  situacao: 'TRANSITA' | 'N-TRANSITA'
  faltas: number
  comportamento: string
}

export interface IBoletimTurmaData {
  turma: {
    codigo: number
    designacao: string
    classe: string
    periodo: string
    sala: string
    curso: string
  }
  anoLetivo: string
  trimestre: string
  disciplinas: Array<{
    codigo: number
    designacao: string
    abreviatura?: string
  }>
  directorTurma: string
  contactoDirector: string
  instituicao: {
    nome: string
    endereco?: string
    telefone?: string
    email?: string
  }
  boletins: IBoletimAlunoData[]
  totalAlunos: number
  dataGeracao: string
}

export class BoletimPdfGenerator {
  /**
   * Gera PDF de boletins para todos os alunos da turma.
   * Formato: 2 boletins por linha, múltiplas linhas por página (A4 landscape).
   * Cada boletim é um card fiel ao modelo ITPS Jomorais.
   */
  static generatePDF(data: IBoletimTurmaData): void {
    const { turma, anoLetivo, trimestre, disciplinas, directorTurma, contactoDirector, instituicao, boletins } = data

    // Ordenar disciplinas para colunas fixas (consistente com a imagem)
    const colsDisciplinas = disciplinas.slice(0, 12) // máximo 12 colunas de disciplina

    // A4 paisagem
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pW = doc.internal.pageSize.width   // 297mm
    const pH = doc.internal.pageSize.height  // 210mm

    // Cada boletim ocupa metade da largura com margem
    const marginPage = 5
    const gapH = 4
    const boletimW = (pW - marginPage * 2 - gapH) / 2   // ~141mm

    // Altura de cada boletim card
    const logoH = 10
    const infoRowH = 6
    const headerRowH = 7
    const dataRowH = 6
    const footerRowH = 5
    const cardPad = 2
    const boletimH = cardPad * 2 + logoH + infoRowH + headerRowH + dataRowH + footerRowH + 2

    let pageIndex = 0
    let col = 0  // 0 = left, 1 = right
    let row = 0  // row within page

    // Max rows per page
    const maxRows = Math.floor((pH - marginPage * 2) / (boletimH + 2))

    const getCardX = (c: number) => marginPage + c * (boletimW + gapH)
    const getCardY = (r: number) => marginPage + r * (boletimH + 2)

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return { r, g, b }
    }

    const drawBoletim = (boletim: IBoletimAlunoData, cx: number, cy: number) => {
      const w = boletimW
      let y = cy + cardPad
      const x = cx

      // ── Borda exterior do card ──────────────────────────────────────
      doc.setDrawColor(80, 80, 80)
      doc.setLineWidth(0.4)
      doc.rect(cx, cy, w, boletimH)

      // ── HEADER: Logo + Nome da instituição ──────────────────────────
      // Logo (escudo simulado)
      const lx = x + 2
      const lr = 4.5
      // Escudo exterior verde-escuro
      doc.setFillColor(20, 100, 20)
      doc.circle(lx + lr, y + lr, lr, 'F')
      // Aro amarelo
      doc.setFillColor(255, 200, 0)
      doc.circle(lx + lr, y + lr, lr - 1.2, 'F')
      // Centro verde
      doc.setFillColor(20, 100, 20)
      doc.circle(lx + lr, y + lr, lr - 2.2, 'F')
      // Texto "ITPS"
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(3)
      doc.setTextColor(255, 255, 255)
      doc.text('ITPS', lx + lr, y + lr + 0.8, { align: 'center' })
      doc.setTextColor(0, 0, 0)

      // Nome da instituição
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(5.5)
      const instNome = (instituicao.nome || 'INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS').toUpperCase()
      doc.text(instNome, x + lr * 2 + 4, y + lr, { baseline: 'middle' })

      // Linha divisória
      y += logoH
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.3)
      doc.line(x, y, x + w, y)

      // ── FAIXA DE INFO (amarela) ─────────────────────────────────────
      doc.setFillColor(255, 230, 0)
      doc.rect(x, y, w, infoRowH, 'F')
      doc.setDrawColor(80, 80, 80)
      doc.setLineWidth(0.2)
      doc.rect(x, y, w, infoRowH)

      // Conteúdo da faixa: ANO LECTIVO | CLASSE | CURSO | SALA | PERÍODO | N-TRIMESTRE
      const infoItems = [
        { label: 'ANO LECTIVO:', value: anoLetivo },
        { label: 'CLASSE:', value: turma.classe + 'ª' },
        { label: 'CURSO:', value: turma.curso },
        { label: 'SALA:', value: turma.designacao },
        { label: 'PERÍODO:', value: turma.periodo },
        { label: 'N-TRIMESTRE:', value: trimestre },
      ]

      const infoItemW = w / infoItems.length
      infoItems.forEach((item, i) => {
        const ix = x + i * infoItemW + 1
        const iy = y + infoRowH / 2

        doc.setFont('Helvetica', 'bold')
        doc.setFontSize(4)
        doc.setTextColor(180, 0, 0) // vermelho para labels
        doc.text(item.label, ix, iy - 0.8, { baseline: 'bottom' })

        doc.setTextColor(0, 0, 0)
        doc.setFont('Helvetica', 'bold')
        doc.setFontSize(4.2)
        doc.text(item.value, ix, iy + 0.8, { baseline: 'top' })

        // Divisória vertical
        if (i < infoItems.length - 1) {
          doc.setDrawColor(120, 120, 120)
          doc.setLineWidth(0.15)
          doc.line(x + (i + 1) * infoItemW, y, x + (i + 1) * infoItemW, y + infoRowH)
        }
      })
      doc.setTextColor(0, 0, 0)

      y += infoRowH

      // ── TABELA DE NOTAS ─────────────────────────────────────────────
      // Definir colunas
      const colNr = 5       // Nº
      const colNome = 28    // NOME
      const colObs = 12     // OBS
      const colsDW = colsDisciplinas.length > 0
        ? (w - colNr - colNome - colObs) / colsDisciplinas.length
        : 8

      // Linha de cabeçalho da tabela (cinza claro)
      doc.setFillColor(220, 220, 220)
      doc.rect(x, y, w, headerRowH, 'F')
      doc.setDrawColor(80, 80, 80)
      doc.setLineWidth(0.2)
      doc.rect(x, y, w, headerRowH)

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(4)
      doc.setTextColor(0, 0, 0)

      // Headers
      doc.text('Nº', x + colNr / 2, y + headerRowH / 2, { align: 'center', baseline: 'middle' })
      doc.line(x + colNr, y, x + colNr, y + headerRowH)

      doc.text('NOME', x + colNr + colNome / 2, y + headerRowH / 2, { align: 'center', baseline: 'middle' })
      doc.line(x + colNr + colNome, y, x + colNr + colNome, y + headerRowH)

      let colX = x + colNr + colNome
      colsDisciplinas.forEach((disc, i) => {
        const label = disc.abreviatura || disc.designacao.substring(0, 6)
        doc.text(label, colX + colsDW / 2, y + headerRowH / 2, { align: 'center', baseline: 'middle' })
        colX += colsDW
        doc.line(colX, y, colX, y + headerRowH)
      })

      doc.text('OBS', x + w - colObs / 2, y + headerRowH / 2, { align: 'center', baseline: 'middle' })

      y += headerRowH

      // ── Linha de dados do aluno ──────────────────────────────────────
      doc.setFillColor(255, 255, 255)
      doc.rect(x, y, w, dataRowH, 'F')
      doc.setDrawColor(80, 80, 80)
      doc.setLineWidth(0.2)
      doc.rect(x, y, w, dataRowH)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(4.2)

      // Nº
      doc.text(String(boletim.numero), x + colNr / 2, y + dataRowH / 2, { align: 'center', baseline: 'middle' })
      doc.line(x + colNr, y, x + colNr, y + dataRowH)

      // Nome (truncado se necessário)
      const nomeDisplay = boletim.aluno.nome.length > 22
        ? boletim.aluno.nome.substring(0, 22) + '.'
        : boletim.aluno.nome
      doc.text(nomeDisplay, x + colNr + 1, y + dataRowH / 2, { baseline: 'middle' })
      doc.line(x + colNr + colNome, y, x + colNr + colNome, y + dataRowH)

      // Notas por disciplina
      let cdX = x + colNr + colNome
      colsDisciplinas.forEach((disc) => {
        const notaObj = boletim.notas.find(n => n.codigoDisciplina === disc.codigo)
        const notaVal = notaObj ? String(notaObj.nota) : '-'
        const nota = notaObj?.nota ?? -1

        // Cor: vermelho se < 10
        if (nota >= 0 && nota < 10) {
          doc.setTextColor(180, 0, 0)
          doc.setFont('Helvetica', 'bold')
        } else {
          doc.setTextColor(0, 0, 0)
          doc.setFont('Helvetica', 'normal')
        }

        doc.text(notaVal, cdX + colsDW / 2, y + dataRowH / 2, { align: 'center', baseline: 'middle' })
        cdX += colsDW
        doc.setDrawColor(80, 80, 80)
        doc.line(cdX, y, cdX, y + dataRowH)
      })

      doc.setTextColor(0, 0, 0)
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(4)

      // OBS (TRANSITA / N-TRANSITA)
      const obsColor = boletim.situacao === 'TRANSITA' ? { r: 0, g: 120, b: 0 } : { r: 180, g: 0, b: 0 }
      doc.setTextColor(obsColor.r, obsColor.g, obsColor.b)
      doc.text(boletim.situacao, x + w - colObs / 2, y + dataRowH / 2, { align: 'center', baseline: 'middle' })
      doc.setTextColor(0, 0, 0)

      y += dataRowH

      // ── RODAPÉ ──────────────────────────────────────────────────────
      doc.setFillColor(255, 255, 255)
      doc.rect(x, y, w, footerRowH, 'F')
      doc.setDrawColor(80, 80, 80)
      doc.setLineWidth(0.2)
      doc.rect(x, y, w, footerRowH)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(3.8)
      doc.setTextColor(0, 0, 0)

      const footerY = y + footerRowH / 2

      // Comportamento
      doc.text(`Comportamento: ${boletim.comportamento}`, x + 2, footerY, { baseline: 'middle' })

      // Faltas em vermelho
      doc.setTextColor(180, 0, 0)
      doc.setFont('Helvetica', 'bold')
      doc.text(`Faltas: ${boletim.faltas}`, x + 28, footerY, { baseline: 'middle' })
      doc.setTextColor(0, 0, 0)

      // Separador vertical
      doc.setLineWidth(0.15)
      doc.line(x + 45, y, x + 45, y + footerRowH)

      // Directora
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(3.5)
      doc.text(`Directora de turma: ${directorTurma}`, x + 47, footerY, { baseline: 'middle' })

      // Separador vertical
      doc.line(x + w - 28, y, x + w - 28, y + footerRowH)

      // Contacto em vermelho
      doc.setTextColor(180, 0, 0)
      doc.setFont('Helvetica', 'bold')
      doc.text(`Contacto: ${contactoDirector}`, x + w - 27, footerY, { baseline: 'middle' })
      doc.setTextColor(0, 0, 0)
    }

    // ── RENDER DOS BOLETINS ─────────────────────────────────────────────
    boletins.forEach((boletim, idx) => {
      if (idx > 0 && col === 0 && row === 0) {
        doc.addPage()
        pageIndex++
      }

      const cx = getCardX(col)
      const cy = getCardY(row)
      drawBoletim(boletim, cx, cy)

      col++
      if (col >= 2) {
        col = 0
        row++
        if (row >= maxRows) {
          row = 0
          // Próximo boletim vai forçar nova página
          if (idx < boletins.length - 1) {
            // Reseta col para forçar nova página no próximo idx
            col = 0
            row = 0
            // Adiciona página
            if (idx < boletins.length - 1) {
              doc.addPage()
            }
          }
        }
      }
    })

    const nomeTurma = turma.designacao.replace(/\s+/g, '_')
    doc.save(`Boletins_Turma_${nomeTurma}_${trimestre}.pdf`)
  }
}
