import api from '../utils/api.utils'
import { Document, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel, TextRun, PageBreak, Packer } from 'docx'
import logoIcon from '../assets/images/icon.png'

/**
 * Interface para dados de estudante no relatório
 */
export interface StudentData {
  codigo: number
  nome: string
  numero_documento?: string
  email?: string
  telefone?: string
  data_nascimento?: string
  data_Nascimento?: string
  dataNascimento?: string
  idade?: number
  genero?: string
}

/**
 * Interface para dados de turma no relatório
 */
export interface TurmaReportData {
  turma: {
    codigo: number
    designacao: string
    tb_classes?: { designacao: string }
    tb_cursos?: { designacao: string }
    tb_salas?: { designacao: string }
    tb_periodos?: { designacao: string }
  }
  alunos: StudentData[]
}

/**
 * Service para geração de relatórios de turmas
 * Suporta exportação em PDF e DOCX
 */
class TurmaReportService {
  private readonly baseUrl = '/api/academic-management'
  
  /**
   * Adiciona o cabeçalho padrão Jomorais ao PDF
   * @param doc - Documento jsPDF
   * @param pageWidth - Largura da página
   * @param startY - Posição Y inicial
   * @param title - Título do relatório
   * @returns Posição Y após o cabeçalho
   */
  private async addHeader(doc: any, pageWidth: number, startY: number, title: string): Promise<number> {
    let yPosition = startY;
    
    // Logo centralizado
    try {
      // Usa o logo importado diretamente
      const response = await fetch(logoIcon);
      
      // Verifica se a resposta é válida
      if (!response.ok) {
        throw new Error(`Falha ao carregar logo: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Verifica se é uma imagem válida
      if (!blob.type.startsWith('image/')) {
        throw new Error(`Tipo de arquivo inválido: ${blob.type}`);
      }
      
      const reader = new FileReader();
      
      await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          try {
            const base64data = reader.result as string;
            
            // Verifica se o base64 foi gerado corretamente
            if (!base64data || !base64data.startsWith('data:image/')) {
              throw new Error('Base64 inválido gerado');
            }
            
            const logoWidth = 14;
            const logoHeight = 14;
            
            // Detecta o formato da imagem automaticamente
            const format = blob.type.includes('png') ? 'PNG' : 'JPEG';
            
            doc.addImage(base64data, format, (pageWidth - logoWidth) / 2, yPosition, logoWidth, logoHeight);
            resolve(null);
          } catch (err) {
            console.error('Erro ao processar imagem:', err);
            reject(err);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Erro ao ler arquivo'));
        };
        
        reader.readAsDataURL(blob);
      });
      
      yPosition += 22;
    } catch (error) {
      console.warn('Logo não pôde ser carregado, continuando sem logo:', error);
      // Não adiciona espaço extra se o logo falhou
    }
    
    // Título do instituto centralizado
    doc.setFontSize(18);
    doc.setTextColor(249, 205, 29); // Amarelo JOMORAIS
    doc.text('INSTITUTO MÉDIO POLITÉCNICO JOMORAIS', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 12;
    
    // Título do relatório
    doc.setFontSize(14);
    doc.setTextColor(59, 108, 77); // Verde JOMORAIS
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    
    // Data e hora
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-AO')} às ${new Date().toLocaleTimeString('pt-AO')}`, pageWidth / 2, yPosition, { align: 'center' });
    
    return yPosition + 10;
  }
  
  /**
   * Obtém a data de nascimento do aluno (suporta múltiplas variações de campo)
   * @param aluno - Dados do aluno
   * @returns Data de nascimento ou null
   */
  private getBirthDate(aluno: any): string | null {
    // Suporta múltiplas variações do campo de data de nascimento
    return aluno.data_nascimento || aluno.data_Nascimento || aluno.dataNascimento || null;
  }

  /**
   * Calcula a idade baseada na data de nascimento
   * @param birthDate - Data de nascimento
   * @returns Idade calculada
   */
  private calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Obtém a idade do aluno (calcula ou retorna o campo idade)
   * @param aluno - Dados do aluno
   * @returns Idade como string
   */
  private getAge(aluno: StudentData): string {
    const birthDate = this.getBirthDate(aluno);
    if (birthDate) {
      try {
        return this.calculateAge(birthDate).toString();
      } catch (error) {
        console.warn('Erro ao calcular idade:', error);
      }
    }
    return aluno.idade?.toString() || 'N/A';
  }

  /**
   * Busca alunos de uma turma específica
   * @param turmaId - ID da turma
   * @returns Promise com lista de alunos
   */
  async getStudentsByTurma(turmaId: number): Promise<StudentData[]> {
    try {
      const response = await api.get(`${this.baseUrl}/turmas/${turmaId}/alunos`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Erro ao buscar alunos')
    } catch (error) {
      console.error('Erro ao buscar alunos da turma:', error)
      return []
    }
  }

  /**
   * Busca todas as turmas com seus alunos
   * @param anoLectivoId - ID do ano letivo (opcional)
   * @returns Promise com lista de turmas e seus alunos
   */
  async getAllTurmasWithStudents(anoLectivoId?: number): Promise<TurmaReportData[]> {
    try {
      const params = anoLectivoId ? { ano_lectivo: anoLectivoId } : {}
      const response = await api.get(`${this.baseUrl}/relatorio-turmas-completo`, { params })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Erro ao buscar dados')
    } catch (error) {
      console.error('Erro ao buscar turmas com alunos:', error)
      throw new Error('Não foi possível carregar os dados das turmas')
    }
  }

  /**
   * Gera PDF para uma turma específica
   * @param turma - Dados da turma
   */
  async generateSingleTurmaPDF(turma: any): Promise<void> {
    try {
      const alunos = await this.getStudentsByTurma(turma.codigo);
      
      // Importar jsPDF dinamicamente
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      
      // Adicionar cabeçalho
      let yPosition = await this.addHeader(doc, pageWidth, margin, 'LISTA NOMINAL DE ALUNOS');
      
      // Informações da turma
      yPosition += 5;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const turmaInfo = [
        `Turma: ${turma.designacao}`,
        `Classe: ${turma.tb_classes?.designacao || 'N/A'}`,
        `Curso: ${turma.tb_cursos?.designacao || 'N/A'}`,
        `Sala: ${turma.tb_salas?.designacao || 'N/A'}`,
        `Período: ${turma.tb_periodos?.designacao || 'N/A'}`,
        `Total de Alunos: ${alunos.length}`
      ];
      
      turmaInfo.forEach(info => {
        doc.text(info, margin, yPosition);
        yPosition += 7;
      });
      
      yPosition += 5;
      
      // Ordenar alunos alfabeticamente
      const alunosOrdenados = alunos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }));
      
      // Cabeçalho da tabela
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(249, 205, 29); // Amarelo JOMORAIS
      doc.rect(15, yPosition - 5, 180, 10, 'F');
      
      doc.text('Nº', 18, yPosition);
      doc.text('Nome', 30, yPosition);
      doc.text('Telefone', 95, yPosition);
      doc.text('Documento', 125, yPosition);
      doc.text('Idade', 160, yPosition);
      doc.text('Status', 175, yPosition);
      yPosition += 12;
      
      // Dados dos alunos
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      
      alunosOrdenados.forEach((aluno, index) => {
        // Verificar se precisa de nova página
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 30;
          
          // Repetir cabeçalho da tabela
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(249, 205, 29);
          doc.rect(15, yPosition - 5, 180, 10, 'F');
          doc.text('Nº', 18, yPosition);
          doc.text('Nome', 30, yPosition);
          doc.text('Telefone', 95, yPosition);
          doc.text('Documento', 125, yPosition);
          doc.text('Idade', 160, yPosition);
          doc.text('Status', 175, yPosition);
          yPosition += 12;
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(8);
        }
        
        // Linha alternada
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(15, yPosition - 4, 180, 8, 'F');
        }
        
        // Dados do aluno
        doc.text((index + 1).toString(), 18, yPosition);
        doc.text(aluno.nome?.substring(0, 22) || 'N/A', 30, yPosition);
        doc.text(aluno.telefone?.substring(0, 12) || 'N/A', 95, yPosition);
        doc.text(aluno.numero_documento?.substring(0, 13) || 'N/A', 125, yPosition);
        
        // Idade
        doc.text(this.getAge(aluno), 162, yPosition);
        
        // Status (sempre ativo para alunos matriculados)
        doc.setTextColor(34, 197, 94); // Verde
        doc.text('Ativo', 175, yPosition);
        doc.setTextColor(0, 0, 0);
        
        yPosition += 8;
      });
      
