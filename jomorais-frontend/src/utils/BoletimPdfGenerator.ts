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

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Abbreviate a discipline name to fit in a narrow column */
function abbrev(name: string, maxLen = 8): string {
  if (!name) return ''
  // Known short forms
  const MAP: Record<string, string> = {
    'Lingua Portuguesa': 'L. Port.',
    'Lingua Inglesa': 'L. Ingl.',
    'Matematica': 'Mat.',
    'Biologia': 'Biol.',
    'Fisica': 'Fis.',
    'Quimica': 'Quim.',
    'Quimica Organica': 'Qca Org.',
    'Microbiologia': 'Microbiol.',
    'Hematologia': 'Hemat.',
    'Imunologia': 'Imunol.',
    'Urinalise': 'Urinol.',
    'Urinalise ': 'Urinol.',
    'Parasitologia': 'Parasitol.',
    'Educacao Fisica': 'Ed. Fisica',
    'Formacao de Atitudes Integradoras': 'A.F.H',
    'Formacao de Atitudes': 'A.F.H',
    'Ingles': 'Ingles',
  }
  const found = Object.entries(MAP).find(([k]) =>
    name.toLowerCase().includes(k.toLowerCase())
  )
  if (found) return found[1]
  return name.length > maxLen ? name.substring(0, maxLen - 1) + '.' : name
}

// ─── Main class ─────────────────────────────────────────────────────────────

