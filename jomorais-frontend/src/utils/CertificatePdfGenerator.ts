import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import icon from "../assets/images/icon.png"

export interface ICertificatePdfData {
  Codigo: number
  NumeroCertificado: string
  DataEmissao: string
  DataAssinatura?: string | null
  Status: string
  Observacoes?: string | null
  mediaFinal: number
  gradeDetails?: Array<{
    codigo: number
    designacao: string
    notas: Record<string, { nota: number; anoLetivo: string }>
  }>
  tb_alunos: {
    codigo: number
    nome: string
    pai?: string | null
    mae?: string | null
    sexo?: string | null
    dataNascimento?: string | null
    n_documento_identificacao?: string | null
    provinciaEmissao?: string | null
    dataEmissao?: string | null
    morada?: string | null
    naturalidade?: string | null
    tb_comunas?: {
      designacao: string
      tb_municipios?: {
        designacao: string
        tb_provincias?: {
          designacao: string
        } | null
      } | null
    } | null
    tb_matriculas?: {
      codigo: number
      tb_cursos?: {
        designacao: string
      } | null
      tb_confirmacoes?: Array<{
        codigo: number
        codigo_Turma: number
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
      'Dezoito', 'Dezanove', 'Vinte'
    ]
    return words[num] || String(num)
  }

  private static writeJustifiedMixed(
    doc: jsPDF,
    segments: Array<{ text: string; bold: boolean; underline?: boolean; color?: number[]; fontName?: string }>,
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
      underline: boolean
      color?: number[]
      fontName: string
    }
    const words: Word[] = []
    for (const seg of segments) {
      const parts = seg.text.split(/(\s+)/)
      for (const part of parts) {
        if (part.trim().length > 0) {
          words.push({ word: part.trim(), bold: seg.bold, underline: seg.underline ?? false, color: seg.color, fontName: seg.fontName || 'Helvetica' })
        }
      }
    }

    const lines: Word[][] = []
    let currentLine: Word[] = []
    let currentWidth = 0

    const getWordWidth = (w: Word): number => {
      doc.setFont(w.fontName, w.bold ? 'bold' : 'normal')
      return (doc.getStringUnitWidth(w.word) * fontSize) / scaleFactor
    }

    const spaceWidth = (fontName: string = 'Helvetica'): number => {
      doc.setFont(fontName, 'normal')
      return (doc.getStringUnitWidth(' ') * fontSize) / scaleFactor
    }

    for (const word of words) {
      const ww = getWordWidth(word)
      const gap = currentLine.length > 0 ? spaceWidth(word.fontName) : 0
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
      const defaultSpace = spaceWidth(line[0]?.fontName || 'Helvetica')
      const spacePerGap = isLast || gaps === 0 ? defaultSpace : totalSpaceAvailable / gaps

      let curX = x
      for (let wi = 0; wi < line.length; wi++) {
        const w = line[wi]
        doc.setFont(w.fontName, w.bold ? 'bold' : 'normal')
        if (w.color) {
          doc.setTextColor(w.color[0], w.color[1], w.color[2])
        } else {
          doc.setTextColor(0, 0, 0)
        }
        doc.text(w.word, curX, y)

        if (w.underline) {
          const ww = getWordWidth(w)
          doc.setLineWidth(0.25)
          doc.line(curX, y + 0.6, curX + ww, y + 0.6)
        }

        curX += getWordWidth(w) + (wi < line.length - 1 ? spacePerGap : 0)
      }

      y += lineHeight
    }

    doc.setTextColor(0, 0, 0)
    return y
  }

  static generatePDF(data: ICertificatePdfData): void {
    const confirmacao = data.tb_alunos.tb_matriculas?.tb_confirmacoes?.[0]
    const classeDesignacao = confirmacao?.tb_turmas?.tb_classes?.designacao || ''
    const isNonaClasse = classeDesignacao.toLowerCase().includes('9ª')

    if (isNonaClasse) {
      this.generate9thClassPDF(data)
    } else {
      this.generateMiddleClassPDF(data)
    }
  }