      // Rodapé com assinaturas
      if (yPosition + 60 < 280) {
        yPosition += 20;
        doc.setFontSize(10);
        doc.text('Assinatura do Diretor: _________________________', margin, yPosition);
        doc.text('Assinatura do Coordenador: _________________________', margin, yPosition + 15);
      }
      
      // Adicionar número de página no rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, 285, { align: 'right' });
      }
      
      // Salvar o PDF
      doc.save(`Lista_Alunos_${turma.designacao.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF da turma:', error);
      throw new Error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Gera PDF para todas as turmas
   * @param anoLectivoId - ID do ano letivo (opcional)
   */
  async generateAllTurmasPDF(anoLectivoId?: number): Promise<void> {
    try {
      const turmasData = await this.getAllTurmasWithStudents(anoLectivoId);
      
      if (!turmasData || turmasData.length === 0) {
        throw new Error('Nenhuma turma encontrada para o ano letivo selecionado');
      }
      
      
      // Importar jsPDF dinamicamente
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      
      // Processar cada turma
      for (let turmaIndex = 0; turmaIndex < turmasData.length; turmaIndex++) {
        const turmaData = turmasData[turmaIndex];
        
        try {
          
          // Nova página para cada turma (exceto a primeira)
          if (turmaIndex > 0) {
            doc.addPage();
          }
          
          // Adicionar cabeçalho
          let yPosition = await this.addHeader(doc, pageWidth, margin, 'LISTA NOMINAL DE ALUNOS');
          
          // Informações da turma
          yPosition += 5;
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          
          const turmaInfo = [
            `Turma: ${turmaData.turma.designacao || 'N/A'}`,
            `Classe: ${turmaData.turma.tb_classes?.designacao || 'N/A'}`,
            `Curso: ${turmaData.turma.tb_cursos?.designacao || 'N/A'}`,
            `Sala: ${turmaData.turma.tb_salas?.designacao || 'N/A'}`,
            `Período: ${turmaData.turma.tb_periodos?.designacao || 'N/A'}`,
            `Total de Alunos: ${turmaData.alunos?.length || 0}`
          ];
          
          turmaInfo.forEach(info => {
            doc.text(info, margin, yPosition);
            yPosition += 7;
          });
          
          yPosition += 5;
          
          // Verificar se há alunos na turma
          if (!turmaData.alunos || turmaData.alunos.length === 0) {
            doc.setFontSize(12);
            doc.text('Nenhum aluno encontrado nesta turma.', margin, yPosition + 20);
          } else {
            // Ordenar alunos alfabeticamente
            const alunosOrdenados = [...turmaData.alunos].sort((a, b) => 
              (a.nome || '').localeCompare(b.nome || '', 'pt', { sensitivity: 'base' })
            );
            
            // Cabeçalho da tabela
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(249, 205, 29); // Amarelo JOMORAIS
            doc.rect(15, yPosition - 5, 180, 10, 'F');
            
            doc.text('Nº', 18, yPosition);
            doc.text('Nome', 30, yPosition);
            doc.text('Telefone', 95, yPosition);
            doc.text('Documento', 125, yPosition);
            doc.text('Idade', 160, yPosition);
            doc.text('Status', 175, yPosition);
            yPosition += 12;
            
            // Dados dos alunos
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(8);
            
            alunosOrdenados.forEach((aluno, index) => {
              // Verificar se precisa de nova página
              if (yPosition > 260) {
                doc.addPage();
                yPosition = 30;
                
                // Repetir cabeçalho da tabela
                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
                doc.setFillColor(249, 205, 29);
                doc.rect(15, yPosition - 5, 180, 10, 'F');
                doc.text('Nº', 18, yPosition);
                doc.text('Nome', 30, yPosition);
                doc.text('Telefone', 95, yPosition);
                doc.text('Documento', 125, yPosition);
                doc.text('Idade', 160, yPosition);
                doc.text('Status', 175, yPosition);
                yPosition += 12;
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(8);
              }
              
              // Linha alternada
              if (index % 2 === 0) {
                doc.setFillColor(248, 249, 250);
                doc.rect(15, yPosition - 4, 180, 8, 'F');
              }
              
              // Dados do aluno
              doc.text((index + 1).toString(), 18, yPosition);
              doc.text(aluno.nome?.substring(0, 22) || 'N/A', 30, yPosition);
              doc.text(aluno.telefone?.substring(0, 12) || 'N/A', 95, yPosition);
              doc.text(aluno.numero_documento?.substring(0, 13) || 'N/A', 125, yPosition);
              
              // Idade
              doc.text(this.getAge(aluno), 162, yPosition);
              
              // Status (sempre ativo para alunos matriculados)
              doc.setTextColor(34, 197, 94); // Verde
              doc.text('Ativo', 175, yPosition);
              doc.setTextColor(0, 0, 0);
              
              yPosition += 8;
            });
            
            // Rodapé com assinaturas
            if (yPosition + 60 < 280) {
              yPosition += 20;
              doc.setFontSize(10);
              doc.text('Assinatura do Diretor: _________________________', margin, yPosition);
              doc.text('Assinatura do Coordenador: _________________________', margin, yPosition + 15);
            }
          }
          
        } catch (turmaError) {
          console.error(`Erro ao processar turma ${turmaData.turma.designacao}:`, turmaError);
          // Continuar com as outras turmas mesmo se uma falhar
        }
      }
      
      // Adicionar número de página no rodapé de todas as páginas
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, 285, { align: 'right' });
      }
      
      // Salvar o PDF
      const fileName = `Lista_Alunos_Todas_Turmas_${new Date().toISOString().split('T')[0]}.pdf`;

      doc.save(fileName);
      
    } catch (error) {
      throw new Error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Gera documento Word para uma turma específica
   * @param turma - Dados da turma
   */
  async generateSingleTurmaDOC(turma: any): Promise<void> {
    try {
      const alunos = await this.getStudentsByTurma(turma.codigo);
      
      // Ordenar alunos alfabeticamente
      const alunosOrdenados = alunos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }));
      
      // Criar o documento
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Título do Instituto
            new Paragraph({
              text: 'INSTITUTO MÉDIO POLITÉCNICO JOMORAIS',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            
            // Título do Relatório
            new Paragraph({
              text: 'LISTA NOMINAL DE ALUNOS',
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),
            
            // Data e hora
            new Paragraph({
              text: `Gerado em: ${new Date().toLocaleDateString('pt-AO')} às ${new Date().toLocaleTimeString('pt-AO')}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            // Informações da turma
            new Paragraph({
              children: [
                new TextRun({ text: 'Turma: ', bold: true }),
                new TextRun({ text: turma.designacao }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Classe: ', bold: true }),
                new TextRun({ text: turma.tb_classes?.designacao || 'N/A' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Curso: ', bold: true }),
                new TextRun({ text: turma.tb_cursos?.designacao || 'N/A' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Sala: ', bold: true }),
                new TextRun({ text: turma.tb_salas?.designacao || 'N/A' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Período: ', bold: true }),
                new TextRun({ text: turma.tb_periodos?.designacao || 'N/A' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Total de Alunos: ', bold: true }),
                new TextRun({ text: alunos.length.toString() }),
              ],
              spacing: { after: 300 },
            }),
            
            // Tabela de alunos
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                // Cabeçalho
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: 'Nº', bold: true })],
                        alignment: AlignmentType.CENTER 
                      })],
                      width: { size: 8, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: 'Nome', bold: true })],
                        alignment: AlignmentType.CENTER 
                      })],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: 'Telefone', bold: true })],
                        alignment: AlignmentType.CENTER 
                      })],
                      width: { size: 18, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: 'Documento', bold: true })],
                        alignment: AlignmentType.CENTER 
                      })],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: 'Idade', bold: true })],
                        alignment: AlignmentType.CENTER 
                      })],
                      width: { size: 12, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: 'Status', bold: true })],
                        alignment: AlignmentType.CENTER 
                      })],
                      width: { size: 12, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                // Dados dos alunos
                ...alunosOrdenados.map((aluno, index) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ text: (index + 1).toString(), alignment: AlignmentType.CENTER })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: aluno.nome || 'N/A' })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: aluno.telefone || 'N/A', alignment: AlignmentType.CENTER })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: aluno.numero_documento || 'N/A', alignment: AlignmentType.CENTER })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: this.getAge(aluno), alignment: AlignmentType.CENTER })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: 'Ativo', alignment: AlignmentType.CENTER })],
                      }),
                    ],
                  })
                ),
              ],
            }),
            
            // Espaço antes das assinaturas
            new Paragraph({ text: '', spacing: { before: 600 } }),
            
            // Assinaturas
            new Paragraph({
              text: 'Assinatura do Diretor: _________________________',
              spacing: { after: 300 },
            }),
            new Paragraph({
              text: 'Assinatura do Coordenador: _________________________',
            }),
          ],
        }],
      });
      
      // Gerar e baixar o arquivo
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lista_Alunos_${turma.designacao.replace(/\s+/g, '_')}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao gerar DOC da turma:', error);
      throw new Error(`Erro ao gerar DOC: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Gera documento Word para todas as turmas
   * @param anoLectivoId - ID do ano letivo (opcional)
   */
  async generateAllTurmasDOC(anoLectivoId?: number): Promise<void> {
    try {
      const turmasData = await this.getAllTurmasWithStudents(anoLectivoId);
      
      if (!turmasData || turmasData.length === 0) {
        throw new Error('Nenhuma turma encontrada para o ano letivo selecionado');
      }
      
      // Criar seções para cada turma
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sections: any[] = [];
      
      for (let turmaIndex = 0; turmaIndex < turmasData.length; turmaIndex++) {
        const turmaData = turmasData[turmaIndex];
        
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const children: any[] = [
            // Título do Instituto
            new Paragraph({
              text: 'INSTITUTO MÉDIO POLITÉCNICO JOMORAIS',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            
            // Título do Relatório
            new Paragraph({
              text: 'LISTA NOMINAL DE ALUNOS',
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),
            
            // Data e hora
            new Paragraph({
              text: `Gerado em: ${new Date().toLocaleDateString('pt-AO')} às ${new Date().toLocaleTimeString('pt-AO')}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            // Informações da turma
            new Paragraph({
              children: [
                new TextRun({ text: 'Turma: ', bold: true }),
                new TextRun({ text: turmaData.turma.designacao || 'N/A' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Classe: ', bold: true }),
                new TextRun({ text: turmaData.turma.tb_classes?.designacao || 'N/A' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Curso: ', bold: true }),
                new TextRun({ text: turmaData.turma.tb_cursos?.designacao || 'N/A' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Sala: ', bold: true }),
                new TextRun({ text: turmaData.turma.tb_salas?.designacao || 'N/A' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Período: ', bold: true }),
                new TextRun({ text: turmaData.turma.tb_periodos?.designacao || 'N/A' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Total de Alunos: ', bold: true }),
                new TextRun({ text: (turmaData.alunos?.length || 0).toString() }),
              ],
              spacing: { after: 300 },
            }),
          ];
          
          // Verificar se há alunos
          if (!turmaData.alunos || turmaData.alunos.length === 0) {
            children.push(
              new Paragraph({
                text: 'Nenhum aluno encontrado nesta turma.',
                alignment: AlignmentType.CENTER,
                spacing: { before: 300 },
              })
            );
          } else {
            // Ordenar alunos alfabeticamente
            const alunosOrdenados = [...turmaData.alunos].sort((a, b) => 
              (a.nome || '').localeCompare(b.nome || '', 'pt', { sensitivity: 'base' })
            );
            
            // Adicionar tabela de alunos
            children.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  // Cabeçalho
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: 'Nº', bold: true })],
                          alignment: AlignmentType.CENTER 
                        })],
                        width: { size: 8, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: 'Nome', bold: true })],
                          alignment: AlignmentType.CENTER 
                        })],
                        width: { size: 30, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: 'Telefone', bold: true })],
                          alignment: AlignmentType.CENTER 
                        })],
                        width: { size: 18, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: 'Documento', bold: true })],
                          alignment: AlignmentType.CENTER 
                        })],
                        width: { size: 20, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: 'Idade', bold: true })],
                          alignment: AlignmentType.CENTER 
                        })],
                        width: { size: 12, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: 'Status', bold: true })],
                          alignment: AlignmentType.CENTER 
                        })],
                        width: { size: 12, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  }),
                  // Dados dos alunos
                  ...alunosOrdenados.map((aluno, index) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph({ text: (index + 1).toString(), alignment: AlignmentType.CENTER })],
                        }),
                        new TableCell({
                          children: [new Paragraph({ text: aluno.nome || 'N/A' })],
                        }),
                        new TableCell({
                          children: [new Paragraph({ text: aluno.telefone || 'N/A', alignment: AlignmentType.CENTER })],
                        }),
                        new TableCell({
                          children: [new Paragraph({ text: aluno.numero_documento || 'N/A', alignment: AlignmentType.CENTER })],
                        }),
                        new TableCell({
                          children: [new Paragraph({ text: this.getAge(aluno), alignment: AlignmentType.CENTER })],
                        }),
                        new TableCell({
                          children: [new Paragraph({ text: 'Ativo', alignment: AlignmentType.CENTER })],
                        }),
                      ],
                    })
                  ),
                ],
              })
            );
          }
          
          // Assinaturas
          children.push(
            new Paragraph({ text: '', spacing: { before: 600 } }),
            new Paragraph({
              text: 'Assinatura do Diretor: _________________________',
              spacing: { after: 300 },
            }),
            new Paragraph({
              text: 'Assinatura do Coordenador: _________________________',
            })
          );
          
          // Adicionar quebra de página entre turmas (exceto na última)
          if (turmaIndex < turmasData.length - 1) {
            children.push(
              new Paragraph({
                children: [new PageBreak()],
              })
            );
          }
          
          sections.push(...children);
          
        } catch (turmaError) {
          console.error(`Erro ao processar turma ${turmaData.turma.designacao}:`, turmaError);
        }
      }
      
      // Criar o documento
      const doc = new Document({
        sections: [{
          properties: {},
          children: sections,
        }],
      });
      
      // Gerar e baixar o arquivo
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lista_Alunos_Todas_Turmas_${new Date().toISOString().split('T')[0]}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao gerar DOC de todas as turmas:', error)
      throw new Error(`Erro ao gerar DOC: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new TurmaReportService()
