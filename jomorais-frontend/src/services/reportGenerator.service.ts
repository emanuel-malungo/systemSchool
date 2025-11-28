import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, HeadingLevel, AlignmentType, WidthType } from 'docx'
import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { StudentReportData, StudentStatistics, ReportFilters } from '../types/reports.types'
import type { FinancialTransaction, FinancialStatistics, FinancialReportFilters } from '../types/financial-reports.types'
import type { StudentAcademicData, AcademicStatistics, AcademicReportFilters } from '../types/academic-reports.types'

/**
 * Serviço para geração de relatórios em diferentes formatos
 * Utiliza docx para Word e jsPDF para PDF
 */
class ReportGeneratorService {
  
  // ===============================
  // GERAÇÃO DE RELATÓRIOS EM WORD
  // ===============================

  /**
   * Gera relatório geral de alunos em formato Word
   */
  async generateStudentsWordReport(
    students: StudentReportData[],
    statistics: StudentStatistics,
    filters: ReportFilters,
    filename = 'relatorio-alunos.docx'
  ): Promise<void> {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Cabeçalho do relatório
            new Paragraph({
              text: "RELATÓRIO DE ALUNOS",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            
            new Paragraph({
              text: `Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`,
              alignment: AlignmentType.CENTER,
            }),
            
            new Paragraph({ text: "" }), // Linha em branco
            
            // Seção de estatísticas
            new Paragraph({
              text: "ESTATÍSTICAS GERAIS",
              heading: HeadingLevel.HEADING_1,
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Total de Alunos: ", bold: true }),
                new TextRun({ text: statistics.totalAlunos.toString() }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Alunos Ativos: ", bold: true }),
                new TextRun({ text: statistics.alunosAtivos.toString() }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Alunos Transferidos: ", bold: true }),
                new TextRun({ text: statistics.alunosTransferidos.toString() }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Alunos Desistentes: ", bold: true }),
                new TextRun({ text: statistics.alunosDesistentes.toString() }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Alunos Masculinos: ", bold: true }),
                new TextRun({ text: statistics.alunosMasculinos.toString() }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Alunos Femininos: ", bold: true }),
                new TextRun({ text: statistics.alunosFemininos.toString() }),
              ],
            }),
            
            new Paragraph({ text: "" }), // Linha em branco
            
            // Seção de filtros aplicados
            this.createFiltersSection(filters),
            
            new Paragraph({ text: "" }), // Linha em branco
            
            // Tabela de alunos
            new Paragraph({
              text: "LISTA DE ALUNOS",
              heading: HeadingLevel.HEADING_1,
            }),
            
            this.createStudentsTable(students),
          ],
        }],
      })

      // Gerar e fazer download do arquivo
      const blob = await Packer.toBlob(doc)
      this.downloadFile(blob, filename)
      
    } catch (error) {
      console.error('Erro ao gerar relatório Word:', error)
      throw new Error('Falha na geração do relatório Word')
    }
  }