  /**
   * LAYOUT 1: CERTIFICADO DA 9ª CLASSE (ENSINO GERAL)
   */
      private static generate9thClassPDF(data: ICertificatePdfData): void {
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
    let y = 15

    // ── BORDA EXTERNA ──
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.4)
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

    // ── BRASÃO / LOGO ──
    const logoSize = 16
    const logoX = (pageWidth - logoSize) / 2
    try {
      doc.addImage(icon, 'PNG', logoX, y, logoSize, logoSize)
    } catch {}

    y += logoSize + 4

    // República de Angola, etc
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(16)
    doc.text('República de Angola', pageWidth / 2, y, { align: 'center' })
    y += 6
    doc.text('Ministério da Educação', pageWidth / 2, y, { align: 'center' })
    y += 6
    
    // ENSINO GERAL bold, dynamic certificate number
    doc.setFont('Helvetica', 'bold')
    const w1 = doc.getTextWidth('ENSINO GERAL')
    doc.setFont('Helvetica', 'normal')
    const certNumStr = `  Nº ${data.NumeroCertificado || '007 /2025'}`
    const w2 = doc.getTextWidth(certNumStr)
    const totalW = w1 + w2
    const startX = (pageWidth - totalW) / 2
    
    doc.setFont('Helvetica', 'bold')
    doc.text('ENSINO GERAL', startX, y)
    doc.setFont('Helvetica', 'normal')
    doc.text(certNumStr, startX + w1, y)
    y += 14

    // Título Principal
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('CERTIFICADO DE HABILITAÇÕES', pageWidth / 2, y, { align: 'center' })
    y += 12

    // ── CORPO DO TEXTO ──
    const aluno = data.tb_alunos
    const nomeAluno = (aluno.nome || 'N/A')
    const pai = (aluno.pai || 'N/A')
    const mae = (aluno.mae || 'N/A')
    
    const dataNascExtenso = this.formatDateLong(aluno.dataNascimento) 
    const biNum = aluno.n_documento_identificacao || 'N/A'
    const biDataExtenso = aluno.dataEmissao ? this.formatDateLong(aluno.dataEmissao) : 'N/A'
    const naturalidade = aluno.naturalidade || aluno.tb_comunas?.designacao || 'Cabinda'
    const municipio = aluno.tb_comunas?.tb_municipios?.designacao || 'Cabinda'
    const provincia = aluno.tb_comunas?.tb_municipios?.tb_provincias?.designacao || 'Cabinda'
    
    const dataDoc = this.formatDateLong(data.DataEmissao)
    const anoConclusao = data.tb_ano_lectivo.designacao
    const nomeDirectora = 'Júlia Maria da Conceição Franque'

    const p1 = [
      { text: `${nomeDirectora}, `, bold: true, fontName: 'times' },
      { text: 'Directora do ', bold: false, fontName: 'Helvetica' },
      { text: 'Complexo Escolar Anexo ao Magistério de Cabinda', bold: true, fontName: 'Helvetica' },
      { text: ' Certifica ', bold: true, underline: false, fontName: 'Helvetica' },
      { text: 'que ', bold: false, fontName: 'Helvetica' },
      { text: `${nomeAluno}, `, bold: true, color: [255, 0, 0], fontName: 'Helvetica' },
      { text: `filho de ${pai} e de ${mae}, nascido aos ${dataNascExtenso}, em ${naturalidade}, Município de ${municipio}, Província de ${provincia}, Portador do `, bold: false, fontName: 'Helvetica' },
      { text: 'BI/CP ', bold: true, fontName: 'Helvetica' },
      { text: `Nº.${biNum} emitido, aos ${biDataExtenso}, pelo Arquivo de Identificação de Cabinda.`, bold: false, fontName: 'Helvetica' }
    ]

