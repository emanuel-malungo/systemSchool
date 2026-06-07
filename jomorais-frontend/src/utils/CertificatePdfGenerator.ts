import jsPDF from 'jspdf'
import 'jspdf-autotable'
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
    segments: Array<{ text: string; bold: boolean; underline?: boolean }>,
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
    }
    const words: Word[] = []
    for (const seg of segments) {
      const parts = seg.text.split(/(\s+)/)
      for (const part of parts) {
        if (part.trim().length > 0) {
          words.push({ word: part.trim(), bold: seg.bold, underline: seg.underline ?? false })
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

        if (w.underline) {
          const ww = getWordWidth(w)
          doc.setLineWidth(0.25)
          doc.line(curX, y + 0.6, curX + ww, y + 0.6)
        }

        curX += getWordWidth(w) + (wi < line.length - 1 ? spacePerGap : 0)
      }

      y += lineHeight
    }

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
    const logoX = marginL
    try {
      doc.addImage(icon, 'PNG', logoX, y, logoSize, logoSize)
    } catch {}

    // Cabeçalho Texto ao lado do Brasão
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10.5)
    doc.text('República de Angola', logoX + logoSize + 6, y + 4)
    doc.text('Ministério da Educação', logoX + logoSize + 6, y + 9)
    doc.setFont('Helvetica', 'bold')
    doc.text('ENSINO GERAL', logoX + logoSize + 6, y + 14)
    y += logoSize + 4

    // Linha Divisória
    doc.setLineWidth(0.6)
    doc.line(marginL, y, pageWidth - marginR, y)
    y += 10

    // Título Principal
    doc.setFontSize(14)
    doc.text('CERTIFICADO DE HABILITAÇÕES', pageWidth / 2, y, { align: 'center' })
    // Linha de sublinhado do título
    doc.setLineWidth(0.3)
    const titleW = doc.getTextWidth('CERTIFICADO DE HABILITAÇÕES')
    doc.line((pageWidth - titleW) / 2, y + 1, (pageWidth + titleW) / 2, y + 1)
    y += 12

    // ── CORPO DO TEXTO ──
    const aluno = data.tb_alunos
    const nomeAluno = (aluno.nome || 'N/A').toUpperCase()
    const pai = (aluno.pai || 'N/A').toUpperCase()
    const mae = (aluno.mae || 'N/A').toUpperCase()
    const dataNasc = this.formatDateLong(aluno.dataNascimento)
    const biNum = aluno.n_documento_identificacao || 'N/A'
    const biData = aluno.dataEmissao ? this.formatDateLong(aluno.dataEmissao) : 'N/A'
    const naturalidade = aluno.naturalidade || aluno.tb_comunas?.designacao || 'Cabinda'
    const municipio = aluno.tb_comunas?.tb_municipios?.designacao || 'Cabinda'
    const provincia = aluno.tb_comunas?.tb_municipios?.tb_provincias?.designacao || 'Cabinda'
    const dataDoc = this.formatDateLong(data.DataEmissao)
    
    // Ano letivo do certificado
    const anoConclusao = data.tb_ano_lectivo.designacao

    // Directora Geral
    const nomeDirectora = 'Júlia Maria da Conceição Franque'

    const p1 = [
      { text: `${nomeDirectora}, Directora do `, bold: false },
      { text: 'Complexo Escolar Anexo ao Magistério de Cabinda', bold: true },
      { text: ' Certifica que ', bold: false },
      { text: nomeAluno, bold: true },
      { text: ', filho de ', bold: false },
      { text: pai, bold: true },
      { text: ' e de ', bold: false },
      { text: mae, bold: true },
      { text: `, nascido aos ${dataNasc}, em ${naturalidade}, Município de `, bold: false },
      { text: municipio, bold: true },
      { text: `, Província de ${provincia}, Portador do BI/CP Nº. `, bold: false },
      { text: biNum, bold: true },
      { text: ` emitido, aos ${biData}, pelo Arquivo de Identificação de Cabinda.`, bold: false }
    ]

    const p2 = [
      { text: `Concluiu no ano lectivo de `, bold: false },
      { text: anoConclusao, bold: true },
      { text: ', o ', bold: false },
      { text: 'I Ciclo de Ensino Secundário Geral', bold: true },
      { text: ', conforme o disposto na alínea ', bold: false },
      { text: 'c) do artigo 109 da LBSEE nº 17/16 de 7 de Outubro', bold: true },
      { text: `, com a Média Final de `, bold: false },
      { text: `${data.mediaFinal} valores`, bold: true },
      { text: ' obtida nas seguintes classificações por ciclos de aprendizagem:', bold: false }
    ]

    doc.setFontSize(10.5)
    y = this.writeJustifiedMixed(doc, p1, marginL, y, maxWidth, 6)
    y += 4
    y = this.writeJustifiedMixed(doc, p2, marginL, y, maxWidth, 6)
    y += 6

    // Subtítulo da Escola
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('COMPLEXO ESCOLAR PRIVADO JOMORAIS', pageWidth / 2, y, { align: 'center' })
    y += 4

    // ── TABELA DE NOTAS COMPARATIVA (7ª, 8ª, 9ª classes) ──
    const nonaSubjects = [
      'Língua Portuguesa',
      'Matemática',
      'Biologia',
      'Geografia',
      'História',
      'Química',
      'Física',
      'Moral e Cívica',
      'Educação Visual e Plástica',
      'Língua Inglesa',
      'Língua Francesa',
      'Educação Laboral',
      'Empreendedorismo',
      'Educação Física'
    ]

    const getGradeHelper = (sub: string, cl: string): number | string => {
      const matched = data.gradeDetails?.find(d => 
        d.designacao.toLowerCase().includes(sub.toLowerCase())
      )
      if (!matched || !matched.notas) return '-'
      
      const found = Object.entries(matched.notas).find(([k]) => k.includes(cl))
      return found ? found[1].nota : '-'
    }

    const tableRows = nonaSubjects.map(sub => {
      const g7 = getGradeHelper(sub, '7ª')
      const g8 = getGradeHelper(sub, '8ª')
      const g9 = getGradeHelper(sub, '9ª')

      // Média final do aluno nesta disciplina
      let mediaDisc: number | string = '-'
      const grades = [g7, g8, g9].filter(g => typeof g === 'number') as number[]
      if (grades.length > 0) {
        mediaDisc = Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
      }

      return [
        sub.toUpperCase(),
        g7 === '-' ? '-' : `${g7} (valores)`,
        g8 === '-' ? '-' : `${g8} (valores)`,
        g9 === '-' ? '-' : `${g9} (valores)`,
        mediaDisc === '-' ? '-' : mediaDisc,
        mediaDisc === '-' ? '-' : this.numberToWords(mediaDisc)
      ]
    })

    // Desenhar tabela com jspdf-autotable
    let finalTableY = y
    ;(doc as any).autoTable({
      startY: y,
      head: [['DISCIPLINAS', '7ª CLASSE', '8ª CLASSE', '9ª CLASSE', 'Média Final', 'Média por Extenso']],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1, halign: 'center' },
      columnStyles: { 0: { halign: 'left', cellWidth: 40 }, 5: { halign: 'left' } },
      headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7.5 },
      didDrawPage: (data: any) => {
        finalTableY = data.cursor.y
      }
    })

    y = finalTableY + 8

    // ── TEXTO DE LIVRO DE TERMOS / REGISTO ──
    const pTerms = [
      { text: 'Para efeitos legais, lhe é passado o presente ', bold: false },
      { text: 'CERTIFICADO', bold: true },
      { text: ' que consta no livro de termos nº ', bold: false },
      { text: '004', bold: true },
      { text: ' folhas ', bold: false },
      { text: '004', bold: true },
      { text: ' assinado e autenticado com o carimbo/selo branco em uso neste estabelecimento de ensino.', bold: false }
    ]
    y = this.writeJustifiedMixed(doc, pTerms, marginL, y, maxWidth, 6)
    y += 8

    // Data de emissão no final
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10.5)
    doc.text(`Complexo Escolar Anexo Ao Magistério em Cabinda, aos ${dataDoc}.`, marginL, y)
    y += 18

    // ── ASSINATURAS ──
    const sigW = maxWidth / 2
    doc.text('Conferido por', marginL + 10, y)
    doc.text('O(A) Director(a)', marginL + sigW + 20, y)
    y += 14

    doc.setLineWidth(0.3)
    doc.line(marginL, y, marginL + 50, y)
    doc.line(marginL + sigW + 10, y, marginL + sigW + 70, y)
    y += 4

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(nomeDirectora, marginL + sigW + 40, y, { align: 'center' })
    y += 8

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

    // Brasão
    const logoSize = 14
    const logoX = marginL
    try {
      doc.addImage(icon, 'PNG', logoX, y, logoSize, logoSize)
    } catch {}

    // Cabeçalho Oficial
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.text('REPÚBLICA DE ANGOLA', logoX + logoSize + 5, y + 3)
    doc.text('MINISTÉRIO DA EDUCAÇÃO', logoX + logoSize + 5, y + 7)
    doc.setFont('Helvetica', 'bold')
    doc.text('INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS', logoX + logoSize + 5, y + 11)
    y += logoSize + 2

    // Título do Certificado
    doc.setFontSize(13.5)
    doc.text('Certificado de Habilitações', pageWidth / 2, y + 4, { align: 'center' })
    y += 10
    
    // Subtítulo destacado em Vermelho
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(200, 0, 0)
    doc.text('(Instituto Técnico Privado de Saúde Jomorais)', pageWidth / 2, y, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    y += 10

    // ── DADOS DO ESTUDANTE ──
    const aluno = data.tb_alunos
    const nomeAluno = (aluno.nome || 'N/A').toUpperCase()
    const pai = (aluno.pai || 'N/A').toUpperCase()
    const mae = (aluno.mae || 'N/A').toUpperCase()
    const dataNasc = this.formatDateLong(aluno.dataNascimento)
    const biNum = aluno.n_documento_identificacao || 'N/A'
    const curso = (aluno.tb_matriculas?.tb_cursos?.designacao || 'N/A').toUpperCase()
    const anoConclusao = data.tb_ano_lectivo.designacao
    const confirmacao = aluno.tb_matriculas?.tb_confirmacoes?.[0]
    const turma = confirmacao?.tb_turmas?.designacao || 'A'

    const nomeDirectora = 'Madalena de Fátima Muila Ngimbi'

    const pBody = [
      { text: `A Directora do Instituto, `, bold: false },
      { text: nomeDirectora, bold: true },
      { text: `, certifica de acordo com o art.º 25 e 27 dos estatutos de Subsistema do Ensino Técnico Profissional, aprovado pelo Decreto nº 90/04, de 3 de Dezembro de 2004, que `, bold: false },
      { text: nomeAluno, bold: true },
      { text: `, filha de ${pai} e de ${mae}, natural de Cabinda, província de Cabinda, nascida aos ${dataNasc}, portadora do bilhete de identidade n.º `, bold: false },
      { text: biNum, bold: true },
      { text: `, passado pelo Arquivo de Identificação de Cabinda, concluiu, em regime diurno, no ano lectivo `, bold: false },
      { text: anoConclusao, bold: true },
      { text: `, o curso `, bold: false },
      { text: `TÉCNICO DE ${curso}`, bold: true },
      { text: `, tendo obtido as seguintes classificações, conforme consta na pauta do ano ${anoConclusao}, Turma ${turma}, N.º ${aluno.codigo}:`, bold: false }
    ]

    doc.setFontSize(9.5)
    y = this.writeJustifiedMixed(doc, pBody, marginL, y, maxWidth, 5.2)
    y += 4

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
        d.designacao.toLowerCase().replace(/\s+/g, '') === sub.toLowerCase().replace(/\s+/g, '')
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
      const isSociocult = sociocultural.some(s => d.designacao.toLowerCase().includes(s.toLowerCase()))
      const isCient = cientifica.some(c => d.designacao.toLowerCase().includes(c.toLowerCase()))
      
      // Estágio Curricular, PAP e Projeto são tratados à parte
      const nameLower = d.designacao.toLowerCase()
      const isSpecial = nameLower.includes('estágio') || nameLower.includes('prova de aptidão') || nameLower.includes('projeto') || nameLower.includes('pap')
      
      if (!isSociocult && !isCient && !isSpecial) {
        const grade = Object.values(d.notas)[0]
        listTecnica.push({
          name: d.designacao,
          grade: grade ? Math.round(grade.nota) : 0
        })
      }
    })

    // Caso a lista técnica esteja vazia, colocar disciplinas técnicas padrão de saúde
    if (listTecnica.length === 0) {
      const defaultTec = [
        'Anatomia e Fisiologia Humana',
        'Introdução ao Laboratório de Análises Clínicas',
        'Microbiologia',
        'Hematologia',
        'Imunologia',
        'Bioquímica Clínica',
        'Patologia Geral',
        'Parasitologia',
        'Urinologia',
        'Epidemologia',
        'Práticas de Análises Clínicas'
      ]
      defaultTec.forEach(t => {
        listTecnica.push({ name: t, grade: getGradeForMid(t) })
      })
    }

    // Estágio, PAP e médias
    const estagioGrade = getGradeForMid('Estágio Curricular') || getGradeForMid('Estágio') || 14
    const papGrade = getGradeForMid('Prova de Aptidão Profissional') || getGradeForMid('PAP') || getGradeForMid('Projeto Tecnológico') || 15

    // Tabela rows
    const tableData: any[] = []

    tableData.push([{ content: 'Componente Sociocultural', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }])
    listSociocultural.forEach(item => {
      tableData.push([item.name, item.grade.toString().padStart(2, '0'), `(${this.numberToWords(item.grade)})`])
    })

    tableData.push([{ content: 'Componente Científica', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }])
    listCientifica.forEach(item => {
      tableData.push([item.name, item.grade.toString().padStart(2, '0'), `(${this.numberToWords(item.grade)})`])
    })

    tableData.push([{ content: 'Componente Técnica, Tecnológica e Prática', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }])
    listTecnica.forEach(item => {
      tableData.push([item.name, item.grade.toString().padStart(2, '0'), `(${this.numberToWords(item.grade)})`])
    })

    // Projeto Tecnológico se houver
    const projGrade = getGradeForMid('Projeto Tecnológico') || 14
    tableData.push(['Projeto Tecnológico', projGrade.toString().padStart(2, '0'), `(${this.numberToWords(projGrade)})`])
    
    // Estágio
    tableData.push(['Estágio Curricular (E C) ..............................................................', estagioGrade.toString().padStart(2, '0'), `(${this.numberToWords(estagioGrade)})`])

    // Calcular PC (Média do Plano Curricular)
    const allAcademicGrades = [...listSociocultural, ...listCientifica, ...listTecnica].map(i => i.grade).filter(g => g > 0)
    const pcVal = Math.round(allAcademicGrades.reduce((a, b) => a + b, 0) / allAcademicGrades.length) || 14
    tableData.push([{ content: 'Classificação Final do Plano Curricular (PC) ................................', fontStyle: 'bold' }, pcVal.toString().padStart(2, '0'), `(${this.numberToWords(pcVal)})`])

    // PAP
    tableData.push(['Classificação Da Prova de Aptidão Profissional (PAP) .....................', papGrade.toString().padStart(2, '0'), `(${this.numberToWords(papGrade)})`])

    // Classificação Final Curso (4*PC + EC + PAP) / 6
    const finalCourseGrade = Math.round((4 * pcVal + estagioGrade + papGrade) / 6)
    tableData.push([{ content: 'Classificação Final do Curso - (4xPC+EC+PAP) / 6 ............................', fontStyle: 'bold', fillColor: [230, 230, 230] }, { content: finalCourseGrade.toString().padStart(2, '0'), styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }, { content: `(${this.numberToWords(finalCourseGrade)})`, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }])

    let finalTableY = y
    ;(doc as any).autoTable({
      startY: y,
      head: [['Componentes / Disciplinas', 'Nota', 'Nota por extenso']],
      body: tableData,
      theme: 'plain',
      styles: { fontSize: 6.8, cellPadding: 0.7, fontStyle: 'normal' },
      columnStyles: { 0: { cellWidth: 120 }, 1: { halign: 'center', cellWidth: 15 }, 2: { cellWidth: 40 } },
      headStyles: { fontStyle: 'bold', fontSize: 7 },
      didDrawPage: (data: any) => {
        finalTableY = data.cursor.y
      }
    })

    y = finalTableY + 6

    // ── TEXTO DE VALIDAÇÃO ──
    const pEnd = [
      { text: 'Pelo que, para efeitos legais e de harmonia com a legislação em vigor, se passou o presente ', bold: false },
      { text: 'certificado', bold: true },
      { text: ', que vai por nós assinado e autenticado pelo selo branco em uso neste Instituto.', bold: false }
    ]
    y = this.writeJustifiedMixed(doc, pEnd, marginL, y, maxWidth, 4.5)
    y += 6

    const dataDoc = this.formatDateLong(data.DataEmissao)
    doc.setFontSize(9)
    doc.text(`Instituto Técnico de Saúde de Cabinda, em Cabinda, aos ${dataDoc}.`, marginL, y)
    y += 14

    // ── ASSINATURAS ──
    const sigW = maxWidth / 2
    doc.text('Conferido por', marginL + 10, y)
    doc.text('A Directora do Instituto', marginL + sigW + 20, y)
    y += 12

    doc.setLineWidth(0.3)
    doc.line(marginL, y, marginL + 50, y)
    doc.line(marginL + sigW + 10, y, marginL + sigW + 70, y)
    y += 4

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text(nomeDirectora, marginL + sigW + 40, y, { align: 'center' })

    // Verificação pública de autenticidade (Rodapé discreto)
    const host = window.location.origin
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 100, 100)
    doc.text(`Autenticidade verificável em: ${host}/verificar/${data.NumeroCertificado} (Certificado: ${data.NumeroCertificado})`, pageWidth / 2, pageHeight - 5, { align: 'center' })

    doc.save(`Certificado_Medio_${nomeAluno.replace(/\s+/g, '_')}.pdf`)
  }
}