  /**
   * Gera relatório individual de aluno em formato Word
   */
  async generateIndividualWordReport(
    studentData: any,
    filename = 'relatorio-individual.docx'
  ): Promise<void> {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Cabeçalho
            new Paragraph({
              text: "RELATÓRIO INDIVIDUAL DO ALUNO",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            
            new Paragraph({
              text: `Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`,
              alignment: AlignmentType.CENTER,
            }),
            
            new Paragraph({ text: "" }),
            
            // Dados pessoais
            new Paragraph({
              text: "DADOS PESSOAIS",
              heading: HeadingLevel.HEADING_1,
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Nome: ", bold: true }),
                new TextRun({ text: studentData.dadosPessoais?.nome || 'N/A' }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Número de Matrícula: ", bold: true }),
                new TextRun({ text: studentData.dadosPessoais?.numeroMatricula || 'N/A' }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Email: ", bold: true }),
                new TextRun({ text: studentData.dadosPessoais?.email || 'N/A' }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Telefone: ", bold: true }),
                new TextRun({ text: studentData.dadosPessoais?.telefone || 'N/A' }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Sexo: ", bold: true }),
                new TextRun({ text: studentData.dadosPessoais?.sexo || 'N/A' }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Data de Nascimento: ", bold: true }),
                new TextRun({ 
                  text: studentData.dadosPessoais?.dataNascimento 
                    ? format(new Date(studentData.dadosPessoais.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })
                    : 'N/A'
                }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Status: ", bold: true }),
                new TextRun({ text: studentData.dadosPessoais?.status || 'N/A' }),
              ],
            }),
            
            new Paragraph({ text: "" }),
            
            // Dados do encarregado
            ...(studentData.encarregado ? [
              new Paragraph({
                text: "DADOS DO ENCARREGADO",
                heading: HeadingLevel.HEADING_1,
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ text: "Nome: ", bold: true }),
                  new TextRun({ text: studentData.encarregado.nome || 'N/A' }),
                ],
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ text: "Telefone: ", bold: true }),
                  new TextRun({ text: studentData.encarregado.telefone || 'N/A' }),
                ],
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ text: "Email: ", bold: true }),
                  new TextRun({ text: studentData.encarregado.email || 'N/A' }),
                ],
              }),
            ] : []),
          ],
        }],
      })

      const blob = await Packer.toBlob(doc)
      this.downloadFile(blob, filename)
      
    } catch (error) {
      console.error('Erro ao gerar relatório individual Word:', error)
      throw new Error('Falha na geração do relatório individual Word')
    }
  }

  // ===============================
  // GERAÇÃO DE RELATÓRIOS EM PDF
  // ===============================

  /**
   * Gera relatório geral de alunos em formato PDF
   */
  generateStudentsPDFReport(
    students: StudentReportData[],
    statistics: StudentStatistics,
    filters: ReportFilters,
    filename = 'relatorio-alunos.pdf'
  ): void {
    try {
      const doc = new jsPDF()
      let yPosition = 20

      // Configurar fonte
      doc.setFont('helvetica')
      
      // Título
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('RELATÓRIO DE ALUNOS', 105, yPosition, { align: 'center' })
      yPosition += 10
      
      // Data de geração
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        105,
        yPosition,
        { align: 'center' }
      )
      yPosition += 20
      
      // Estatísticas
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('ESTATÍSTICAS GERAIS', 20, yPosition)
      yPosition += 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Total de Alunos: ${statistics.totalAlunos}`, 20, yPosition)
      yPosition += 5
      doc.text(`Alunos Ativos: ${statistics.alunosAtivos}`, 20, yPosition)
      yPosition += 5
      doc.text(`Alunos Transferidos: ${statistics.alunosTransferidos}`, 20, yPosition)
      yPosition += 5
      doc.text(`Alunos Desistentes: ${statistics.alunosDesistentes}`, 20, yPosition)
      yPosition += 5
      doc.text(`Alunos Masculinos: ${statistics.alunosMasculinos}`, 20, yPosition)
      yPosition += 5
      doc.text(`Alunos Femininos: ${statistics.alunosFemininos}`, 20, yPosition)
      yPosition += 15
      
      // Filtros aplicados
      const activeFilters = this.getActiveFilters(filters)
      if (activeFilters.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('FILTROS APLICADOS', 20, yPosition)
        yPosition += 8
        
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        activeFilters.forEach(filter => {
          doc.text(`• ${filter}`, 25, yPosition)
          yPosition += 4
        })
        yPosition += 10
      }
      
      // Lista de alunos
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('LISTA DE ALUNOS', 20, yPosition)
      yPosition += 10
      
      // Cabeçalho da tabela
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('Nome', 20, yPosition)
      doc.text('Email', 80, yPosition)
      doc.text('Telefone', 130, yPosition)
      doc.text('Sexo', 170, yPosition)
      doc.text('Estado', 185, yPosition)
      yPosition += 5
      
      // Linha separadora
      doc.line(20, yPosition, 200, yPosition)
      yPosition += 5
      
      // Dados dos alunos
      doc.setFont('helvetica', 'normal')
      students.forEach((student) => {
        if (yPosition > 270) { // Nova página se necessário
          doc.addPage()
          yPosition = 20
        }
        
        doc.text(student.nome?.substring(0, 25) || 'N/A', 20, yPosition)
        doc.text(student.email?.substring(0, 20) || 'N/A', 80, yPosition)
        doc.text(student.telefone || 'N/A', 130, yPosition)
        doc.text(student.sexo || 'N/A', 170, yPosition)
        doc.text(student.estado || 'N/A', 185, yPosition)
        yPosition += 4
      })
      
      // Salvar PDF
      doc.save(filename)
      
    } catch (error) {
      console.error('Erro ao gerar relatório PDF:', error)
      throw new Error('Falha na geração do relatório PDF')
    }
  }

  /**
   * Gera relatório individual de aluno em formato PDF
   */
  generateIndividualPDFReport(
    studentData: any,
    filename = 'relatorio-individual.pdf'
  ): void {
    try {
      const doc = new jsPDF()
      let yPosition = 20

      // Título
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('RELATÓRIO INDIVIDUAL DO ALUNO', 105, yPosition, { align: 'center' })
      yPosition += 15
      
      // Data de geração
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        105,
        yPosition,
        { align: 'center' }
      )
      yPosition += 20
      
      // Dados pessoais
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('DADOS PESSOAIS', 20, yPosition)
      yPosition += 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      const personalData = [
        ['Nome:', studentData.dadosPessoais?.nome || 'N/A'],
        ['Número de Matrícula:', studentData.dadosPessoais?.numeroMatricula || 'N/A'],
        ['Email:', studentData.dadosPessoais?.email || 'N/A'],
        ['Telefone:', studentData.dadosPessoais?.telefone || 'N/A'],
        ['Sexo:', studentData.dadosPessoais?.sexo || 'N/A'],
        ['Data de Nascimento:', studentData.dadosPessoais?.dataNascimento 
          ? format(new Date(studentData.dadosPessoais.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })
          : 'N/A'],
        ['Status:', studentData.dadosPessoais?.status || 'N/A'],
      ]
      
      personalData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(label, 20, yPosition)
        doc.setFont('helvetica', 'normal')
        doc.text(value, 70, yPosition)
        yPosition += 6
      })
      
      // Dados do encarregado
      if (studentData.encarregado) {
        yPosition += 10
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('DADOS DO ENCARREGADO', 20, yPosition)
        yPosition += 10
        
        doc.setFontSize(10)
        const guardianData = [
          ['Nome:', studentData.encarregado.nome || 'N/A'],
          ['Telefone:', studentData.encarregado.telefone || 'N/A'],
          ['Email:', studentData.encarregado.email || 'N/A'],
        ]
        
        guardianData.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold')
          doc.text(label, 20, yPosition)
          doc.setFont('helvetica', 'normal')
          doc.text(value, 70, yPosition)
          yPosition += 6
        })
      }
      
      doc.save(filename)
      
    } catch (error) {
      console.error('Erro ao gerar relatório individual PDF:', error)
      throw new Error('Falha na geração do relatório individual PDF')
    }
  }

  // ===============================
  // MÉTODOS AUXILIARES
  // ===============================

  /**
   * Cria seção de filtros para o documento Word
   */
  private createFiltersSection(filters: ReportFilters): Paragraph {
    const activeFilters = this.getActiveFilters(filters)
    
    if (activeFilters.length === 0) {
      return new Paragraph({
        children: [
          new TextRun({ text: "FILTROS APLICADOS: ", bold: true }),
          new TextRun({ text: "Nenhum filtro aplicado" }),
        ],
      })
    }
    
    return new Paragraph({
      children: [
        new TextRun({ text: "FILTROS APLICADOS:", bold: true }),
        new TextRun({ text: `\n${activeFilters.join('\n')}` }),
      ],
    })
  }

  /**
   * Cria tabela de alunos para o documento Word
   */
  private createStudentsTable(students: StudentReportData[]): Table {
    const rows = [
      // Cabeçalho
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "Nome", alignment: AlignmentType.CENTER })],
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Email", alignment: AlignmentType.CENTER })],
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Telefone", alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Sexo", alignment: AlignmentType.CENTER })],
            width: { size: 10, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Estado", alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Classe", alignment: AlignmentType.CENTER })],
            width: { size: 10, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      // Dados
      ...students.map(student => new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: student.nome || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: student.email || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: student.telefone || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: student.sexo || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: student.estado || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: student.classe || 'N/A' })],
          }),
        ],
      })),
    ]

    return new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  }

  /**
   * Obtém lista de filtros ativos
   */
  private getActiveFilters(filters: ReportFilters): string[] {
    const activeFilters: string[] = []
    
    if (filters.anoAcademico) {
      activeFilters.push(`Ano Académico: ${filters.anoAcademico}`)
    }
    if (filters.classe) {
      activeFilters.push(`Classe: ${filters.classe}`)
    }
    if (filters.curso) {
      activeFilters.push(`Curso: ${filters.curso}`)
    }
    if (filters.estado) {
      activeFilters.push(`Estado: ${filters.estado}`)
    }
    if (filters.genero) {
      activeFilters.push(`Género: ${filters.genero}`)
    }
    if (filters.periodo) {
      activeFilters.push(`Período: ${filters.periodo}`)
    }
    if (filters.dataMatriculaFrom) {
      activeFilters.push(`Data de Matrícula (De): ${format(new Date(filters.dataMatriculaFrom), 'dd/MM/yyyy', { locale: ptBR })}`)
    }
    if (filters.dataMatriculaTo) {
      activeFilters.push(`Data de Matrícula (Até): ${format(new Date(filters.dataMatriculaTo), 'dd/MM/yyyy', { locale: ptBR })}`)
    }
    
    return activeFilters
  }

  /**
   * Faz download de arquivo
   */
  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // ===============================
  // GERAÇÃO DE RELATÓRIOS FINANCEIROS
  // ===============================

  /**
   * Gera relatório financeiro em formato Word
   */
  async generateFinancialWordReport(
    transactions: FinancialTransaction[],
    statistics: FinancialStatistics,
    filters: FinancialReportFilters,
    filename = 'relatorio-financeiro.docx'
  ): Promise<void> {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Cabeçalho do relatório
            new Paragraph({
              text: "RELATÓRIO FINANCEIRO",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            
            new Paragraph({
              text: `Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`,
              alignment: AlignmentType.CENTER,
            }),
            
            new Paragraph({ text: "" }), // Linha em branco
            
            // Seção de estatísticas
            new Paragraph({
              text: "ESTATÍSTICAS FINANCEIRAS",
              heading: HeadingLevel.HEADING_1,
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Total de Transações: ", bold: true }),
                new TextRun({ text: statistics.totalTransacoes.toString() }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Valor Total Arrecadado: ", bold: true }),
                new TextRun({ text: `${statistics.valorTotalArrecadado.toLocaleString('pt-AO')} Kz` }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Valor Total Pendente: ", bold: true }),
                new TextRun({ text: `${statistics.valorTotalPendente.toLocaleString('pt-AO')} Kz` }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Valor Total Atrasado: ", bold: true }),
                new TextRun({ text: `${statistics.valorTotalAtrasado.toLocaleString('pt-AO')} Kz` }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Percentual de Arrecadação: ", bold: true }),
                new TextRun({ text: `${statistics.percentualArrecadacao.toFixed(2)}%` }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Ticket Médio: ", bold: true }),
                new TextRun({ text: `${statistics.ticketMedio.toLocaleString('pt-AO')} Kz` }),
              ],
            }),
            
            new Paragraph({ text: "" }), // Linha em branco
            
            // Seção de filtros aplicados
            this.createFinancialFiltersSection(filters),
            
            new Paragraph({ text: "" }), // Linha em branco
            
            // Tabela de transações
            new Paragraph({
              text: "TRANSAÇÕES FINANCEIRAS",
              heading: HeadingLevel.HEADING_1,
            }),
            
            this.createFinancialTransactionsTable(transactions),
          ],
        }],
      })

      // Gerar e fazer download do arquivo
      const blob = await Packer.toBlob(doc)
      this.downloadFile(blob, filename)
      
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro Word:', error)
      throw new Error('Falha na geração do relatório financeiro Word')
    }
  }

  /**
   * Gera relatório financeiro em formato PDF
   */
  generateFinancialPDFReport(
    transactions: FinancialTransaction[],
    statistics: FinancialStatistics,
    filters: FinancialReportFilters,
    filename = 'relatorio-financeiro.pdf'
  ): void {
    try {
      const doc = new jsPDF()
      let yPosition = 20

      // Configurar fonte
      doc.setFont('helvetica')
      
      // Título
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('RELATÓRIO FINANCEIRO', 105, yPosition, { align: 'center' })
      yPosition += 10
      
      // Data de geração
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        105,
        yPosition,
        { align: 'center' }
      )
      yPosition += 20
      
      // Estatísticas
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('ESTATÍSTICAS FINANCEIRAS', 20, yPosition)
      yPosition += 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Total de Transações: ${statistics.totalTransacoes}`, 20, yPosition)
      yPosition += 5
      doc.text(`Valor Total Arrecadado: ${statistics.valorTotalArrecadado.toLocaleString('pt-AO')} Kz`, 20, yPosition)
      yPosition += 5
      doc.text(`Valor Total Pendente: ${statistics.valorTotalPendente.toLocaleString('pt-AO')} Kz`, 20, yPosition)
      yPosition += 5
      doc.text(`Valor Total Atrasado: ${statistics.valorTotalAtrasado.toLocaleString('pt-AO')} Kz`, 20, yPosition)
      yPosition += 5
      doc.text(`Percentual de Arrecadação: ${statistics.percentualArrecadacao.toFixed(2)}%`, 20, yPosition)
      yPosition += 5
      doc.text(`Ticket Médio: ${statistics.ticketMedio.toLocaleString('pt-AO')} Kz`, 20, yPosition)
      yPosition += 15
      
      // Filtros aplicados
      const activeFilters = this.getActiveFinancialFilters(filters)
      if (activeFilters.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('FILTROS APLICADOS', 20, yPosition)
        yPosition += 8
        
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        activeFilters.forEach(filter => {
          doc.text(`• ${filter}`, 25, yPosition)
          yPosition += 4
        })
        yPosition += 10
      }
      
      // Lista de transações
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('TRANSAÇÕES FINANCEIRAS', 20, yPosition)
      yPosition += 10
      
      // Cabeçalho da tabela
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('Aluno', 20, yPosition)
      doc.text('Tipo', 60, yPosition)
      doc.text('Valor', 90, yPosition)
      doc.text('Status', 120, yPosition)
      doc.text('Vencimento', 150, yPosition)
      yPosition += 5
      
      // Linha separadora
      doc.line(20, yPosition, 200, yPosition)
      yPosition += 5
      
      // Dados das transações
      doc.setFont('helvetica', 'normal')
      transactions.forEach((transaction) => {
        if (yPosition > 270) { // Nova página se necessário
          doc.addPage()
          yPosition = 20
        }
        
        doc.text(transaction.nomeAluno?.substring(0, 20) || 'N/A', 20, yPosition)
        doc.text(transaction.tipoTransacao?.substring(0, 15) || 'N/A', 60, yPosition)
        doc.text(`${transaction.valor.toLocaleString('pt-AO')} Kz`, 90, yPosition)
        doc.text(transaction.statusPagamento || 'N/A', 120, yPosition)
        doc.text(this.formatDateForPDF(transaction.dataVencimento), 150, yPosition)
        yPosition += 4
      })
      
      // Salvar PDF
      doc.save(filename)
      
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro PDF:', error)
      throw new Error('Falha na geração do relatório financeiro PDF')
    }
  }

  /**
   * Cria seção de filtros financeiros para o documento Word
   */
  private createFinancialFiltersSection(filters: FinancialReportFilters): Paragraph {
    const activeFilters = this.getActiveFinancialFilters(filters)
    
    if (activeFilters.length === 0) {
      return new Paragraph({
        children: [
          new TextRun({ text: "FILTROS APLICADOS: ", bold: true }),
          new TextRun({ text: "Nenhum filtro aplicado" }),
        ],
      })
    }
    
    return new Paragraph({
      children: [
        new TextRun({ text: "FILTROS APLICADOS:", bold: true }),
        new TextRun({ text: `\n${activeFilters.join('\n')}` }),
      ],
    })
  }

  /**
   * Cria tabela de transações financeiras para o documento Word
   */
  private createFinancialTransactionsTable(transactions: FinancialTransaction[]): Table {
    const rows = [
      // Cabeçalho
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "Aluno", alignment: AlignmentType.CENTER })],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Tipo", alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Valor", alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Status", alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Vencimento", alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Pagamento", alignment: AlignmentType.CENTER })],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      // Dados
      ...transactions.map(transaction => new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: transaction.nomeAluno || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: transaction.tipoTransacao || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: `${transaction.valor.toLocaleString('pt-AO')} Kz` })],
          }),
          new TableCell({
            children: [new Paragraph({ text: transaction.statusPagamento || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: this.formatDateForPDF(transaction.dataVencimento) })],
          }),
          new TableCell({
            children: [new Paragraph({ text: transaction.dataPagamento ? this.formatDateForPDF(transaction.dataPagamento) : 'N/A' })],
          }),
        ],
      })),
    ]

    return new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  }

  /**
   * Obtém lista de filtros financeiros ativos
   */
  private getActiveFinancialFilters(filters: FinancialReportFilters): string[] {
    const activeFilters: string[] = []
    
    if (filters.anoAcademico) {
      activeFilters.push(`Ano Académico: ${filters.anoAcademico}`)
    }
    if (filters.classe) {
      activeFilters.push(`Classe: ${filters.classe}`)
    }
    if (filters.curso) {
      activeFilters.push(`Curso: ${filters.curso}`)
    }
    if (filters.periodo) {
      activeFilters.push(`Período: ${filters.periodo}`)
    }
    if (filters.tipoTransacao && filters.tipoTransacao !== 'todos') {
      activeFilters.push(`Tipo de Transação: ${filters.tipoTransacao}`)
    }
    if (filters.statusPagamento && filters.statusPagamento !== 'todos') {
      activeFilters.push(`Status de Pagamento: ${filters.statusPagamento}`)
    }
    if (filters.dataInicio) {
      activeFilters.push(`Data Início: ${format(new Date(filters.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}`)
    }
    if (filters.dataFim) {
      activeFilters.push(`Data Fim: ${format(new Date(filters.dataFim), 'dd/MM/yyyy', { locale: ptBR })}`)
    }
    if (filters.valorMinimo && filters.valorMinimo > 0) {
      activeFilters.push(`Valor Mínimo: ${filters.valorMinimo.toLocaleString('pt-AO')} Kz`)
    }
    if (filters.valorMaximo && filters.valorMaximo > 0) {
      activeFilters.push(`Valor Máximo: ${filters.valorMaximo.toLocaleString('pt-AO')} Kz`)
    }
    
    return activeFilters
  }

  /**
   * Formata data para PDF
   */
  private formatDateForPDF(date: string): string {
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return 'N/A'
    }
  }

  // ===============================
  // GERAÇÃO DE RELATÓRIOS ACADÊMICOS
  // ===============================

  /**
   * Gera relatório acadêmico em formato Word
   */
  async generateAcademicWordReport(
    students: StudentAcademicData[],
    statistics: AcademicStatistics,
    filters: AcademicReportFilters,
    filename = 'relatorio-academico.docx'
  ): Promise<void> {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Cabeçalho do relatório
            new Paragraph({
              text: "RELATÓRIO ACADÊMICO",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            
            new Paragraph({
              text: `Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`,
              alignment: AlignmentType.CENTER,
            }),
            
            new Paragraph({ text: "" }), // Linha em branco
            
            // Seção de estatísticas
            new Paragraph({
              text: "ESTATÍSTICAS ACADÊMICAS",
              heading: HeadingLevel.HEADING_1,
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Total de Alunos: ", bold: true }),
                new TextRun({ text: statistics.totalAlunos.toString() }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Alunos Ativos: ", bold: true }),
                new TextRun({ text: `${statistics.alunosAtivos} (${statistics.distribuicaoStatus.percentualAtivos.toFixed(1)}%)` }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Alunos Transferidos: ", bold: true }),
                new TextRun({ text: `${statistics.alunosTransferidos} (${statistics.distribuicaoStatus.percentualTransferidos.toFixed(1)}%)` }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Alunos Desistentes: ", bold: true }),
                new TextRun({ text: `${statistics.alunosDesistentes} (${statistics.distribuicaoStatus.percentualDesistentes.toFixed(1)}%)` }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Alunos Finalizados: ", bold: true }),
                new TextRun({ text: `${statistics.alunosFinalizados} (${statistics.distribuicaoStatus.percentualFinalizados.toFixed(1)}%)` }),
              ],
            }),
            
            new Paragraph({ text: "" }), // Linha em branco
            
            // Seção de filtros aplicados
            this.createAcademicFiltersSection(filters),
            
            new Paragraph({ text: "" }), // Linha em branco
            
            // Tabela de alunos
            new Paragraph({
              text: "DESEMPENHO DOS ALUNOS",
              heading: HeadingLevel.HEADING_1,
            }),
            
            this.createAcademicStudentsTable(students),
          ],
        }],
      })

      // Gerar e fazer download do arquivo
      const blob = await Packer.toBlob(doc)
      this.downloadFile(blob, filename)
      
    } catch (error) {
      console.error('Erro ao gerar relatório acadêmico Word:', error)
      throw new Error('Falha na geração do relatório acadêmico Word')
    }
  }

  /**
   * Gera relatório acadêmico em formato PDF
   */
  generateAcademicPDFReport(
    students: StudentAcademicData[],
    statistics: AcademicStatistics,
    filters: AcademicReportFilters,
    filename = 'relatorio-academico.pdf'
  ): void {
    try {
      const doc = new jsPDF()
      let yPosition = 20

      // Configurar fonte
      doc.setFont('helvetica')
      
      // Título
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('RELATÓRIO ACADÊMICO', 105, yPosition, { align: 'center' })
      yPosition += 10
      
      // Data de geração
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        105,
        yPosition,
        { align: 'center' }
      )
      yPosition += 20
      
      // Estatísticas
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('ESTATÍSTICAS ACADÊMICAS', 20, yPosition)
      yPosition += 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Total de Alunos: ${statistics.totalAlunos}`, 20, yPosition)
      yPosition += 5
      doc.text(`Alunos Ativos: ${statistics.alunosAtivos} (${statistics.distribuicaoStatus.percentualAtivos.toFixed(1)}%)`, 20, yPosition)
      yPosition += 5
      doc.text(`Alunos Transferidos: ${statistics.alunosTransferidos} (${statistics.distribuicaoStatus.percentualTransferidos.toFixed(1)}%)`, 20, yPosition)
      yPosition += 5
      doc.text(`Alunos Desistentes: ${statistics.alunosDesistentes} (${statistics.distribuicaoStatus.percentualDesistentes.toFixed(1)}%)`, 20, yPosition)
      yPosition += 5
      doc.text(`Alunos Finalizados: ${statistics.alunosFinalizados} (${statistics.distribuicaoStatus.percentualFinalizados.toFixed(1)}%)`, 20, yPosition)
      yPosition += 5
      yPosition += 15
      
      // Filtros aplicados
      const activeFilters = this.getActiveAcademicFilters(filters)
      if (activeFilters.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('FILTROS APLICADOS', 20, yPosition)
        yPosition += 8
        
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        activeFilters.forEach(filter => {
          doc.text(`• ${filter}`, 25, yPosition)
          yPosition += 4
        })
        yPosition += 10
      }
      
      // Lista de alunos
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('DESEMPENHO DOS ALUNOS', 20, yPosition)
      yPosition += 10
      
      // Cabeçalho da tabela
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('Aluno', 20, yPosition)
      doc.text('Turma', 60, yPosition)
      doc.text('Média', 90, yPosition)
      doc.text('Frequência', 110, yPosition)
      doc.text('Situação', 140, yPosition)
      yPosition += 5
      
      // Linha separadora
      doc.line(20, yPosition, 200, yPosition)
      yPosition += 5
      
      // Dados dos alunos
      doc.setFont('helvetica', 'normal')
      students.forEach((student) => {
        if (yPosition > 270) { // Nova página se necessário
          doc.addPage()
          yPosition = 20
        }
        
        doc.text(student.nomeAluno?.substring(0, 20) || 'N/A', 20, yPosition)
        doc.text(student.turma || 'N/A', 60, yPosition)
        doc.text(student.aproveitamento?.mediaGeral?.toFixed(1) || 'N/A', 90, yPosition)
        doc.text(`${student.frequencia?.percentualFrequencia?.toFixed(1) || 0}%`, 110, yPosition)
        doc.text(student.aproveitamento?.situacaoGeral || 'N/A', 140, yPosition)
        yPosition += 4
      })
      
      // Salvar PDF
      doc.save(filename)
      
    } catch (error) {
      console.error('Erro ao gerar relatório acadêmico PDF:', error)
      throw new Error('Falha na geração do relatório acadêmico PDF')
    }
  }

  /**
   * Cria seção de filtros acadêmicos para o documento Word
   */
  private createAcademicFiltersSection(filters: AcademicReportFilters): Paragraph {
    const activeFilters = this.getActiveAcademicFilters(filters)
    
    if (activeFilters.length === 0) {
      return new Paragraph({
        children: [
          new TextRun({ text: "FILTROS APLICADOS: ", bold: true }),
          new TextRun({ text: "Nenhum filtro aplicado" }),
        ],
      })
    }
    
    return new Paragraph({
      children: [
        new TextRun({ text: "FILTROS APLICADOS:", bold: true }),
        new TextRun({ text: `\n${activeFilters.join('\n')}` }),
      ],
    })
  }

  /**
   * Cria tabela de alunos acadêmicos para o documento Word
   */
  private createAcademicStudentsTable(students: StudentAcademicData[]): Table {
    const rows = [
      // Cabeçalho
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "Aluno", alignment: AlignmentType.CENTER })],
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Matrícula", alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Turma", alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Média", alignment: AlignmentType.CENTER })],
            width: { size: 10, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Frequência", alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "Situação", alignment: AlignmentType.CENTER })],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      // Dados
      ...students.map(student => new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: student.nomeAluno || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: student.numeroMatricula || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: student.turma || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: student.aproveitamento?.mediaGeral?.toFixed(1) || 'N/A' })],
          }),
          new TableCell({
            children: [new Paragraph({ text: `${student.frequencia?.percentualFrequencia?.toFixed(1) || 0}%` })],
          }),
          new TableCell({
            children: [new Paragraph({ text: student.aproveitamento?.situacaoGeral || 'N/A' })],
          }),
        ],
      })),
    ]

    return new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  }

  /**
   * Obtém lista de filtros acadêmicos ativos
   */
  private getActiveAcademicFilters(filters: AcademicReportFilters): string[] {
    const activeFilters: string[] = []
    
    if (filters.anoAcademico) {
      activeFilters.push(`Ano Académico: ${filters.anoAcademico}`)
    }
    if (filters.classe) {
      activeFilters.push(`Classe: ${filters.classe}`)
    }
    if (filters.curso) {
      activeFilters.push(`Curso: ${filters.curso}`)
    }
    if (filters.turma) {
      activeFilters.push(`Turma: ${filters.turma}`)
    }
    if (filters.disciplina) {
      activeFilters.push(`Disciplina: ${filters.disciplina}`)
    }
    if (filters.professor) {
      activeFilters.push(`Professor: ${filters.professor}`)
    }
    if (filters.periodo) {
      activeFilters.push(`Período: ${filters.periodo}`)
    }
    if (filters.trimestre && filters.trimestre !== 'todos') {
      activeFilters.push(`Trimestre: ${filters.trimestre}º`)
    }
    if (filters.statusAluno && filters.statusAluno !== 'todos') {
      activeFilters.push(`Status do Aluno: ${filters.statusAluno}`)
    }
    if (filters.tipoRelatorio && filters.tipoRelatorio !== 'todos') {
      activeFilters.push(`Tipo de Relatório: ${filters.tipoRelatorio}`)
    }
    if (filters.dataInicio) {
      activeFilters.push(`Data Início: ${format(new Date(filters.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}`)
    }
    if (filters.dataFim) {
      activeFilters.push(`Data Fim: ${format(new Date(filters.dataFim), 'dd/MM/yyyy', { locale: ptBR })}`)
    }
    
    return activeFilters
  }
}

export default new ReportGeneratorService()
