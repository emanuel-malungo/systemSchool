import jsPDF from 'jspdf'

/**
 * Interface para dados da fatura térmica
 */
export interface ThermalInvoiceData {
  pagamento: {
    codigo: number
    fatura: string
    data: string
    mes: string
    ano: number
    preco: number
    observacao?: string
    aluno: {
      codigo: number
      nome: string
      n_documento_identificacao?: string
      email?: string
      telefone?: string
    }
    tipoServico: {
      designacao: string
    }
    formaPagamento: {
      designacao: string
    }
    contaMovimentada?: string
    n_Bordoro?: string
    mesesPagos?: string[]
  }
  dadosAcademicos?: {
    curso: string
    classe: string
    turma: string
  }
  operador?: string
}

/**
 * Serviço para geração de faturas térmicas em PDF (80mm)
 */
export class ThermalInvoiceService {
  /**
   * Adiciona o logo ao cabeçalho do PDF térmico
   */
  private static async addLogo(doc: jsPDF, pageWidth: number, yPosition: number): Promise<number> {
    try {
      const logoUrl = '/icon.png'
      const response = await fetch(logoUrl)
      const blob = await response.blob()
      const reader = new FileReader()
      
      await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result as string
          // Logo menor para fatura térmica (25px = ~9mm)
          const logoWidth = 9
          const logoHeight = 9
          doc.addImage(base64data, 'PNG', (pageWidth - logoWidth) / 2, yPosition, logoWidth, logoHeight)
          resolve(null)
        }
        reader.readAsDataURL(blob)
      })
      
      return yPosition + 14 // Retornar nova posição Y (logo + margem maior)
    } catch (error) {
      console.warn('Erro ao carregar logo:', error)
      return yPosition // Continuar sem o logo
    }
  }
  
  /**
   * Gera PDF da fatura térmica (80mm)
   */
  static async generateThermalPDF(data: ThermalInvoiceData): Promise<void> {
    try {
      // Configurar PDF para formato de impressora térmica (80mm)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // 80mm de largura, altura variável
      })

      const pageWidth = 80
      const margin = 3
      let yPosition = 5
      
      // Adicionar logo
      yPosition = await this.addLogo(doc, pageWidth, yPosition)

      // Configurar fonte monoespaçada
      doc.setFont('courier', 'normal')

      // Cabeçalho
      doc.setFontSize(8)
      doc.setFont('courier', 'bold')
      
      // Nome da escola (centralizado)
      const schoolName = 'COMPLEXO ESCOLAR PRIVADO JOMORAIS'
      doc.text(schoolName, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 4

      doc.setFont('courier', 'normal')
      doc.setFontSize(6)
      
      // Dados da escola
      const schoolInfo = [
        'NIF: 5101165107',
        'Bairro 1º de Maio, Zongoio - Cabinda',
        'Tlf: 915312187',
        `Data: ${this.formatDateTime(data.pagamento.data)}`
      ]

      schoolInfo.forEach(info => {
        doc.text(info, pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 3
      })

      // Linha separadora
      yPosition += 2
      doc.text('='.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 4

      // Dados do Aluno
      doc.setFontSize(6)
      doc.setFont('courier', 'bold')
      doc.text(`Aluno(a): ${data.pagamento.aluno.nome}`, margin, yPosition)
      yPosition += 3

      doc.setFont('courier', 'normal')
      doc.text('Consumidor Final', margin, yPosition)
      yPosition += 3

      // Curso, classe e turma (se disponíveis)
      if (data.dadosAcademicos) {
        if (data.dadosAcademicos.curso) {
          doc.text(data.dadosAcademicos.curso, margin, yPosition)
          yPosition += 3
        }
        
        if (data.dadosAcademicos.classe && data.dadosAcademicos.turma) {
          doc.text(`${data.dadosAcademicos.classe} - ${data.dadosAcademicos.turma}`, margin, yPosition)
          yPosition += 3
        }
      }

      if (data.pagamento.aluno.n_documento_identificacao) {
        doc.text(`Doc: ${data.pagamento.aluno.n_documento_identificacao}`, margin, yPosition)
        yPosition += 3
      }

      yPosition += 2

      // Tabela de serviços
      doc.text('-'.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 3

      // Cabeçalho da tabela
      doc.setFont('courier', 'bold')
      doc.text('Servicos', margin, yPosition)
      doc.text('Qtd', 45, yPosition)
      doc.text('P.Unit', 55, yPosition)
      doc.text('Total', 68, yPosition)
      yPosition += 3

      doc.text('-'.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 3

      // Linha do serviço
      doc.setFont('courier', 'normal')
      const serviceName = this.truncateText(data.pagamento.tipoServico.designacao, 20)
      const quantidade = data.pagamento.mesesPagos?.length || 1
      doc.text(serviceName, margin, yPosition)
      doc.text(quantidade.toString(), 47, yPosition)
      doc.text(this.formatCurrency(data.pagamento.preco), 55, yPosition)
      doc.text(this.formatCurrency(data.pagamento.preco * quantidade), 68, yPosition)
      yPosition += 3

      doc.text('-'.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 4

      // Totais
      const valorTotal = data.pagamento.preco * quantidade
      const totals = [
        `Forma de Pagamento: ${data.pagamento.formaPagamento.designacao}`
      ]

      // Adicionar informações de depósito bancário se aplicável
      if (data.pagamento.contaMovimentada) {
        totals.push(`Conta Bancaria: ${data.pagamento.contaMovimentada}`)
      }
      if (data.pagamento.n_Bordoro) {
        totals.push(`N Bordero: ${data.pagamento.n_Bordoro}`)
      }

      // Meses pagos (se aplicável)
      if (data.pagamento.mesesPagos && data.pagamento.mesesPagos.length > 0) {
        totals.push(`Meses: ${data.pagamento.mesesPagos.join(', ')}`)
      }

      totals.push(
        `Total: ${this.formatCurrency(valorTotal)}`,
        'Total IVA: 0.00',
        `N.º de Itens: ${quantidade}`,
        'Desconto: 0.00',
        `A Pagar: ${this.formatCurrency(valorTotal)}`,
        `Total Pago: ${this.formatCurrency(valorTotal)}`,
        'Pago em Saldo: 0.00',
        'Saldo Actual: 0.00'
      )

      totals.forEach(total => {
        doc.text(total, margin, yPosition)
        yPosition += 3
      })

      // Observações
      if (data.pagamento.observacao) {
        yPosition += 2
        doc.text('-'.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 3
        doc.setFont('courier', 'bold')
        const obsLines = this.wrapText(doc, `Obs: ${data.pagamento.observacao}`, pageWidth - (margin * 2))
        obsLines.forEach(line => {
          doc.text(line, margin, yPosition)
          yPosition += 3
        })
      }

      yPosition += 2

      // Rodapé
      doc.text('='.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 3

      doc.setFontSize(5)
      const footer = [
        `Operador: ${data.operador || 'Sistema'}`,
        `Emitido em: ${this.formatDateTime(data.pagamento.data)}`,
        `Fatura: ${data.pagamento.fatura}`,
        'REGIME SIMPLIFICADO',
        'Processado pelo computador'
      ]

      footer.forEach(info => {
        doc.text(info, pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 2.5
      })

      yPosition += 3

      // Selo de PAGO
      doc.setFontSize(10)
      doc.setFont('courier', 'bold')
      doc.text('[ PAGO ]', pageWidth / 2, yPosition, { align: 'center' })

      // Ajustar altura do PDF
      const finalHeight = yPosition + 10
      doc.internal.pageSize.height = finalHeight

      // Salvar o PDF
      doc.save(`Fatura_Termica_${data.pagamento.fatura}.pdf`)
      
    } catch (error) {
      console.error('Erro ao gerar PDF da fatura térmica:', error)
      throw new Error('Erro ao gerar PDF da fatura térmica')
    }
  }

  /**
   * Abre janela de impressão para fatura térmica
   */
  static async generateAndPrintThermalPDF(data: ThermalInvoiceData): Promise<void> {
    try {
      // Configurar PDF para formato de impressora térmica (80mm)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200]
      })

      // Gerar conteúdo igual ao método generateThermalPDF
      const pageWidth = 80
      const margin = 3
      let yPosition = 5
      
      yPosition = await this.addLogo(doc, pageWidth, yPosition)
      doc.setFont('courier', 'normal')
      doc.setFontSize(8)
      doc.setFont('courier', 'bold')
      
      const schoolName = 'COMPLEXO ESCOLAR PRIVADO JOMORAIS'
      doc.text(schoolName, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 4

      doc.setFont('courier', 'normal')
      doc.setFontSize(6)
      
      const schoolInfo = [
        'NIF: 5101165107',
        'Bairro 1º de Maio, Zongoio - Cabinda',
        'Tlf: 915312187',
        `Data: ${this.formatDateTime(data.pagamento.data)}`
      ]

      schoolInfo.forEach(info => {
        doc.text(info, pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 3
      })

      yPosition += 2
      doc.text('='.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 4

      doc.setFontSize(6)
      doc.setFont('courier', 'bold')
      doc.text(`Aluno(a): ${data.pagamento.aluno.nome}`, margin, yPosition)
      yPosition += 3

      doc.setFont('courier', 'normal')
      doc.text('Consumidor Final', margin, yPosition)
      yPosition += 3

      if (data.dadosAcademicos) {
        if (data.dadosAcademicos.curso) {
          doc.text(data.dadosAcademicos.curso, margin, yPosition)
          yPosition += 3
        }
        
        if (data.dadosAcademicos.classe && data.dadosAcademicos.turma) {
          doc.text(`${data.dadosAcademicos.classe} - ${data.dadosAcademicos.turma}`, margin, yPosition)
          yPosition += 3
        }
      }

      if (data.pagamento.aluno.n_documento_identificacao) {
        doc.text(`Doc: ${data.pagamento.aluno.n_documento_identificacao}`, margin, yPosition)
        yPosition += 3
      }

      yPosition += 2
      doc.text('-'.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 3

      doc.setFont('courier', 'bold')
      doc.text('Servicos', margin, yPosition)
      doc.text('Qtd', 45, yPosition)
      doc.text('P.Unit', 55, yPosition)
      doc.text('Total', 68, yPosition)
      yPosition += 3

      doc.text('-'.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 3

      doc.setFont('courier', 'normal')
      const serviceName = this.truncateText(data.pagamento.tipoServico.designacao, 20)
      const quantidade = data.pagamento.mesesPagos?.length || 1
      doc.text(serviceName, margin, yPosition)
      doc.text(quantidade.toString(), 47, yPosition)
      doc.text(this.formatCurrency(data.pagamento.preco), 55, yPosition)
      doc.text(this.formatCurrency(data.pagamento.preco * quantidade), 68, yPosition)
      yPosition += 3

      doc.text('-'.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 4

      const valorTotal = data.pagamento.preco * quantidade
      const totals = [`Forma de Pagamento: ${data.pagamento.formaPagamento.designacao}`]

      if (data.pagamento.contaMovimentada) {
        totals.push(`Conta Bancaria: ${data.pagamento.contaMovimentada}`)
      }
      if (data.pagamento.n_Bordoro) {
        totals.push(`N Bordero: ${data.pagamento.n_Bordoro}`)
      }
      if (data.pagamento.mesesPagos && data.pagamento.mesesPagos.length > 0) {
        totals.push(`Meses: ${data.pagamento.mesesPagos.join(', ')}`)
      }

      totals.push(
        `Total: ${this.formatCurrency(valorTotal)}`,
        'Total IVA: 0.00',
        `N.º de Itens: ${quantidade}`,
        'Desconto: 0.00',
        `A Pagar: ${this.formatCurrency(valorTotal)}`,
        `Total Pago: ${this.formatCurrency(valorTotal)}`,
        'Pago em Saldo: 0.00',
        'Saldo Actual: 0.00'
      )

      totals.forEach(total => {
        doc.text(total, margin, yPosition)
        yPosition += 3
      })

      if (data.pagamento.observacao) {
        yPosition += 2
        doc.text('-'.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 3
        doc.setFont('courier', 'bold')
        const obsLines = this.wrapText(doc, `Obs: ${data.pagamento.observacao}`, pageWidth - (margin * 2))
        obsLines.forEach(line => {
          doc.text(line, margin, yPosition)
          yPosition += 3
        })
      }

      yPosition += 2
      doc.text('='.repeat(35), pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 3

      doc.setFontSize(5)
      const footer = [
        `Operador: ${data.operador || 'Sistema'}`,
        `Emitido em: ${this.formatDateTime(data.pagamento.data)}`,
        `Fatura: ${data.pagamento.fatura}`,
        'REGIME SIMPLIFICADO',
        'Processado pelo computador'
      ]

      footer.forEach(info => {
        doc.text(info, pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 2.5
      })

      yPosition += 3
      doc.setFontSize(10)
      doc.setFont('courier', 'bold')
      doc.text('[ PAGO ]', pageWidth / 2, yPosition, { align: 'center' })

      const finalHeight = yPosition + 10
      doc.internal.pageSize.height = finalHeight

      // Abrir PDF em nova janela e imprimir
      const pdfBlob = doc.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const printWindow = window.open(pdfUrl, '_blank')
      
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.focus()
          printWindow.print()
        })
      }
      
    } catch (error) {
      console.error('Erro ao gerar e imprimir PDF da fatura térmica:', error)
      throw new Error('Erro ao gerar e imprimir PDF da fatura térmica')
    }
  }

  /**
   * Formata valor monetário para impressora térmica
   */
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  /**
   * Formata data e hora
   */
  private static formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  /**
   * Trunca texto para caber na largura da impressora
   */
  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  /**
   * Quebra texto em múltiplas linhas
   */
  private static wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const textWidth = doc.getTextWidth(testLine)
      
      if (textWidth > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }
}

export default ThermalInvoiceService