export class BoletimPdfGenerator {
  /**
   * Gera PDF de boletins para todos os alunos da turma.
   * Formato: A4 portrait, 5 boletins por página (1 coluna).
   * Layout fiel ao modelo ITPS Jomorais.
   */
  static generatePDF(data: IBoletimTurmaData): void {
    const {
      turma,
      anoLetivo,
      trimestre,
      disciplinas,
      directorTurma,
      contactoDirector,
      instituicao,
      boletins,
    } = data

    // Up to 12 discipline columns (to fit on page and match the image)
    const colsDisciplinas = [...disciplinas.slice(0, 12)]
    while (colsDisciplinas.length < 12) {
      colsDisciplinas.push({
        codigo: -1 - colsDisciplinas.length,
        designacao: '',
        abreviatura: ''
      })
    }

    // ── Page setup ─────────────────────────────────────────────────────────
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pW = doc.internal.pageSize.width   // 210 mm

    const marginX = 6   // left & right page margin
    const marginY = 12  // top page margin
    const boletimW = pW - marginX * 2       // ~198 mm wide
    
    // ── Card section heights (mm) ──────────────────────────────────────────
    const hHeader  = 10   // logo + institution name row
    const hInfo    = 6    // info strip
    const hColHead = 7.5  // column header row (N. | NOME | disciplines | OBS)
    const hData    = 7.5  // student data row
    const hFooter  = 5.5  // comportamento / faltas / director row
    const hCard    = hHeader + hInfo + hColHead + hData + hFooter  // 36.5 mm

    // 5 boletins per page
    const boletimsPerPage = 5
    const gapBetween = 22.6 // space between cards to distribute perfectly on A4

    // ── Trim label ─────────────────────────────────────────────────────────
    const trimNum = parseInt(trimestre) || 1
    const romanMap: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III' }
    const trimLabel = `${romanMap[trimNum] || trimNum}-TRIMESTRE`

    // ── Column widths ──────────────────────────────────────────────────────
    const colNr   = 7     // N.
    const colObs  = 16    // OBS
    const colNome = 36    // NOME
    const discTotalW = boletimW - colNr - colNome - colObs
    const colDisc = discTotalW / 12 // exactly 12 columns

    // ── drawBoletim ────────────────────────────────────────────────────────
    const drawBoletim = (boletim: IBoletimAlunoData, cx: number, cy: number) => {
      const x  = cx
      let   y  = cy

      // ── 1. HEADER ROW: logo + institution name ──────────────────────────
      // Outer border for whole card
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.6)
      doc.rect(x, y, boletimW, hCard)

      // Inner header bottom border
      doc.setLineWidth(0.4)
      doc.line(x, y + hHeader, x + boletimW, y + hHeader)

      // Pill-shaped Logo (C.E.I.P.P. JOMORAIS)
      const logoW = 18
      const logoH = 7
      const logoX = x + 3
      const logoY = y + (hHeader - logoH) / 2
      
      // Draw outer green pill
      doc.setDrawColor(10, 100, 20)
      doc.setFillColor(230, 210, 0) // Yellow background
      doc.setLineWidth(0.3)
      doc.roundedRect(logoX, logoY, logoW, logoH, 1.8, 1.8, 'FD')

      // Text in logo
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(2.8)
      doc.setTextColor(10, 100, 20) // Green
      doc.text('C.E.I.P.P.', logoX + logoW / 2, logoY + 2.6, { align: 'center' })
      doc.setFontSize(3)
      doc.text('JOMORAIS', logoX + logoW / 2, logoY + 5.8, { align: 'center' })

      // School Name Text
      const instNome = (instituicao.nome || 'INSTITUTO TECNICO PRIVADO DE SAUDE JOMORAIS').toUpperCase()
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(0, 0, 0)
      doc.text(instNome, x + (boletimW + logoW + 3) / 2, y + hHeader / 2, {
        align: 'center',
        baseline: 'middle',
      })

      y += hHeader

      // ── 2. INFO STRIP ──────────────────────────────────────────────────
      doc.setLineWidth(0.4)
      doc.line(x, y + hInfo, x + boletimW, y + hInfo)

      const infoMidY = y + hInfo / 2

      // Spaced items in info strip (Label in Red, Value in Black)
      const drawLabelValue = (label: string, value: string, lx: number) => {
        doc.setFont('Helvetica', 'bold')
        doc.setFontSize(6.5)
        doc.setTextColor(180, 0, 0) // Red
        doc.text(label, lx, infoMidY, { baseline: 'middle' })
        
        const labelWidth = doc.getTextWidth(label)
        doc.setTextColor(0, 0, 0) // Black
        doc.text(' ' + value, lx + labelWidth, infoMidY, { baseline: 'middle' })
      }

      drawLabelValue('ANO LECTIVO:', anoLetivo, x + 8)
      drawLabelValue('CLASSE:', turma.classe ? turma.classe + 'a' : '-', x + 50)
      drawLabelValue('CURSO:', turma.curso || '-', x + 80)
      drawLabelValue('SALA:', turma.sala || turma.designacao, x + 115)
      drawLabelValue('PERIODO:', (turma.periodo || '').toUpperCase(), x + 140)

      // Trimestre (Black bold only, right-aligned)
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(0, 0, 0)
      doc.text(trimLabel, x + boletimW - 8, infoMidY, { align: 'right', baseline: 'middle' })

      y += hInfo

      // ── 3. COLUMN HEADER ROW ────────────────────────────────────────────
      doc.setLineWidth(0.4)
      doc.line(x, y + hColHead, x + boletimW, y + hColHead)

      const colHeadMidY = y + hColHead / 2

      // Draw N.
      doc.setFont('Helvetica', 'bolditalic')
      doc.setFontSize(6)
      doc.setTextColor(0, 0, 0)
      doc.text('N.', x + colNr / 2, colHeadMidY, { align: 'center', baseline: 'middle' })
      doc.setLineWidth(0.3)
      doc.line(x + colNr, y, x + colNr, y + hColHead)

      // Draw NOME
      doc.text('NOME', x + colNr + colNome / 2, colHeadMidY, { align: 'center', baseline: 'middle' })
      doc.line(x + colNr + colNome, y, x + colNr + colNome, y + hColHead)

      // Draw disciplines
      let dHX = x + colNr + colNome
      colsDisciplinas.forEach((disc) => {
        const label = disc.codigo < 0 ? '' : (disc.abreviatura || abbrev(disc.designacao, 9))
        doc.setFont('Helvetica', 'bolditalic')
        doc.setFontSize(5)
        doc.text(label, dHX + colDisc / 2, colHeadMidY, { align: 'center', baseline: 'middle' })
        dHX += colDisc
        doc.line(dHX, y, dHX, y + hColHead)
      })

      // Draw OBS
      doc.setFont('Helvetica', 'bolditalic')
      doc.setFontSize(6)
      doc.text('OBS', x + boletimW - colObs / 2, colHeadMidY, { align: 'center', baseline: 'middle' })

      y += hColHead

      // ── 4. DATA ROW (student grades) ────────────────────────────────────
      const dataMidY = y + hData / 2

      // Draw student number
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(6)
      doc.text(String(boletim.numero), x + colNr / 2, dataMidY, { align: 'center', baseline: 'middle' })
      doc.setLineWidth(0.3)
      doc.line(x + colNr, y, x + colNr, y + hData)

      // Draw student name
      const nomeDisplay = boletim.aluno.nome.length > 25
        ? boletim.aluno.nome.substring(0, 24) + '.'
        : boletim.aluno.nome
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.text(nomeDisplay, x + colNr + 1.5, dataMidY, { baseline: 'middle' })
      doc.line(x + colNr + colNome, y, x + colNr + colNome, y + hData)

      // Draw discipline grades
      let dDX = x + colNr + colNome
      colsDisciplinas.forEach((disc) => {
        let notaStr = '-'
        let isNegative = false
        let isPlaceholder = disc.codigo < 0

        if (!isPlaceholder) {
          const notaObj = boletim.notas.find(n => n.codigoDisciplina === disc.codigo)
          const notaVal = notaObj !== undefined ? notaObj.nota : null
          if (notaVal !== null) {
            notaStr = notaVal.toFixed(1).replace('.', ',')
            isNegative = notaVal < 10
          }
        }

        doc.setFont('Helvetica', 'bold')
        doc.setFontSize(6.5)
        if (isPlaceholder) {
          notaStr = ''
        } else if (isNegative) {
          doc.setTextColor(200, 0, 0) // Red
        } else {
          doc.setTextColor(0, 60, 180) // Blue
        }
        
        doc.text(notaStr, dDX + colDisc / 2, dataMidY, { align: 'center', baseline: 'middle' })
        dDX += colDisc
        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(0.3)
        doc.line(dDX, y, dDX, y + hData)
      })

      // Draw OBS (TRANSITA / N-TRANSITA)
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(6)
      if (boletim.situacao === 'TRANSITA') {
        doc.setTextColor(0, 60, 180) // Blue (matching grades)
      } else {
        doc.setTextColor(200, 0, 0) // Red
      }
      doc.text(boletim.situacao, x + boletimW - colObs / 2, dataMidY, {
        align: 'center',
        baseline: 'middle',
      })
      doc.setTextColor(0, 0, 0)

      y += hData

      // ── DOUBLE HORIZONTAL LINE (separating grades and footer) ───────────
      doc.setLineWidth(0.2)
      doc.setDrawColor(0, 0, 0)
      doc.line(x, y, x + boletimW, y)
      doc.line(x, y + 0.4, x + boletimW, y + 0.4)

      // ── 5. FOOTER ROW ────────────────────────────────────────────────────
      const footMidY = y + hFooter / 2 + 0.2

      // Comportamento: Bom (Black)
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(5.5)
      doc.setTextColor(0, 0, 0)
      doc.text(`Comportamento: ${boletim.comportamento}`, x + 2, footMidY, { baseline: 'middle' })

      // Faltas (Label Black, Value Blue)
      doc.setFont('Helvetica', 'normal')
      doc.text('Faltas: ', x + colNr + colNome + 2, footMidY, { baseline: 'middle' })
      const labelW = doc.getTextWidth('Faltas: ')
      doc.setFont('Helvetica', 'bold')
      doc.setTextColor(0, 60, 180) // Blue value
      doc.text(String(boletim.faltas), x + colNr + colNome + 2 + labelW, footMidY, { baseline: 'middle' })

      // Directora de turma (Blue text)
      doc.setFont('Helvetica', 'bold')
      doc.setTextColor(0, 60, 180) // Blue
      doc.text(`Directora de turma: ${directorTurma}`, x + colNr + colNome + colDisc * 2 + 2, footMidY, { baseline: 'middle' })

      // Contacto (Red text)
      doc.setFont('Helvetica', 'bold')
      doc.setTextColor(180, 0, 0) // Red
      doc.text(`Contacto: ${contactoDirector}`, x + colNr + colNome + colDisc * 12 + 2, footMidY, { baseline: 'middle' })
      doc.setTextColor(0, 0, 0)

      // Draw footer vertical separators
      doc.setLineWidth(0.3)
      doc.line(x + colNr + colNome, y + 0.4, x + colNr + colNome, y + hFooter)
      doc.line(x + colNr + colNome + colDisc * 2, y + 0.4, x + colNr + colNome + colDisc * 2, y + hFooter)
      doc.line(x + colNr + colNome + colDisc * 12, y + 0.4, x + colNr + colNome + colDisc * 12, y + hFooter)
    }

    // ── RENDER ALL BOLETINS ──────────────────────────────────────────────────
    boletins.forEach((boletim, idx) => {
      // Add page when needed (every 5 boletins)
      if (idx > 0 && idx % boletimsPerPage === 0) {
        doc.addPage()
      }

      const posInPage = idx % boletimsPerPage
      const cy = marginY + posInPage * (hCard + gapBetween)
      const cx = marginX

      drawBoletim(boletim, cx, cy)
    })

    // ── SAVE ────────────────────────────────────────────────────────────────
    const nomeTurma = turma.designacao.replace(/\s+/g, '_')
    doc.save(`Boletins_${nomeTurma}_${trimLabel}.pdf`)
  }
}