    const p2 = [
      { text: `Concluiu no ano lectivo de `, bold: false, fontName: 'Helvetica' },
      { text: `${anoConclusao}, o I Ciclo de Ensino Secundário Geral, `, bold: true, fontName: 'Helvetica' },
      { text: `conforme o disposto na alínea `, bold: false, fontName: 'Helvetica' },
      { text: `c) do artigo `, bold: true, fontName: 'Helvetica' },
      { text: `109 da IBSEE nº 17/16 de 7 de Outubro`, bold: true, fontName: 'Helvetica' },
      { text: `, com a Média Final de `, bold: false, fontName: 'Helvetica' },
      { text: `${data.mediaFinal} valores`, bold: true, underline: true, fontName: 'Helvetica' },
      { text: ` obtida nas seguintes classificações por ciclos de aprendizagem:`, bold: false, fontName: 'Helvetica' }
    ]

    doc.setFontSize(12)
    y = this.writeJustifiedMixed(doc, p1, marginL, y, maxWidth, 6.5)
    y += 2
    y = this.writeJustifiedMixed(doc, p2, marginL, y, maxWidth, 6.5)
    y += 8

    // Centered school name subtitle above table
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('COMPLEXO ESCOLAR PRIVADO JOMORAIS', pageWidth / 2, y, { align: 'center' })
    y += 8

    // ── TABELA DE NOTAS COMPARATIVA (7ª, 8ª, 9ª classes) ──
    const nonaSubjectsMap = [
      { key: 'Língua Portuguesa', display: 'L. PORTUGUESA' },
      { key: 'Matemática', display: 'MATEMÁTICA' },
      { key: 'Biologia', display: 'BIOLOGIA' },
      { key: 'Geografia', display: 'GEOGRAFIA' },
      { key: 'História', display: 'HISTÓRIA' },
      { key: 'Química', display: 'QUÍMICA' },
      { key: 'Física', display: 'FÍSICA' },
      { key: 'E.M.C', display: 'E.M.C' },
      { key: 'E.V.P', display: 'E.V.P' },
      { key: 'Língua Inglesa', display: 'INGLÊS' },
      { key: 'Língua Francesa', display: 'FRANCÊS' },
      { key: 'Educação Laboral', display: 'ED. LABORAL' },
      { key: 'Empreendedorismo', display: 'EMPREENDED.' },
      { key: 'Educação Física', display: 'ED. FÍSICA' }
    ]

    const getGrade = (subKey: string, cl: string): number | string => {
      const matched = data.gradeDetails?.find(d =>
        d.designacao.toLowerCase().includes(subKey.toLowerCase()) ||
        (subKey.toLowerCase() === 'língua inglesa' && d.designacao.toLowerCase().includes('inglês')) ||
        (subKey.toLowerCase() === 'língua francesa' && d.designacao.toLowerCase().includes('francês')) ||
        (subKey.toLowerCase() === 'e.m.c' && (d.designacao.toLowerCase().includes('moral') || d.designacao.toLowerCase().includes('cívica') || d.designacao.toLowerCase().includes('emc'))) ||
        (subKey.toLowerCase() === 'e.v.p' && (d.designacao.toLowerCase().includes('visual') || d.designacao.toLowerCase().includes('plástica') || d.designacao.toLowerCase().includes('evp'))) ||
        (subKey.toLowerCase() === 'educação laboral' && (d.designacao.toLowerCase().includes('laboral') || d.designacao.toLowerCase().includes('trabalho'))) ||
        (subKey.toLowerCase() === 'empreendedorismo' && (d.designacao.toLowerCase().includes('empreended') || d.designacao.toLowerCase().includes('empree')))
      )
      if (!matched || !matched.notas) return '-'
      const found = Object.entries(matched.notas).find(([k]) => k.includes(cl))
      return found ? found[1].nota : '-'
    }

    const confirmacao = data.tb_alunos.tb_matriculas?.tb_confirmacoes?.[0]
    const year9 = parseInt(anoConclusao) || 2019
    const year8 = year9 - 1
    const year7 = year9 - 2
    const currentTurma = confirmacao?.tb_turmas?.designacao || 'A'

