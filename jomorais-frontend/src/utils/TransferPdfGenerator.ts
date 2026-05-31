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
      }
    }
  }
  proveniencia: {
    codigo: number
    designacao: string
    localizacao?: string
  }
  instituicao: {
    nome: string
    endereco?: string
    telefone?: string
    email?: string
  }
  utilizador?: {
    nome: string
  }
}

export class TransferPdfGenerator {
  /**
   * Formata a data por extenso em Português
   */
  private static formatDateLong(dateStr: string): string {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('pt-AO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return ''
    }
  }

  /**
   * Gera o PDF oficial da Guia de Transferência
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
    const margin = 25
    const maxWidth = pageWidth - margin * 2
    let yPosition = 30

    // --- CABEÇALHO ---
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('REPÚBLICA DE ANGOLA', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8

    doc.text('GOVERNO DA PROVÍNCIA DE CABINDA', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8

    doc.setFontSize(12)
    doc.text(instituicao.nome.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 6

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(9)
    if (instituicao.endereco) {
      doc.text(instituicao.endereco, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 5
    }
    if (instituicao.telefone || instituicao.email) {
      doc.text(`Tel: ${instituicao.telefone || ''} | Email: ${instituicao.email || ''}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15
    }

    // Linha divisória decorativa
    doc.setDrawColor(0, 124, 0) // Verde Jomoraiss
    doc.setLineWidth(0.8)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 15

    // --- TÍTULO ---
    const anoEmissao = new Date(transferencia.dataTransferencia || Date.now()).getFullYear()
    const numGuia = String(transferencia.codigo).padStart(3, '0')
    const siglaInstituicao = 'DCITPSJM'
    
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(`GUIA DE TRANSFERÊNCIA Nº. ${numGuia}/${siglaInstituicao}/${anoEmissao}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // --- CORPO DO TEXTO ---
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(11)

    // Coleta dos dados dinâmicos do aluno
    const nomeAluno = aluno.nome || 'N/A'
    const matricula = aluno.tb_matriculas
    const confirmacao = matricula?.tb_confirmacoes?.[0]
    const turma = confirmacao?.tb_turmas
    const classe = turma?.tb_classes?.designacao || 'N/A'
    const designacaoTurma = turma?.designacao || 'N/A'
    const periodo = turma?.tb_periodos?.designacao || 'N/A'
    const curso = matricula?.tb_cursos?.designacao || 'N/A'
    const nProcesso = String(aluno.codigo).padStart(4, '0')
    
    const pai = aluno.pai || 'N/A'
    const mae = aluno.mae || 'N/A'
    const naturalidade = aluno.tb_comunas?.tb_municipios?.tb_provincias?.designacao || 'Cabinda'
    const municipio = aluno.tb_comunas?.tb_municipios?.designacao || 'Cabinda'
    const provincia = aluno.tb_comunas?.tb_municipios?.tb_provincias?.designacao || 'Cabinda'
    const dataNascimento = this.formatDateLong(aluno.dataNascimento)
    
    const biNum = aluno.n_documento_identificacao || 'N/A'
    const biProvincia = aluno.provinciaEmissao || 'Cabinda'
    const biData = aluno.dataEmissao ? this.formatDateLong(aluno.dataEmissao) : 'N/A'
    
    const escolaDestino = proveniencia.designacao.toUpperCase()
    
    // Parágrafo 1
    const paragrafo1 = `Para os fins julgados convenientes e conforme solicitado pelo (a) Encarregado (a) da educação, é transferido o aluno ${nomeAluno}, da ${classe}, turma: ${designacaoTurma}, período: ${periodo}, curso: ${curso}, processo nº.${nProcesso}, filho de ${pai} e de ${mae}, natural de ${naturalidade}, município de ${municipio}, província de ${provincia}, nascido aos ${dataNascimento}, portador do Bilhete de Identidade nº.${biNum}, emitido pela Identificação de ${biProvincia}, aos ${biData}.`
    const linesP1 = doc.splitTextToSize(paragrafo1, maxWidth)
    doc.text(linesP1, margin, yPosition, { align: 'justify' })
    yPosition += linesP1.length * 6 + 10

    // Parágrafo 2
    const paragrafo2 = `Para o ${escolaDestino}.`
    doc.setFont('Helvetica', 'bold')
    const linesP2 = doc.splitTextToSize(paragrafo2, maxWidth)
    doc.text(linesP2, margin, yPosition, { align: 'justify' })
    yPosition += linesP2.length * 6 + 10

    // Observação
    doc.setFont('Helvetica', 'normal')
    const obsText = `OBS: Vai matricular-se na ${classe}.`
    doc.text(obsText, margin, yPosition)
    yPosition += 10

    // Processo Individual
    const processoText = `CONSTITUÍ O SEU PROCESSO INDIVIDUAL: cópia do bilhete de identidade, certificado de conclusão do I ciclo do Ensino Secundário Geral e Ficha Académica do Ensino Médio de Saúde.`
    const linesProcesso = doc.splitTextToSize(processoText, maxWidth)
    doc.text(linesProcesso, margin, yPosition, { align: 'justify' })
    yPosition += linesProcesso.length * 6 + 12

    // Parágrafo de Encerramento
    const encerramento = `Por ser verdade e me ter sido solicitada, passou-se a presente GUIA DE TRANSFERÊNCIA que vai por mim assinada e autenticada com o carimbo em uso nesta Instituição de Ensino.`
    const linesEncerramento = doc.splitTextToSize(encerramento, maxWidth)
    doc.text(linesEncerramento, margin, yPosition, { align: 'justify' })
    yPosition += linesEncerramento.length * 6 + 18

    // --- DATA E LOCAL ---
    const localDataText = `${instituicao.nome.toUpperCase()}, ${this.formatDateLong(transferencia.dataTransferencia)}.`
    doc.setFont('Helvetica', 'bold')
    doc.text(localDataText, margin, yPosition)
    yPosition += 25

    // --- ASSINATURAS ---
    doc.setFontSize(10)
    doc.text('O Director do Instituto', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 18
    
    doc.line(pageWidth / 2 - 40, yPosition, pageWidth / 2 + 40, yPosition) // Linha de assinatura
    yPosition += 6
    
    doc.text('GABRIEL PRÓSPERO MABIALA', pageWidth / 2, yPosition, { align: 'center' })

    // Salvar arquivo PDF
    doc.save(`Guia_Transferencia_${nomeAluno.replace(/\s+/g, '_')}.pdf`)
  }
}