    const tableRows = nonaSubjectsMap.map(subItem => {
      const g7 = getGrade(subItem.key, '7ª')
      const g8 = getGrade(subItem.key, '8ª')
      const g9 = getGrade(subItem.key, '9ª')

      let mediaDisc: number | string = '-'
      const grades = [g7, g8, g9].filter(g => typeof g === 'number') as number[]
      if (grades.length > 0) {
        mediaDisc = Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
      }

      return [
        subItem.display.toUpperCase(),
        g7 === '-' ? '-----------' : `${g7} (${this.numberToWords(g7)})`,
        g8 === '-' ? '-----------' : `${g8} (${this.numberToWords(g8)})`,
        g9 === '-' ? '-----------' : `${g9} (${this.numberToWords(g9)})`,
        mediaDisc === '-' ? '-' : mediaDisc,
        mediaDisc === '-' ? '-' : this.numberToWords(mediaDisc)
      ]
    })

    let finalTableY = y
    autoTable(doc, {
      startY: y,
      head: [[
        'DISCIPLINAS',
        `7ª CLASSE\nEscola: C.E.P JOMORAIS\nNº 08  Turma - Única\nAno letivo: ${year7}`,
        `8ª CLASSE\nEscola: C.E.P JOMORAIS\nNº 02  Turma - Única\nAno letivo: ${year8}`,
        `9ª CLASSE\nEscola: C.E.P JOMORAIS\nNº 02  Turma - ${currentTurma}\nAno letivo: ${year9}`,
        'Média Final',
        'Média por Extenso'
      ]],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1, halign: 'center', valign: 'middle' },
      columnStyles: { 0: { halign: 'left', cellWidth: 35 }, 5: { halign: 'left' } },
      headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7.5 },
      didDrawPage: (data: any) => {
        finalTableY = data.cursor.y
      }
    })

    y = finalTableY + 8

    // Livro de termos footer
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10.5)
    
    // Justified block for Terms footer
    const pTerms = [
      { text: 'Para efeitos legais, lhe é passado o presente ', bold: false, fontName: 'Helvetica' },
      { text: 'CERTIFICADO ', bold: true, fontName: 'Helvetica' },
      { text: 'que consta no livro de termos nº ', bold: false, fontName: 'Helvetica' },
      { text: '004 ', bold: true, fontName: 'Helvetica' },
      { text: 'folhas ', bold: false, fontName: 'Helvetica' },
      { text: '004 ', bold: true, fontName: 'Helvetica' },
      { text: 'assinado e autenticado com o carimbo/selo branco em uso neste estabelecimento de ensino.', bold: false, fontName: 'Helvetica' }
    ]
    y = this.writeJustifiedMixed(doc, pTerms, marginL, y, maxWidth, 5.5)
    y += 4

    // Data de emissão no final (centered)
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10.5)
    const placeText = 'Complexo Escolar Anexo Ao Magistério em Cabinda, aos '
    const dateText = `${dataDoc}.`
    const placeW = doc.getTextWidth(placeText)
    const dateW = doc.getTextWidth(dateText)
    const totalDateW = placeW + dateW
    const startDateX = (pageWidth - totalDateW) / 2
    doc.text(placeText, startDateX, y)
    doc.setFont('Helvetica', 'bold')
    doc.text(dateText, startDateX + placeW, y)
    y += 18

    // ── ASSINATURAS ──
    const sigW = maxWidth / 2
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10.5)
    doc.text('Conferido por', marginL + 15, y)
    doc.text('O(A) Director(a)', marginL + sigW + 20, y)
    y += 14

    doc.setLineWidth(0.3)
    doc.line(marginL, y, marginL + 50, y)
    doc.line(marginL + sigW + 10, y, marginL + sigW + 70, y)
    y += 4

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text(nomeDirectora, marginL + sigW + 40, y, { align: 'center' })

    // Verificação pública de autenticidade (Rodapé discreto)
    const host = window.location.origin
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 100, 100)
    doc.text(`Autenticidade verificável em: ${host}/verificar/${data.NumeroCertificado} (Certificado: ${data.NumeroCertificado})`, pageWidth / 2, pageHeight - 6, { align: 'center' })

    doc.save(`Certificado_9Classe_${nomeAluno.replace(/\s+/g, '_')}.pdf`)
  }

  /**
   * LAYOUT 2: CERTIFICADO DO ENSINO MÉDIO (TÉCNICO PROFISSIONAL)
   */
  private static generateMiddleClassPDF(data: ICertificatePdfData): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const marginL = 20
    const marginR = 15
    const maxWidth = pageWidth - marginL - marginR
    let y = 14

    // ── BORDA DUPLA ──
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.4)
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16)
    doc.setLineWidth(0.15)
    doc.rect(9.2, 9.2, pageWidth - 18.4, pageHeight - 18.4)

    // Brasão Centrado
    const logoSize = 12
    const logoX = (pageWidth - logoSize) / 2
    try {
      doc.addImage(icon, 'PNG', logoX, y, logoSize, logoSize)
    } catch {}

    // Cabeçalho Oficial Centrado
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('REPÚBLICA DE ANGOLA', pageWidth / 2, y + logoSize + 4, { align: 'center' })
    doc.text('MINISTÉRIO DA EDUCAÇÃO', pageWidth / 2, y + logoSize + 8, { align: 'center' })
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('INSTITUTO TÉCNICO DE SAÚDE DE CABINDA', pageWidth / 2, y + logoSize + 12, { align: 'center' })

    y += logoSize + 20

    // Título do Certificado
    doc.setFont('times', 'italic')
    doc.setFontSize(22)
    doc.text('Certificado de Habilitações', pageWidth / 2, y, { align: 'center' })
    y += 10
    
    // Subtítulo destacado em Vermelho
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(200, 0, 0)
    doc.text('(Instituto Técnico Privado de Saúde Jomorais)', pageWidth / 2, y, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    y += 12

    // ── DADOS DO ESTUDANTE ──
    const aluno = data.tb_alunos
    const nomeAluno = (aluno.nome || 'N/A').toUpperCase()
    const pai = (aluno.pai || 'N/A').toUpperCase()
    const mae = (aluno.mae || 'N/A').toUpperCase()
    const dataNasc = this.formatDateShort(aluno.dataNascimento)
    const biNum = aluno.n_documento_identificacao || 'N/A'
    const curso = (aluno.tb_matriculas?.tb_cursos?.designacao || 'N/A')
    const anoConclusao = data.tb_ano_lectivo.designacao
    const confirmacao = aluno.tb_matriculas?.tb_confirmacoes?.[0]
    const turma = confirmacao?.tb_turmas?.designacao || 'A'

    const nomeDirectora = 'Madalena de Fátima Muila Ngimbi'

    let cursoNome = curso
    if (!cursoNome.toLowerCase().startsWith('técnico de')) {
      cursoNome = `Técnico de ${curso}`
    }
    // Capitalize first letter of each word
    cursoNome = cursoNome.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))
    
    let areaFormacao = ''
    if (curso.toLowerCase().includes('análises clínicas') || curso.toLowerCase().includes('enfermagem') || curso.toLowerCase().includes('saúde')) {
      areaFormacao = `, da Área de Formação de Saúde`
    } else if (curso.toLowerCase().includes('informática') || curso.toLowerCase().includes('tecnologia')) {
      areaFormacao = `, da Área de Formação de Tecnologias`
    }

    const isFeminino = aluno.sexo?.toLowerCase() === 'f' || aluno.sexo?.toLowerCase() === 'feminino'
    const filhoFilha = isFeminino ? 'filha' : 'filho'
    const nascidoNascida = isFeminino ? 'nascida' : 'nascido'
    const portadorPortadora = isFeminino ? 'portadora' : 'portador'

    const pBody = [
      { text: `A Directora do Instituto, `, bold: false },
      { text: nomeDirectora, bold: true },
      { text: `, certifica de acordo com o art.º 25 e 27 dos estatutos de Subsistema do Ensino Técnico Profissional, aprovado pelo Decreto nº 90/04, de 3 de Dezembro de 2004, que `, bold: false },
      { text: nomeAluno, bold: true, color: [200, 0, 0] },
      { text: `, ${filhoFilha} de ${pai} e de ${mae}, natural de Cabinda, província de Cabinda, ${nascidoNascida} aos `, bold: false },
      { text: dataNasc, bold: true },
      { text: `, ${portadorPortadora} do bilhete de identidade n.º ${biNum}, passado pelo Arquivo de Identificação de Cabinda, concluiu, em regime diurno, no ano lectivo ${anoConclusao}, o curso `, bold: false },
      { text: cursoNome, bold: true },
      { text: areaFormacao, bold: false },
      { text: `, tendo obtido as seguintes classificações, conforme consta na pauta do ano ${anoConclusao}, Turma ${turma}, n.º `, bold: false },
      { text: `${aluno.codigo}:`, bold: true }
    ]

    doc.setFontSize(11.0)
    y = this.writeJustifiedMixed(doc, pBody, marginL, y, maxWidth, 5.8)
    y += 3

    // Helper to pad strings with dots to fill 142mm
    const padWithDots = (name: string, isBold: boolean = false): string => {
      doc.setFont('Helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(9.0);
      const targetWidth = 142; // mm
      const currentWidth = doc.getTextWidth(name);
      if (currentWidth < targetWidth) {
        const dotWidth = doc.getTextWidth('.');
        const numDots = Math.floor((targetWidth - currentWidth) / dotWidth);
        return name + ' ' + '.'.repeat(Math.max(0, numDots));
      }
      return name;
    }

    // ── MAPEAR DISCIPLINAS POR COMPONENTE ──
    const sociocultural = [
      'Língua Portuguesa',
      'Língua Inglesa',
      'Formação de Atitudes Integradoras',
      'Educação Física'
    ]

    const cientifica = [
      'Matemática',
      'Biologia',
      'Física',
      'Química',
      'Bioquímica',
      'Informática'
    ]

    // Pegar notas do aluno
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

    const listSociocultural = sociocultural.map(sub => ({
      name: sub,
      grade: getGradeForMid(sub)
    }))

    const listCientifica = cientifica.map(sub => ({
      name: sub,
      grade: getGradeForMid(sub)
    }))

    // As restantes são técnicas
    const listTecnica: Array<{ name: string; grade: number }> = []
    data.gradeDetails?.forEach(d => {
      const nameLower = d.designacao.toLowerCase()
      const isSociocult = sociocultural.some(s => nameLower.includes(s.toLowerCase()))
      const isCient = cientifica.some(c => nameLower.includes(c.toLowerCase()))
      
      // Estágio Curricular, PAP, Projeto/Projecto, Exame Prático são tratados à parte
      const isSpecial = nameLower.includes('estágio') || 
                        nameLower.includes('prova de aptidão') || 
                        nameLower.includes('projeto') || 
                        nameLower.includes('projecto') || 
                        nameLower.includes('pap') ||
                        nameLower.includes('gestão de saúde') ||
                        nameLower.includes('exame prático') ||
                        nameLower.includes('exame pratico') ||
                        nameLower.includes('prova prática')
      
      if (!isSociocult && !isCient && !isSpecial) {
        const grade = Object.values(d.notas)[0]
        listTecnica.push({
          name: d.designacao,
          grade: grade ? Math.round(grade.nota) : 0
        })
      }
    })

    // Caso a lista técnica esteja vazia, colocar disciplinas técnicas padrão
    if (listTecnica.length === 0) {
      const isSaude = curso.toLowerCase().includes('análises clínicas') || 
                      curso.toLowerCase().includes('enfermagem') || 
                      curso.toLowerCase().includes('saúde');
      const defaultTec = isSaude ? [
        'Psicologia',
        'Ética e Deontologia Profissional',
        'Introdução ao Laboratório de Análises Clínicas',
        'Anatomia e Fisiologia Humana',
        'Microbiologia',
        'Hematologia',
        'Imunologia',
        'Bioquímica Clínica',
        'Patologia Geral',
        'Imunohematologia',
        'Microbiologia de Águas e Alimentos',
        'Tecnologia Laboratorial',
        'Parasitologia',
        'Urinologia',
        'Epidemiologia',
        'Práticas de Análises Clínicas'
      ] : [
        'Sistemas de Exploração',
        'Arquitetura de Computadores',
        'Redes de Computadores',
        'Programação e Sistemas de Informação',
        'Tecnologias de Informação e Comunicação',
        'Sistemas Digitais',
        'Instalação e Manutenção de Computadores'
      ];
      defaultTec.forEach(t => {
        listTecnica.push({ name: t, grade: getGradeForMid(t) })
      })
    }

    // Estágio, PAP, Projeto, Gestão de Saúde e Exame Prático
    const projGrade = getGradeForMid('Projecto Tecnológico') || getGradeForMid('Projeto Tecnológico') || 14
    const gestaoSaudeGrade = getGradeForMid('Gestão de Saúde') || 15
    const estagioGrade = getGradeForMid('Estágio Curricular') || getGradeForMid('Estágio') || 14
    const papGrade = getGradeForMid('Prova de Aptidão Profissional') || getGradeForMid('PAP') || 15
    const examePraticoGrade = getGradeForMid('Exame Prático') || getGradeForMid('Exame Pratico') || getGradeForMid('Prova Prática') || 15

    // Tabela rows
    const tableData: any[] = []

    // Primeira linha: Componente Sociocultural e Nota alinhadas
    tableData.push([
      { content: 'Componente Sociocultural', styles: { fontStyle: 'bold' } },
      { content: 'Nota', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: '', styles: { fontStyle: 'bold' } }
    ])
    listSociocultural.forEach(item => {
      tableData.push([padWithDots('   ' + item.name), item.grade.toString().padStart(2, '0'), `(${this.numberToWords(item.grade)})`])
    })

    tableData.push([{ content: 'Componente Científica', colSpan: 3, styles: { fontStyle: 'bold' } }])
    listCientifica.forEach(item => {
      tableData.push([padWithDots('   ' + item.name), item.grade.toString().padStart(2, '0'), `(${this.numberToWords(item.grade)})`])
    })

    tableData.push([{ content: 'Componente Técnica, Tecnológica e Prática', colSpan: 3, styles: { fontStyle: 'bold' } }])
    listTecnica.forEach(item => {
      tableData.push([padWithDots('   ' + item.name), item.grade.toString().padStart(2, '0'), `(${this.numberToWords(item.grade)})`])
    })

    // Projeto Tecnológico, Gestão de Saúde, Estágio
    tableData.push([padWithDots('   ' + 'Projecto Tecnológico'), projGrade.toString().padStart(2, '0'), `(${this.numberToWords(projGrade)})`])
    
    const isSaude = curso.toLowerCase().includes('análises clínicas') || 
                    curso.toLowerCase().includes('enfermagem') || 
                    curso.toLowerCase().includes('saúde');
    const hasGestaoSaude = data.gradeDetails?.some(d => 
      d.designacao.toLowerCase().includes('gestão de saúde') || 
      d.designacao.toLowerCase().includes('gestao de saude')
    );
    if (isSaude || hasGestaoSaude) {
      tableData.push([padWithDots('   ' + 'Gestão de Saúde'), gestaoSaudeGrade.toString().padStart(2, '0'), `(${this.numberToWords(gestaoSaudeGrade)})`])
    }

    // Estágio Curricular (E C)
    tableData.push([
      { content: padWithDots('Estágio Curricular (E C)', true), styles: { fontStyle: 'bold' } },
      { content: estagioGrade.toString().padStart(2, '0'), styles: { fontStyle: 'bold', halign: 'center' } },
      { content: `(${this.numberToWords(estagioGrade)})`, styles: { fontStyle: 'bold' } }
    ])

    // Calcular PC (Média do Plano Curricular)
    const allAcademicGrades = [...listSociocultural, ...listCientifica, ...listTecnica].map(i => i.grade).filter(g => g > 0)
    const pcVal = Math.round(allAcademicGrades.reduce((a, b) => a + b, 0) / allAcademicGrades.length) || 14
    tableData.push([
      { content: padWithDots('Classificação Final do Plano Curricular (PC)', true), styles: { fontStyle: 'bold' } },
      { content: pcVal.toString().padStart(2, '0'), styles: { fontStyle: 'bold', halign: 'center' } },
      { content: `(${this.numberToWords(pcVal)})`, styles: { fontStyle: 'bold' } }
    ])

    // Exame Prático
    tableData.push([
      { content: padWithDots('Classificação do Exame Prático (EP)', true), styles: { fontStyle: 'bold' } },
      { content: examePraticoGrade.toString().padStart(2, '0'), styles: { fontStyle: 'bold', halign: 'center' } },
      { content: `(${this.numberToWords(examePraticoGrade)})`, styles: { fontStyle: 'bold' } }
    ])

    // PAP
    tableData.push([
      { content: padWithDots('Classificação Da Prova de Aptidão Profissional (PAP)', true), styles: { fontStyle: 'bold' } },
      { content: papGrade.toString().padStart(2, '0'), styles: { fontStyle: 'bold', halign: 'center' } },
      { content: `(${this.numberToWords(papGrade)})`, styles: { fontStyle: 'bold' } }
    ])

    // Classificação Final Curso (4*PC + EC + EP + PAP) / 7
    const finalCourseGrade = Math.round((4 * pcVal + estagioGrade + examePraticoGrade + papGrade) / 7)
    tableData.push([
      { content: padWithDots('Classificação Final do Curso = (4xPC+EC+EP+PAP) /7', true), styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } },
      { content: finalCourseGrade.toString().padStart(2, '0'), styles: { fontStyle: 'bold', halign: 'center', fillColor: [230, 230, 230] } },
      { content: `(${this.numberToWords(finalCourseGrade)})`, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }
    ])

    let finalTableY = y
    autoTable(doc, {
      startY: y,
      body: tableData,
      theme: 'plain',
      styles: { fontSize: 9.0, cellPadding: 0.5, fontStyle: 'normal' },
      columnStyles: { 0: { cellWidth: 145 }, 1: { halign: 'center', cellWidth: 10 }, 2: { cellWidth: 20 } },
      didDrawPage: (data: any) => {
        finalTableY = data.cursor.y
      }
    })

    y = finalTableY + 6

    // ── TEXTO DE VALIDAÇÃO ──
    const pEnd = [
      { text: 'Pelo que, para efeitos legais e de harmonia com a legislação em vigor, ', bold: false },
      { text: 'mandámos-lhe passar o presente certificado', bold: true },
      { text: ', que vai por nós assinado e autenticado pelo selo branco em uso neste Instituto.', bold: false }
    ]
    doc.setFontSize(10.5)
    y = this.writeJustifiedMixed(doc, pEnd, marginL, y, maxWidth, 5.2)
    y += 5

    const dataDoc = this.formatDateLong(data.DataEmissao)
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10.5)
    const placeText = 'Instituto Técnico de Saúde de Cabinda, em Cabinda, '
    const dateText = `${dataDoc}. -`
    const placeW = doc.getTextWidth(placeText)
    const dateW = doc.getTextWidth(dateText)
    const totalW = placeW + dateW
    const startX = (pageWidth - totalW) / 2
    
    doc.text(placeText, startX, y)
    doc.setFont('Helvetica', 'bold')
    doc.text(dateText, startX + placeW, y)
    y += 14

    // ── ASSINATURAS ──
    const sigW = maxWidth / 2
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Conferido por', marginL + 27.5, y, { align: 'center' })
    doc.text('A Directora do Instituto', marginL + sigW + 35, y, { align: 'center' })
    y += 11

    doc.setLineWidth(0.3)
    doc.line(marginL + 2.5, y, marginL + 52.5, y)
    doc.line(marginL + sigW + 5, y, marginL + sigW + 65, y)
    y += 5

    // Nome da Directora em Times Italic (estilo assinatura/script)
    doc.setFont('times', 'italic')
    doc.setFontSize(12)
    doc.text(nomeDirectora, marginL + sigW + 35, y, { align: 'center' })

    doc.save(`Certificado_Medio_${nomeAluno.replace(/\s+/g, '_')}.pdf`)
  }
}
