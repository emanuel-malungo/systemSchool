import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  DollarSign,
  X,
  User,
  FileText,
  Download,
  Loader2,
  CreditCard,
  Search,
} from 'lucide-react';
import { toast } from 'react-toastify';
import type { Student } from '../../types/student.types';
import { useAllFormasPagamento, useTiposServico, useMesesPendentes, useCreatePagamento } from '../../hooks/usePayment';
import { useStudents } from '../../hooks/useStudent';
import { useAnosLectivos } from '../../hooks/useAnoLectivo';

// ============= FUNÇÕES AUXILIARES (baseadas no jomorais) =============

// Abreviações de cursos
const ABREVIACOES_CURSOS: Record<string, string[]> = {
  'ANALISES CLINICAS': ['A.C', 'AC', 'ANALISES', 'ANÁLISES', 'ANALÍSES CLÍNICAS', 'ANALISES CLINICAS'],
  'ENFERMAGEM GERAL': ['E.G', 'EG', 'ENFERMAGEM', 'ENFERMAGEM GERAL'],
  'FARMACIA': ['F.M', 'FM', 'FARMACIA', 'FARMÁCIA'],
  'INFORMATICA': ['INFORMATICA', 'INFORMÁTICA', 'INFO'],
  'CIENCIAS ECONOMICAS JURIDICAS': ['C.E.J', 'CEJ', 'ECONOMICAS', 'JURIDICAS'],
  'CIENCIAS FISICAS BIOLOGICAS': ['C.F.B', 'CFB', 'FISICAS', 'BIOLOGICAS'],
  'GERAL': ['GERAL', 'ENSINO GERAL', 'PRIMARIO', 'PRIMÁRIA', 'BÁSICO']
};

// Detectar curso no tipo de serviço
const detectarCursoNaTipoServico = (designacao: string, cursoAluno: string): boolean => {
  const designacaoUpper = designacao.toUpperCase();
  const abreviacoes = ABREVIACOES_CURSOS[cursoAluno];
  
  if (!abreviacoes) return false;
  
  for (const abrev of abreviacoes) {
    if (designacaoUpper.includes(abrev)) {
      return true;
    }
  }
  
  return false;
};

// Extrair número da classe
const extrairNumeroClasse = (texto: string): string | null => {
  const match = texto.match(/(\d+)ª/);
  return match ? match[1] + 'ª' : null;
};

// Extrair ano letivo da string
const extrairAnoLetivo = (texto: string): string | null => {
  const match = texto.match(/(\d{4})\s*[\/\-]\s*(\d{4})/);
  return match ? `${match[1]}/${match[2]}` : null;
};

// Mapear curso por turma
const mapearCursoPorTurma = (turma: string): string => {
  const turmaUpper = turma.toUpperCase();
  
  if (turmaUpper.includes('INFORMÁTICA') || turmaUpper.includes('INFORMATICA')) {
    return 'INFORMATICA';
  }
  if (turmaUpper.includes('ANALISES') || turmaUpper.includes('ANÁLISES') || turmaUpper.includes('A.C') || turmaUpper.includes('AC')) {
    return 'ANALISES CLINICAS';
  }
  if (turmaUpper.includes('ENFERMAGEM') || turmaUpper.includes('E.G') || turmaUpper.includes('EG')) {
    return 'ENFERMAGEM GERAL';
  }
  if (turmaUpper.includes('FARMAC') || turmaUpper.includes('FARMÁCIA') || turmaUpper.includes('F.M') || turmaUpper.includes('FM')) {
    return 'FARMACIA';
  }
  if (turmaUpper.includes('ECONOMICAS') || turmaUpper.includes('JURIDICAS') || turmaUpper.includes('C.E.J') || turmaUpper.includes('CEJ')) {
    return 'CIENCIAS ECONOMICAS JURIDICAS';
  }
  if (turmaUpper.includes('FISICAS') || turmaUpper.includes('BIOLOGICAS') || turmaUpper.includes('C.F.B') || turmaUpper.includes('CFB')) {
    return 'CIENCIAS FISICAS BIOLOGICAS';
  }
  
  return 'GERAL';
};

// Função principal para encontrar melhor tipo de serviço
const findBestTipoServicoForAluno = (
  tiposServico: any[],
  anoLectivoSelecionado: any,
  dadosAluno: any
): { service: any; isGeneric: boolean } | null => {
  // Aceitar tanto dadosAluno.dadosAcademicos.turma quanto dadosAluno.turma
  const dadosAcademicos = dadosAluno?.dadosAcademicos || dadosAluno;
  
  if (!dadosAcademicos?.turma) {
    console.log('❌ [BUSCA] Turma não encontrada nos dados:', dadosAluno);
    return null;
  }

  const turma = dadosAcademicos.turma;
  const curso = mapearCursoPorTurma(turma);
  const classe = extrairNumeroClasse(turma);
  const anoBuscar = anoLectivoSelecionado ? 
    `${anoLectivoSelecionado.anoInicial}/${anoLectivoSelecionado.anoFinal}` : 
    null;
  
  console.log('🔍 [BUSCA] Dados extraídos:', { turma, curso, classe, anoBuscar });
  console.log('📋 [BUSCA] Total de tipos de serviço disponíveis:', tiposServico.length);
  
  const candidatos = [];
  
  for (const tipo of tiposServico) {
    const nome = tipo.designacao.toUpperCase();
    
    // 1. Deve ser PROPINA
    if (!nome.includes('PROPINA')) continue;
    
    // 2. Verificar CURSO
    let temCurso = false;
    if (curso === 'GERAL') {
      const temOutroCurso = Object.keys(ABREVIACOES_CURSOS)
        .filter(c => c !== 'GERAL')
        .some(outroCurso => detectarCursoNaTipoServico(nome, outroCurso));
      temCurso = !temOutroCurso;
    } else {
      temCurso = detectarCursoNaTipoServico(nome, curso);
    }
    
    // 3. Verificar CLASSE
    const classeNoTipo = extrairNumeroClasse(nome);
    const temClasse = classeNoTipo === classe;
    
    // 4. Verificar ANO LETIVO
    const anoNoTipo = extrairAnoLetivo(nome);
    let temAno = false;
    
    if (anoBuscar) {
      temAno = anoNoTipo === anoBuscar;
    } else {
      temAno = !anoNoTipo;
    }
    
    // Log detalhado para debug
    if (nome.includes('C.E.J') && nome.includes('10')) {
      console.log('🔍 [ANÁLISE]', tipo.designacao, {
        temCurso,
        temClasse,
        classeNoTipo,
        classeEsperada: classe,
        temAno,
        anoNoTipo,
        anoBuscar,
        codigo: tipo.codigo
      });
    }
    
    // SÓ ADICIONA SE TUDO ESTIVER CORRETO
    if (temCurso && temClasse && temAno) {
      console.log('✅ [CANDIDATO]', tipo.designacao);
      candidatos.push(tipo);
    }
  }
  
  // Retornar o melhor candidato (maior preço)
  if (candidatos.length > 0) {
    const melhor = candidatos.reduce((best, current) => 
      current.preco > best.preco ? current : best
    );
    console.log('✅ [BUSCA] Encontrado serviço específico para o ano letivo');
    return { service: melhor, isGeneric: false };
  }
  
  // FALLBACK: Buscar genéricos (SEMPRE filtrando por CURSO)
  if (anoBuscar) {
    console.log('⚠️ [FALLBACK] Nenhum candidato exato encontrado, buscando genéricos...');
    const genericosCursoClasse = [];
    const genericosCurso = [];
    
    for (const tipo of tiposServico) {
      const nome = tipo.designacao.toUpperCase();
      
      if (!nome.includes('PROPINA')) continue;
      
      // SEMPRE verificar o curso (OBRIGATÓRIO)
      let temCurso = false;
      if (curso === 'GERAL') {
        const temOutroCurso = Object.keys(ABREVIACOES_CURSOS)
          .filter(c => c !== 'GERAL')
          .some(outroCurso => detectarCursoNaTipoServico(nome, outroCurso));
        temCurso = !temOutroCurso;
      } else {
        temCurso = detectarCursoNaTipoServico(nome, curso);
      }
      
      // Se não tem o curso correto, PULAR
      if (!temCurso) continue;
      
      const classeNoTipo = extrairNumeroClasse(nome);
      const temClasse = classeNoTipo === classe;
      const anoNoTipo = extrairAnoLetivo(nome);
      const eGenerico = !anoNoTipo;
      
      if (eGenerico) {
        if (temClasse) {
          console.log('🔍 [FALLBACK] Genérico CURSO+CLASSE:', tipo.designacao);
          genericosCursoClasse.push(tipo);
        } else {
          console.log('🔍 [FALLBACK] Genérico SÓ CURSO:', tipo.designacao);
          genericosCurso.push(tipo);
        }
      }
    }
    
    let candidatosFinais: any[] = [];
    
    if (genericosCursoClasse.length > 0) {
      candidatosFinais = genericosCursoClasse;
      console.log('🎯 [FALLBACK] Usando genéricos CURSO+CLASSE (prioridade 1)');
    } else if (genericosCurso.length > 0) {
      candidatosFinais = genericosCurso;
      console.log('🎯 [FALLBACK] Usando genéricos SÓ CURSO (prioridade 2)');
    }
    
    if (candidatosFinais.length > 0) {
      const melhor = candidatosFinais.reduce((best, current) => 
        current.preco > best.preco ? current : best
      );
      console.log('⚠️ [FALLBACK] Usando serviço genérico (sem ano específico):', melhor.designacao);
      return { service: melhor, isGeneric: true };
    }
  }
  
  console.log('❌ [BUSCA] Nenhum tipo de serviço encontrado');
  return null;
};

// ============= FIM DAS FUNÇÕES AUXILIARES =============

type EstudanteCompleto = Student;

interface MakePaymentModalProps {
  open: boolean;
  onClose: () => void;
  student?: EstudanteCompleto | null;
  onSuccess?: () => void;
}

interface PaymentFormData {
  codigo_Tipo_Servico: number;
  codigo_FormaPagamento: number;
  preco: number;
  mesesSelecionados: string[];
  ano: number;
  observacao: string;
  n_Bordoro: string;
  contaMovimentada: string;
}

const MakePaymentModal: React.FC<MakePaymentModalProps> = ({
  open,
  onClose,
  student: studentProp,
  onSuccess
}) => {
  const currentYear = new Date().getFullYear();

  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<number | null>(null);
  const [isDeposito, setIsDeposito] = useState(false);
  const [isAutoSelected, setIsAutoSelected] = useState(false);
  const [isUsingGenericService, setIsUsingGenericService] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [createdPayment, setCreatedPayment] = useState<{
    preco: number;
    mesesPagos: string[];
    totalPago: number;
    [key: string]: unknown;
  } | null>(null);
  
  // Estados para busca de aluno
  const [alunoSearch, setAlunoSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedAluno, setSelectedAluno] = useState<EstudanteCompleto | null>(studentProp || null);
  const [showAlunoResults, setShowAlunoResults] = useState(false);
   
  const [formData, setFormData] = useState<PaymentFormData>({
    codigo_Tipo_Servico: 0,
    codigo_FormaPagamento: 0,
    preco: 0,
    mesesSelecionados: [],
    ano: currentYear,
    observacao: '',
    n_Bordoro: '',
    contaMovimentada: '',
  });

  // Hooks para dados
  const { data: formasPagamentoResponse, isLoading: loadingFormas } = useAllFormasPagamento(open);
  const { data: tiposServicoResponse, isLoading: loadingTipos } = useTiposServico(open);
  const { data: anosResponse, isLoading: loadingAnos } = useAnosLectivos(
    { page: 1, limit: 100 },
  );
  const { data: mesesResponse, isLoading: loadingMeses } = useMesesPendentes(
    selectedAluno?.codigo || 0,
    selectedAnoLectivo || undefined,
    { enabled: !!(open && selectedAluno && selectedAnoLectivo) }
  );
  
  // Debounce para busca de alunos (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(alunoSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [alunoSearch]);
  
  // Hook para buscar alunos com debounce
  const { data: alunosResponse, isLoading: loadingAlunos } = useStudents({
    page: 1,
    limit: 50,
    search: debouncedSearch.trim().length >= 2 ? debouncedSearch : undefined,
  });

  const createPaymentMutation = useCreatePagamento();

  const formasPagamento = useMemo(() => formasPagamentoResponse?.data || [], [formasPagamentoResponse?.data]);
  const tiposServico = useMemo(() => tiposServicoResponse?.data || [], [tiposServicoResponse?.data]);
  const anosLectivos = useMemo(() => anosResponse?.data || [], [anosResponse?.data]);
  const mesesPendentesData = (mesesResponse?.data || {}) as { mesesPendentes?: string[] };
  const alunos = useMemo(() => alunosResponse?.data || [], [alunosResponse?.data]);
  
  // Meses pendentes da API
  const mesesPendentes = mesesPendentesData?.mesesPendentes || [];
  
  // Extrair dados acadêmicos do aluno (similar ao jomorais)
  const extractAcademicData = useCallback(() => {
    if (!selectedAluno) return null;
    
    console.log('📊 [extractAcademicData] Aluno selecionado:', {
      codigo: selectedAluno.codigo,
      nome: selectedAluno.nome,
      temMatricula: !!selectedAluno?.tb_matriculas,
      estruturaAluno: Object.keys(selectedAluno),
      matricula: selectedAluno?.tb_matriculas
    });
    
    const matricula: any = selectedAluno?.tb_matriculas;
    const confirmacoes = matricula?.tb_confirmacoes;
    
    console.log('🔍 [extractAcademicData] Confirmações:', confirmacoes);
    
    // PRIORIDADE 1: Buscar na confirmação mais recente
    if (confirmacoes && Array.isArray(confirmacoes) && confirmacoes.length > 0) {
      // Ordenar por data mais recente
      const confirmacoesSorted = [...confirmacoes].sort((a: any, b: any) => {
        const dataA = new Date(a.data_Confirmacao || 0);
        const dataB = new Date(b.data_Confirmacao || 0);
        return dataB.getTime() - dataA.getTime();
      });
      
      const confirmacaoRecente = confirmacoesSorted[0];
      const turmaData = confirmacaoRecente?.tb_turmas;
      const classeData = turmaData?.tb_classes;
      const periodoData = turmaData?.tb_periodos;
      const salaData = turmaData?.tb_salas;
      
      if (turmaData) {
        // Extrair curso e classe da designação da turma usando as funções de mapeamento
        const turmaDesignacao = turmaData.designacao || '';
        const cursoMapeado = mapearCursoPorTurma(turmaDesignacao); // Usar função de mapeamento
        const classeExtraida = extrairNumeroClasse(turmaDesignacao); // Usar função de extração
        
        const dadosExtraidos = {
          curso: cursoMapeado,
          classe: classeData?.designacao || classeExtraida || 'Classe não especificada',
          turma: turmaData.designacao || 'Turma não informada',
          periodo: periodoData?.designacao || 'Não informado',
          sala: salaData?.designacao || null,
          isFromConfirmacao: true
        };
        
        console.log('✅ [extractAcademicData] Dados extraídos da confirmação:', dadosExtraidos);
        return dadosExtraidos;
      }
    }
    
    // FALLBACK: Dados básicos da matrícula
    const cursoData = matricula?.tb_cursos;
    
    const dadosFallback = {
      curso: cursoData?.designacao || 'Curso não especificado',
      classe: 'Classe não informada',
      turma: 'Turma não informada',
      periodo: 'Não informado',
      sala: null,
      isFromConfirmacao: false
    };
    
    console.warn('⚠️ [extractAcademicData] Usando dados FALLBACK (sem confirmação):', dadosFallback);
    console.warn('⚠️ [extractAcademicData] PROBLEMA: Aluno não possui dados de matrícula/confirmação completos');
    console.warn('⚠️ [extractAcademicData] SOLUÇÃO: Backend precisa retornar tb_matriculas com tb_confirmacoes na lista de alunos');
    
    return dadosFallback;
  }, [selectedAluno]);
  
  const dadosAcademicos = useMemo(() => extractAcademicData(), [extractAcademicData]);

  // Sincronizar studentProp com selectedAluno quando modal abre
  useEffect(() => {
    if (open && studentProp) {
      setSelectedAluno(studentProp);
      setAlunoSearch('');
      setShowAlunoResults(false);
    } else if (!open) {
      // Limpar estados quando modal fecha
      setSelectedAluno(null);
      setAlunoSearch('');
      setDebouncedSearch('');
      setShowAlunoResults(false);
      setFormData({
        codigo_Tipo_Servico: 0,
        codigo_FormaPagamento: 0,
        preco: 0,
        mesesSelecionados: [],
        ano: currentYear,
        observacao: '',
        n_Bordoro: '',
        contaMovimentada: '',
      });
      setSelectedAnoLectivo(null);
      setIsDeposito(false);
      setIsAutoSelected(false);
      setIsUsingGenericService(false);
    }
  }, [open, studentProp]);
  
  // Mostrar/ocultar resultados de busca com debounce
  useEffect(() => {
    if (debouncedSearch.trim().length >= 2 && !selectedAluno && alunos.length > 0) {
      setShowAlunoResults(true);
    } else if (debouncedSearch.trim().length < 2) {
      setShowAlunoResults(false);
    }
  }, [debouncedSearch, selectedAluno, alunos.length]);

  // Auto-selecionar ano letivo baseado na turma do aluno
  useEffect(() => {
    console.log('🔥 [AUTO-SELECT ANO] Verificando condições:', {
      open,
      selectedAluno: !!selectedAluno,
      alunoCodigo: selectedAluno?.codigo,
      anosLectivosLength: anosLectivos.length,
      selectedAnoLectivo
    });

    // Só executar se o modal estiver aberto
    if (!open) {
      console.log('❌ [AUTO-SELECT ANO] Modal fechado, ignorando');
      return;
    }

    if (!selectedAluno || anosLectivos.length === 0) {
      console.log('❌ [AUTO-SELECT ANO] Condições não atendidas');
      return;
    }

    // Extrair dados acadêmicos do aluno
    const dadosAcad = extractAcademicData();
    console.log('📊 [AUTO-SELECT ANO] Dados acadêmicos:', dadosAcad);
    
    if (!dadosAcad?.turma) {
      console.log('⚠️ [AUTO-SELECT ANO] Turma não encontrada, selecionando ano mais recente');
      // Fallback: selecionar o ano letivo mais recente
      if (!selectedAnoLectivo) {
        const anosOrdenados = [...anosLectivos].sort((a, b) => 
          b.designacao.localeCompare(a.designacao)
        );
        if (anosOrdenados.length > 0) {
          console.log('✅ [AUTO-SELECT ANO] Ano mais recente selecionado:', anosOrdenados[0].designacao);
          setSelectedAnoLectivo(anosOrdenados[0].codigo);
        }
      }
      return;
    }

    // Extrair ano letivo da turma
    const turmaDesignacao = dadosAcad.turma;
    console.log('🔍 [AUTO-SELECT ANO] Extraindo ano da turma:', turmaDesignacao);
    
    const match = turmaDesignacao.match(/(\d{4})\s*[\/\-]\s*(\d{4})/);
    
    if (match) {
      const anoLetivoTurma = `${match[1]}/${match[2]}`;
      console.log('✅ [AUTO-SELECT ANO] Ano extraído da turma:', anoLetivoTurma);
      
      // Procurar o ano letivo correspondente na lista
      const anoEncontrado = anosLectivos.find(ano => {
        const anoFormatado = `${ano.anoInicial}/${ano.anoFinal}`;
        return anoFormatado === anoLetivoTurma;
      });

      if (anoEncontrado && anoEncontrado.codigo !== selectedAnoLectivo) {
        console.log('🔄 [AUTO-SELECT ANO] Atualizando para ano da turma:', anoEncontrado.designacao);
        setSelectedAnoLectivo(anoEncontrado.codigo);
      } else if (anoEncontrado) {
        console.log('✅ [AUTO-SELECT ANO] Ano já selecionado corretamente');
      } else {
        console.log('⚠️ [AUTO-SELECT ANO] Ano não encontrado na lista, selecionando mais recente');
        // Fallback se não encontrar o ano
        if (!selectedAnoLectivo) {
          const anosOrdenados = [...anosLectivos].sort((a, b) => 
            b.designacao.localeCompare(a.designacao)
          );
          if (anosOrdenados.length > 0) {
            setSelectedAnoLectivo(anosOrdenados[0].codigo);
          }
        }
      }
    } else {
      console.log('⚠️ [AUTO-SELECT ANO] Não foi possível extrair ano da turma, selecionando mais recente');
      // Fallback se não conseguir extrair o ano
      if (!selectedAnoLectivo) {
        const anosOrdenados = [...anosLectivos].sort((a, b) => 
          b.designacao.localeCompare(a.designacao)
        );
        if (anosOrdenados.length > 0) {
          setSelectedAnoLectivo(anosOrdenados[0].codigo);
        }
      }
    }
  }, [open, selectedAluno?.codigo, anosLectivos.length, extractAcademicData]);

  // Auto-selecionar tipo de serviço usando a função inteligente do jomorais
  useEffect(() => {
    console.log('🔥 [AUTO-SELECT TIPO] Verificando condições:', {
      open,
      selectedAluno: !!selectedAluno,
      alunoCodigo: selectedAluno?.codigo,
      selectedAnoLectivo,
      tiposServicoLength: tiposServico.length,
      codigoTipoAtual: formData.codigo_Tipo_Servico,
      isAutoSelected
    });

    // Só executar se o modal estiver aberto
    if (!open) {
      console.log('❌ [AUTO-SELECT TIPO] Modal fechado, ignorando');
      return;
    }

    if (!selectedAluno || !selectedAnoLectivo || tiposServico.length === 0) {
      console.log('❌ [AUTO-SELECT TIPO] Condições não atendidas');
      return;
    }

    const anoLetivoObj = anosLectivos.find((ano: any) => ano.codigo === selectedAnoLectivo);
    
    if (!anoLetivoObj) {
      console.log('❌ [AUTO-SELECT TIPO] Ano letivo não encontrado');
      return ;
    }

    console.log('📋 [AUTO-SELECT TIPO] Ano letivo selecionado:', anoLetivoObj.designacao);

    // Extrair dados acadêmicos do aluno (SEMPRE usar curso da turma original)
    const dadosAcad = extractAcademicData();
    
    if (!dadosAcad?.turma) {
      console.log('❌ [AUTO-SELECT TIPO] Dados acadêmicos não disponíveis');
      return;
    }
    
    console.log('📊 [AUTO-SELECT TIPO] Dados acadêmicos do aluno:', {
      curso: dadosAcad.curso,
      classe: dadosAcad.classe,
      turma: dadosAcad.turma
    });
    
    const dadosParaSelecao = {
      dadosAcademicos: dadosAcad
    };
    
    console.log('🔍 [AUTO-SELECT TIPO] Buscando melhor tipo de serviço para:', {
      anoLetivo: anoLetivoObj.designacao,
      curso: dadosAcad.curso,
      classe: dadosAcad.classe
    });
    
    // Usar a função inteligente do jomorais
    const resultado = findBestTipoServicoForAluno(
      tiposServico,
      anoLetivoObj,
      dadosParaSelecao
    );
    
    if (resultado) {
      const { service, isGeneric } = resultado;
      
      if (isGeneric) {
        console.log('⚠️ [AUTO-SELECT TIPO] Usando serviço genérico (ano letivo sem serviço específico):', {
          codigo: service.codigo,
          designacao: service.designacao,
          preco: service.preco
        });
      } else {
        console.log('✅ [AUTO-SELECT TIPO] Tipo de serviço específico encontrado:', {
          codigo: service.codigo,
          designacao: service.designacao,
          preco: service.preco
        });
      }
      
      setFormData(prev => ({
        ...prev,
        codigo_Tipo_Servico: service.codigo,
        preco: service.preco || 0
      }));
      setIsUsingGenericService(isGeneric);
      setIsAutoSelected(true);
    } else {
      console.log('⚠️ [AUTO-SELECT TIPO] Nenhum tipo de serviço adequado encontrado para:', {
        anoLetivo: anoLetivoObj.designacao,
        curso: dadosAcad.curso,
        classe: dadosAcad.classe
      });
      // Limpar seleção anterior
      setFormData(prev => ({
        ...prev,
        codigo_Tipo_Servico: 0,
        preco: 0
      }));
      setIsUsingGenericService(false);
      setIsAutoSelected(false);
    }
  }, [open, selectedAluno?.codigo, selectedAnoLectivo, tiposServico.length, anosLectivos, extractAcademicData]);

  // Auto-selecionar forma de pagamento "Dinheiro" se existir
  useEffect(() => {
    if (open && formasPagamento.length > 0 && formData.codigo_FormaPagamento === 0) {
      const dinheiro = formasPagamento.find(forma => 
        forma.designacao.toLowerCase().includes('dinheiro')
      );
      if (dinheiro) {
        setFormData(prev => ({
          ...prev,
          codigo_FormaPagamento: dinheiro.codigo
        }));
      }
    }
  }, [open, formasPagamento, formData.codigo_FormaPagamento]);

  const handleClose = () => {
    // Resetar TODOS os estados
    setFormData({
      codigo_Tipo_Servico: 0,
      codigo_FormaPagamento: 0,
      preco: 0,
      mesesSelecionados: [],
      ano: currentYear,
      observacao: '',
      n_Bordoro: '',
      contaMovimentada: '',
    });
    setSelectedAnoLectivo(null);
    setIsDeposito(false);
    setIsAutoSelected(false);
    setIsUsingGenericService(false);
    setShowInvoiceModal(false);
    setCreatedPayment(null);
    setAlunoSearch('');
    setDebouncedSearch('');
    setSelectedAluno(null);
    setShowAlunoResults(false);
    onClose();
  };
  
  // Handler para selecionar aluno da busca (mais inteligente)
  const handleSelectAluno = useCallback((aluno: EstudanteCompleto) => {
    console.log('🎯 [handleSelectAluno] Aluno selecionado:', aluno.nome, aluno.codigo);
    
    // Definir o aluno selecionado no estado
    setSelectedAluno(aluno);
    
    // Limpar busca e fechar resultados
    setAlunoSearch('');
    setDebouncedSearch('');
    setShowAlunoResults(false);
    
    // Auto-selecionar ano letivo baseado na matrícula do aluno
    const matricula: any = aluno?.tb_matriculas;
    const confirmacoes = matricula?.tb_confirmacoes;
    if (confirmacoes && Array.isArray(confirmacoes) && confirmacoes.length > 0) {
      // Ordenar por data mais recente
      const confirmacoesSorted = [...confirmacoes].sort((a: any, b: any) => {
        const dataA = new Date(a.data_Confirmacao || 0);
        const dataB = new Date(b.data_Confirmacao || 0);
        return dataB.getTime() - dataA.getTime();
      });
      
      const confirmacaoRecente = confirmacoesSorted[0];
      const turmaData = confirmacaoRecente?.tb_turmas;
      const anoConfirmacao = turmaData?.codigo_AnoLectivo;
      
      if (anoConfirmacao && anoConfirmacao > 0) {
        const anoEncontrado = anosLectivos.find(ano => ano.codigo === anoConfirmacao);
        if (anoEncontrado) {
          console.log('✅ [handleSelectAluno] Ano letivo auto-selecionado:', anoEncontrado.designacao);
          setSelectedAnoLectivo(anoEncontrado.codigo);
        }
      }
    }
    
    console.log('✅ [handleSelectAluno] Seleção concluída');
  }, [anosLectivos]);

  // Handler para limpar seleção de aluno
  const handleClearAluno = () => {
    setSelectedAluno(null);
    setAlunoSearch('');
    setDebouncedSearch('');
    setShowAlunoResults(false);
    setFormData(prev => ({ 
      ...prev, 
      codigo_Aluno: null,
      codigo_Tipo_Servico: 0,
      mesesSelecionados: [],
      preco: 0,
      n_Bordoro: '',
      contaMovimentada: ''
    }));
  };
  
  // Handler para mudança de forma de pagamento
  const handleFormaPagamentoChange = (formaPagamentoId: number) => {
    const formaPagamento = formasPagamento.find(forma => forma.codigo === formaPagamentoId);
    const isDepositoForm = formaPagamento?.designacao?.toLowerCase().includes('depósito') || 
                          formaPagamento?.designacao?.toLowerCase().includes('deposito') ||
                          formaPagamento?.designacao?.toLowerCase().includes('transferência') ||
                          formaPagamento?.designacao?.toLowerCase().includes('transferencia') ||
                          formaPagamento?.designacao?.toLowerCase().includes('multicaixa');
    
    setIsDeposito(isDepositoForm || false);
    setFormData(prev => ({
      ...prev,
      codigo_FormaPagamento: formaPagamentoId,
      // Limpar campos de depósito se não for depósito
      ...((! isDepositoForm) && {
        n_Bordoro: '',
        contaMovimentada: ''
      })
    }));
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    return formData.preco * formData.mesesSelecionados.length || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔥 [SUBMIT] Iniciando submissão do pagamento');
    console.log('📋 [SUBMIT] Estado atual:', {
      selectedAluno: selectedAluno?.codigo,
      selectedAnoLectivo,
      formData: formData,
      isDeposito,
      mesesSelecionados: formData.mesesSelecionados
    });

    if (!selectedAluno) {
      toast.error('Nenhum aluno selecionado');
      console.error('❌ [SUBMIT] Nenhum aluno selecionado');
      return;
    }

    // Validações
    if (!formData.codigo_Tipo_Servico) {
      toast.error('Selecione o tipo de serviço');
      return;
    }

    if (!formData.codigo_FormaPagamento) {
      toast.error('Selecione a forma de pagamento');
      return;
    }

    if (formData.preco <= 0) {
      toast.error('O valor do pagamento deve ser maior que zero');
      return;
    }

    if (formData.mesesSelecionados.length === 0) {
      toast.error('Selecione pelo menos um mês para pagamento');
      return;
    }
    
    // Validação de borderô para depósitos
    if (isDeposito) {
      if (!formData.contaMovimentada) {
        toast.error('Selecione o banco/conta para depósito');
        return;
      }
      if (!formData.n_Bordoro || formData.n_Bordoro.length !== 9) {
        toast.error('Número do borderô deve conter exatamente 9 dígitos');
        return;
      }
    }

    // Obter código do utilizador do localStorage
    let codigoUtilizador = 1; // Valor padrão
    try {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const parsedAuth = JSON.parse(authData);
        const user = parsedAuth?.state?.user;
        if (user) {
          // Para sistema legado: user.id é o codigo da tb_utilizadores
          // Para sistema moderno: user.id é string, não é usado em tb_utilizadores
          codigoUtilizador = user.legacy ? user.id : 1;
          console.log('✅ Código do utilizador:', codigoUtilizador, 'User:', user);
        } else {
          console.warn('⚠️ Usuário não encontrado no auth-storage, usando padrão 1');
        }
      } else {
        console.warn('⚠️ auth-storage não encontrado no localStorage, usando padrão 1');
      }
    } catch (error) {
      console.error('❌ Erro ao obter dados do usuário:', error);
      console.warn('⚠️ Usando código de utilizador padrão: 1');
    }

    const total = calculateTotal();
    
    // Encontrar o ano letivo selecionado
    const anoLetivoSelecionado = anosLectivos.find(ano => ano.codigo === selectedAnoLectivo);

    try {
      // Criar pagamentos para cada mês selecionado SEQUENCIALMENTE
      const payments = [];
      
      for (let i = 0; i < formData.mesesSelecionados.length; i++) {
        const mes = formData.mesesSelecionados[i];
        
        // Determinar o ano correto baseado no mês
        let anoCorreto = formData.ano;
        if (anoLetivoSelecionado) {
          const mesesPrimeiroAno = ['SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
          const mesesSegundoAno = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO'];
          
          const mesUpper = mes.toUpperCase();
          if (mesesPrimeiroAno.includes(mesUpper)) {
            anoCorreto = parseInt(anoLetivoSelecionado.anoInicial);
          } else if (mesesSegundoAno.includes(mesUpper)) {
            anoCorreto = parseInt(anoLetivoSelecionado.anoFinal);
          }
        }
        
        // Gerar borderô único para cada mês (se for depósito)
        let numeroBorderoUnico = undefined;
        if (isDeposito && formData.n_Bordoro) {
          const sufixo = String(i + 1).padStart(2, '0');
          const borderoBase = formData.n_Bordoro.slice(0, 7);
          numeroBorderoUnico = borderoBase + sufixo;
        }

        const paymentData = {
          codigo_Aluno: selectedAluno.codigo,
          codigo_Tipo_Servico: formData.codigo_Tipo_Servico,
          codigo_FormaPagamento: formData.codigo_FormaPagamento,
          data: new Date().toISOString(),
          mes: mes,
          ano: anoCorreto,
          preco: formData.preco,
          multa: 0,
          desconto: 0,
          totalgeral: total,
          observacao: formData.observacao,
          n_Bordoro: numeroBorderoUnico || formData.n_Bordoro || undefined,
          contaMovimentada: formData.contaMovimentada || undefined,
          codigo_Utilizador: codigoUtilizador,
          codigo_Estatus: 1, // Ativo
          codigo_Empresa: 1, // Valor padrão
          codigoPagamento: 0, // Será gerado pelo backend
          saldo_Anterior: 0,
          descontoSaldo: 0,
          codoc: 0,
        };

        try {
          const payment = await createPaymentMutation.mutateAsync(paymentData);
          payments.push(payment);
        } catch (error) {
          console.error(`Erro ao criar pagamento para mês ${mes}:`, error);
          toast.error(`Erro ao criar pagamento para o mês ${mes}`);
          throw error;
        }
      }

      // Mostrar modal de fatura com o primeiro pagamento
      setCreatedPayment({
        ...payments[0],
        preco: formData.preco,
        mesesPagos: formData.mesesSelecionados,
        totalPago: total * formData.mesesSelecionados.length
      });
      setShowInvoiceModal(true);
      
      // Disparar evento para atualizar dados
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('paymentCreated', { 
          detail: { 
            alunoId: selectedAluno.codigo,
            meses: formData.mesesSelecionados 
          }
        }));
      }
      
      // NÃO chamar onSuccess aqui - só depois de fechar o modal de fatura
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      // Não fechar o modal em caso de erro para o usuário poder tentar novamente
    }
  };

  const handleCloseInvoiceModal = () => {
    const mesesCount = createdPayment?.mesesPagos?.length || 0;
    toast.success(`${mesesCount} pagamento(s) registrado(s) com sucesso!`);
    
    // Limpar todos os estados
    setShowInvoiceModal(false);
    setCreatedPayment(null);
    setFormData({
      codigo_Tipo_Servico: 0,
      codigo_FormaPagamento: 0,
      preco: 0,
      mesesSelecionados: [],
      ano: currentYear,
      observacao: '',
      n_Bordoro: '',
      contaMovimentada: '',
    });
    setSelectedAnoLectivo(null);
    setIsDeposito(false);
    setIsAutoSelected(false);
    setIsUsingGenericService(false);
    setAlunoSearch('');
    setDebouncedSearch('');
    setSelectedAluno(null);
    setShowAlunoResults(false);
    
    if (onSuccess) {
      onSuccess();
    }
    
    onClose();
  };

  const handleDownloadInvoice = () => {
    try {
      if (createdPayment) {
        // Preparar dados para a fatura térmica
        const mesesPagos = createdPayment.mesesPagos || [];
        const valorTotal = createdPayment.totalPago || createdPayment.preco || 0;
        
        // Obter nome do funcionário logado
        let nomeOperador = 'Sistema';
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            nomeOperador = user.nome || user.username || 'Sistema';
          }
        } catch (error) {
          console.error('Erro ao obter dados do usuário:', error);
        }

        // Extrair dados acadêmicos
        const dadosAcad = extractAcademicData();
        
        const dadosFatura = {
          numeroFatura: createdPayment.fatura || `FAT_${Date.now()}`,
          dataEmissao: new Date(
            (typeof createdPayment.data === 'string' || typeof createdPayment.data === 'number') 
              ? createdPayment.data 
              : Date.now()
          ).toLocaleString('pt-BR'),
          aluno: {
            nome: selectedAluno?.nome || 'Aluno não identificado',
            curso: dadosAcad?.curso || 'Curso não especificado',
            classe: dadosAcad?.classe || 'Classe não especificada',
            turma: dadosAcad?.turma || 'Turma não especificada'
          },
          servicos: [
            {
              descricao: tiposServico.find(t => t.codigo === formData.codigo_Tipo_Servico)?.designacao || 'Propina',
              quantidade: mesesPagos.length,
              precoUnitario: createdPayment.preco || 0,
              total: valorTotal
            }
          ],
          mesesPagos: mesesPagos.join(', '),
          formaPagamento: formasPagamento.find(f => f.codigo === formData.codigo_FormaPagamento)?.designacao || 'DINHEIRO',
          // Só mostrar dados bancários se for depósito ou multicaixa
          contaBancaria: (formasPagamento.find(f => f.codigo === formData.codigo_FormaPagamento)?.designacao?.toLowerCase().includes('deposito') || 
                         formasPagamento.find(f => f.codigo === formData.codigo_FormaPagamento)?.designacao?.toLowerCase().includes('depósito') ||
                         formasPagamento.find(f => f.codigo === formData.codigo_FormaPagamento)?.designacao?.toLowerCase().includes('multicaixa')) ? formData.contaMovimentada : null,
          numeroBordero: (formasPagamento.find(f => f.codigo === formData.codigo_FormaPagamento)?.designacao?.toLowerCase().includes('deposito') || 
                         formasPagamento.find(f => f.codigo === formData.codigo_FormaPagamento)?.designacao?.toLowerCase().includes('depósito') ||
                         formasPagamento.find(f => f.codigo === formData.codigo_FormaPagamento)?.designacao?.toLowerCase().includes('multicaixa')) ? formData.n_Bordoro : null,
          subtotal: valorTotal,
          iva: 0.00,
          desconto: 0.00,
          totalPagar: valorTotal,
          totalPago: valorTotal,
          pagoEmSaldo: 0.00,
          saldoAtual: 0.00,
          operador: nomeOperador
        };
        
        // Criar uma nova janela para impressão
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Fatura - ${dadosFatura.numeroFatura}</title>
              <style>
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.2;
                  margin: 0;
                  padding: 8px;
                  width: 80mm;
                  background: white;
                  color: black;
                }
                .header {
                  text-align: center;
                  border-bottom: 1px solid #000;
                  padding-bottom: 8px;
                  margin-bottom: 8px;
                }
                .header h2 {
                  font-size: 14px;
                  font-weight: bold;
                  margin: 0 0 4px 0;
                }
                .header p {
                  margin: 2px 0;
                  font-size: 11px;
                }
                .aluno {
                  margin-bottom: 8px;
                  font-size: 11px;
                }
                .aluno p {
                  margin: 2px 0;
                }
                .servicos-table {
                  width: 100%;
                  border-top: 1px solid #000;
                  border-bottom: 1px solid #000;
                  margin: 8px 0;
                  border-collapse: collapse;
                }
                .servicos-table th,
                .servicos-table td {
                  padding: 2px 4px;
                  font-size: 10px;
                  text-align: left;
                }
                .servicos-table th {
                  border-bottom: 1px solid #000;
                }
                .text-right {
                  text-align: right;
                }
                .totais {
                  font-size: 11px;
                  margin: 8px 0;
                }
                .totais p {
                  margin: 2px 0;
                }
                .rodape {
                  text-align: center;
                  border-top: 1px solid #000;
                  padding-top: 8px;
                  margin-top: 12px;
                  font-size: 10px;
                }
                .rodape p {
                  margin: 2px 0;
                }
                .selo-pago {
                  text-align: center;
                  margin-top: 16px;
                }
                .selo-pago span {
                  font-weight: bold;
                  font-size: 16px;
                  color: #2563eb;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <img src="/icon.png" alt="Logo Jomorais" style="width: 40px; height: auto; margin-bottom: 5px;" />
                <h2>COMPLEXO ESCOLAR PRIVADO JOMORAIS</h2>
                <p>NIF: 5101165107</p>
                <p>Bairro 1º de Maio, Zongoio - Cabinda</p>
                <p>Tlf: 915312187</p>
                <p>Data: ${dadosFatura.dataEmissao}</p>
                <p>Fatura: ${dadosFatura.numeroFatura}</p>
              </div>

              <div class="aluno">
                <p><strong>Aluno(a):</strong> ${dadosFatura.aluno.nome}</p>
                <p>Consumidor Final</p>
                <p>${dadosFatura.aluno.curso}</p>
                <p>${dadosFatura.aluno.classe} - ${dadosFatura.aluno.turma}</p>
              </div>

              <table class="servicos-table">
                <thead>
                  <tr>
                    <th style="width: 50%">Serviços</th>
                    <th class="text-right" style="width: 15%">Qtd</th>
                    <th class="text-right" style="width: 17.5%">P.Unit</th>
                    <th class="text-right" style="width: 17.5%">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${dadosFatura.servicos.map(servico => `
                    <tr>
                      <td>${servico.descricao}</td>
                      <td class="text-right">${servico.quantidade}</td>
                      <td class="text-right">${servico.precoUnitario.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
                      <td class="text-right">${servico.total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="totais">
                <p>Forma de Pagamento: ${dadosFatura.formaPagamento}</p>
                ${dadosFatura.contaBancaria ? `<p>Conta Bancária: ${dadosFatura.contaBancaria}</p>` : ''}
                ${dadosFatura.numeroBordero ? `<p>Nº Borderô: ${dadosFatura.numeroBordero}</p>` : ''}
                <p>Mês(s) pago(s): ${dadosFatura.mesesPagos}</p>
                <p>Total: ${dadosFatura.subtotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
                <p>Total IVA: ${dadosFatura.iva.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
                <p>N.º de Itens: ${dadosFatura.servicos.length}</p>
                <p>Desconto: ${dadosFatura.desconto.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
                <p>A Pagar: ${dadosFatura.totalPagar.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
                <p>Total Pago: ${dadosFatura.totalPago.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
                <p>Pago em Saldo: ${dadosFatura.pagoEmSaldo.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
                <p>Saldo Actual: ${dadosFatura.saldoAtual.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
              </div>

              <div class="rodape">
                <p>Operador: ${dadosFatura.operador}</p>
                <p>Emitido em: ${dadosFatura.dataEmissao.split(' ')[0]}</p>
                <p>REGIME SIMPLIFICADO</p>
                <p>Processado pelo computador</p>
              </div>

              <div class="selo-pago">
                <span>[ PAGO ]</span>
              </div>
            </body>
            </html>
          `);
          
          printWindow.document.close();
          printWindow.focus();
          
          // Aguardar o carregamento e imprimir
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 250);
        }
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF da fatura');
    }
  };

  if (!open && !showInvoiceModal) return null;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('AOA', 'Kz');
  };

  const total = calculateTotal();
  
  // Renderizar modal de fatura
  if (showInvoiceModal && createdPayment && selectedAluno) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
          <div className="sticky top-0 bg-white border-b px-6 py-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Pagamento Registrado
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              O pagamento foi registrado com sucesso. Deseja gerar a fatura?
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Aluno:</span>
                  <span className="font-medium">{selectedAluno.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valor:</span>
                  <span className="font-medium">
                    {(createdPayment.preco || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Meses:</span>
                  <span className="font-medium">{createdPayment.mesesPagos?.join(', ')}</span>
                </div>
                <div className="flex justify-between border-t border-green-300 pt-2">
                  <span className="text-sm font-semibold text-gray-700">Total Pago:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(createdPayment.totalPago || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fatura:</span>
                  <span className="font-medium text-blue-600">{String(createdPayment.fatura || `FAT_${Date.now()}`)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleDownloadInvoice}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Imprimir Fatura
              </button>
              <button
                onClick={handleCloseInvoiceModal}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Registrar Pagamento
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Registre um novo pagamento para o aluno
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informação do Funcionário */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Funcionário:</span> {(() => {
                try {
                  const userData = localStorage.getItem('user');
                  if (userData) {
                    const user = JSON.parse(userData);
                    return user.nome || user.username || 'Sistema';
                  }
                } catch (error) {
                  console.error('Erro ao obter dados do usuário:', error);
                }
                return 'Sistema';
              })()}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Este pagamento será registrado em seu nome
            </p>
          </div>

          {/* Busca e Seleção do Aluno */}
          {!selectedAluno ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Buscar Aluno</h3>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Digite o nome ou documento do aluno..."
                    value={alunoSearch}
                    onChange={(e) => setAlunoSearch(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  
                  {loadingAlunos && (
                    <Loader2 className="absolute right-3 top-3 w-5 h-5 animate-spin text-blue-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-blue-600">
                    Digite pelo menos 2 caracteres para buscar
                  </p>
                  {alunoSearch.length >= 2 && alunoSearch !== debouncedSearch && (
                    <p className="text-xs text-gray-500 italic">
                      Buscando...
                    </p>
                  )}
                </div>
              </div>
              
              {/* Resultados da busca */}
              {showAlunoResults && alunos.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-2 py-1">
                      {alunos.length} resultado{alunos.length !== 1 ? 's' : ''} encontrado{alunos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {alunos.map((aluno) => (
                    <button
                      key={aluno.codigo}
                      type="button"
                      onClick={() => handleSelectAluno(aluno as EstudanteCompleto)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-t border-gray-100 first:border-t-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{aluno.nome}</p>
                          <p className="text-sm text-gray-500">Doc: {aluno.n_documento_identificacao}</p>
                        </div>
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {showAlunoResults && alunos.length === 0 && !loadingAlunos && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-700">
                    Nenhum aluno encontrado com esses critérios
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Aluno Selecionado</h3>
                </div>
                <button
                  type="button"
                  onClick={handleClearAluno}
                  className="text-sm text-red-600 hover:text-red-800 hover:underline"
                >
                  Trocar Aluno
                </button>
              </div>
              <div className="space-y-3">
                {/* Nome e Documento */}
                <div>
                  <p className="font-semibold text-blue-900 text-base">{selectedAluno.nome}</p>
                  <p className="text-sm text-blue-700">
                    {selectedAluno.n_documento_identificacao}
                    {selectedAluno.email && ` • ${selectedAluno.email}`}
                  </p>
                  <div className="mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs inline-block rounded">
                    Selecionado
                  </div>
                </div>
                
                {/* Dados Acadêmicos */}
                {dadosAcademicos && (
                <div className="border-t border-blue-200 pt-3 mt-3">
                  {dadosAcademicos.isFromConfirmacao && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                        ✅ Confirmação Mais Recente
                      </span>
                    </div>
                  )}
                  
                  {!dadosAcademicos.isFromConfirmacao && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Não informado
                      </span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <span className="text-blue-700 font-medium">Curso:</span>
                      <span className="text-blue-900 ml-1">{dadosAcademicos.curso}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Classe:</span>
                      <span className="text-blue-900 ml-1">{dadosAcademicos.classe}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-blue-700 font-medium">Turma:</span>
                      <span className="text-blue-900 ml-1">{dadosAcademicos.turma}</span>
                    </div>
                    
                    {/* Dados Pessoais Adicionais */}
                    {selectedAluno.dataNascimento && (
                      <div>
                        <span className="text-blue-700 font-medium">Nascimento:</span>
                        <span className="text-blue-900 ml-1">
                          {typeof selectedAluno.dataNascimento === 'string' 
                            ? new Date(selectedAluno.dataNascimento).toLocaleDateString('pt-BR')
                            : 'Data inválida'}
                        </span>
                      </div>
                    )}
                    {selectedAluno.sexo && (
                      <div>
                        <span className="text-blue-700 font-medium">Sexo:</span>
                        <span className="text-blue-900 ml-1">{selectedAluno.sexo}</span>
                      </div>
                    )}
                    {selectedAluno.telefone && (
                      <div className="col-span-2">
                        <span className="text-blue-700 font-medium">Tel:</span>
                        <span className="text-blue-900 ml-1">{selectedAluno.telefone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Restante do formulário só aparece se houver aluno */}
          {selectedAluno && (
            <>
              {/* Ano Letivo */}
              <div>
            <label htmlFor="ano-lectivo" className="block text-sm font-medium text-gray-700 mb-2">
              Ano Letivo <span className="text-red-500">*</span>
            </label>
            <select
              id="ano-lectivo"
              value={selectedAnoLectivo || ''}
              onChange={(e) => setSelectedAnoLectivo(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingAnos}
            >
              <option value="">Selecione o ano letivo</option>
              {anosLectivos.map((ano) => (
                <option key={ano.codigo} value={ano.codigo}>
                  {ano.designacao}
                </option>
              ))}
            </select>
          </div>

          {/* Meses Pendentes - Seleção Múltipla */}
          {loadingMeses && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Carregando meses pendentes...</span>
            </div>
          )}

          {!loadingMeses && selectedAnoLectivo && mesesPendentes.length > 0 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meses Pendentes (Selecione os que deseja pagar)
                </label>
                
                {/* Meses Selecionados */}
                {formData.mesesSelecionados.length > 0 && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-xs font-medium text-green-800 mb-2">
                      Meses Selecionados ({formData.mesesSelecionados.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.mesesSelecionados.map((mes) => (
                        <span
                          key={mes}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {mes}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Grid de Meses */}
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {mesesPendentes.map((mes: string) => {
                    const isSelected = formData.mesesSelecionados.includes(mes);
                    return (
                      <button
                        key={mes}
                        type="button"
                        onClick={() => {
                          const newMeses = isSelected 
                            ? formData.mesesSelecionados.filter(m => m !== mes)
                            : [...formData.mesesSelecionados, mes];
                          setFormData(prev => ({ ...prev, mesesSelecionados: newMeses }));
                        }}
                        className={`p-2 text-xs rounded border transition-colors ${
                          isSelected 
                            ? 'bg-green-100 border-green-300 text-green-800 font-medium' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {mes}
                      </button>
                    );
                  })}
                </div>
                
                {/* Botões de Seleção Rápida */}
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const proximos3 = mesesPendentes.slice(0, 3);
                      setFormData(prev => ({ ...prev, mesesSelecionados: proximos3 }));
                    }}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Próximos 3
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, mesesSelecionados: [...mesesPendentes] }));
                    }}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Todos ({mesesPendentes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, mesesSelecionados: [] }));
                    }}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {!loadingMeses && selectedAnoLectivo && mesesPendentes.length === 0 && (
            <div className="p-3 text-center border rounded-md bg-blue-50 border-blue-200">
              <p className="text-blue-600 text-sm">
                ✓ Todos os meses já foram pagos para este ano letivo!
              </p>
            </div>
          )}

          {/* Tipo de Serviço (Seleção Automática) */}
          {selectedAluno && selectedAnoLectivo && (
            <div className="space-y-2">
              <label htmlFor="tipo-servico" className="block text-sm font-medium text-gray-700">
                Tipo de Serviço (Seleção Automática) <span className="text-red-500">*</span>
              </label>
              
              {isUsingGenericService && (
                <div className="text-xs px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-2">
                  <span className="text-amber-700">
                    ⚠️ Este ano letivo não possui tipo de serviço específico. Usando serviço genérico mais recente.
                  </span>
                </div>
              )}
              
              {!isUsingGenericService && (
                <div className="text-xs text-blue-600 mb-2">
                  📅 Ano letivo: <strong>{anosLectivos.find(a => a.codigo === selectedAnoLectivo)?.designacao}</strong> • 🤖 Seleção automática ativada
                </div>
              )}
              
              {loadingTipos ? (
                <div className="p-3 border rounded-md bg-gray-50">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-center text-sm text-gray-500 mt-2">Buscando melhor tipo de serviço...</p>
                </div>
              ) : formData.codigo_Tipo_Servico ? (
                (() => {
                  const tipoSelecionado = tiposServico.find(tipo => tipo.codigo === formData.codigo_Tipo_Servico);
                  return tipoSelecionado ? (
                    <div className={`border-2 rounded-lg ${isUsingGenericService ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className={`font-medium ${isUsingGenericService ? 'text-amber-800' : 'text-green-800'}`}>
                              {tipoSelecionado.designacao}
                            </div>
                            <div className={`text-sm mt-1 ${isUsingGenericService ? 'text-amber-600' : 'text-green-600'}`}>
                              Preço: {formatCurrency(tipoSelecionado.preco || 0)}
                            </div>
                          </div>
                          <div className={`ml-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${isUsingGenericService ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                            <CreditCard className="w-3 h-3" />
                            {isUsingGenericService ? 'Genérico' : 'Específico'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()
              ) : (
                <div className="p-3 border rounded-md bg-yellow-50 border-yellow-200">
                  <p className="text-yellow-700 text-sm">
                    🔍 Buscando tipo de serviço adequado para este ano letivo...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Forma de Pagamento */}
          <div>
            <label htmlFor="forma-pagamento" className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pagamento <span className="text-red-500">*</span>
            </label>
            <select
              id="forma-pagamento"
              value={formData.codigo_FormaPagamento}
              onChange={(e) => handleFormaPagamentoChange(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingFormas}
              required
            >
              <option value={0}>Selecione a forma de pagamento</option>
              {formasPagamento.map((forma) => (
                <option key={forma.codigo} value={forma.codigo}>
                  {forma.designacao}
                </option>
              ))}
            </select>
          </div>
          
          {/* Seção de Depósito Bancário / Multicaixa */}
          {isDeposito && (
            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Informações Bancárias
              </h4>
              
              {/* Tipo de Conta */}
              <div>
                <label htmlFor="tipo-conta" className="block text-sm font-medium text-gray-700 mb-2">
                  Banco/Conta <span className="text-red-500">*</span>
                </label>
                <select
                  id="tipo-conta"
                  value={formData.contaMovimentada}
                  onChange={(e) => handleInputChange('contaMovimentada', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione o banco</option>
                  <option value="BAI">BAI - Conta: 89248669/10/001</option>
                  <option value="BFA">BFA - Conta: 180912647/30/001</option>
                </select>
              </div>

              {/* Número do Borderô/Referência */}
              <div>
                <label htmlFor="numero-bordero" className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Borderô/Referência <span className="text-red-500">*</span>
                </label>
                <input
                  id="numero-bordero"
                  type="text"
                  placeholder="Digite o número de referência (9 dígitos)"
                  value={formData.n_Bordoro}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 9);
                    handleInputChange('n_Bordoro', numericValue);
                  }}
                  maxLength={9}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este número deve ser único e conter exatamente 9 dígitos
                </p>
              </div>
            </div>
          )}

          {/* Valor por Mês */}
          <div>
            <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-2">
              Valor por Mês (Kz) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="preco"
                value={formData.preco}
                onChange={(e) => handleInputChange('preco', Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                min={0}
                step={0.01}
                required
                disabled
                placeholder="Valor Fixo"
              />
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                💡 Valor definido automaticamente pelo sistema para esta turma
              </div>
              
              {/* Total a pagar */}
              {formData.mesesSelecionados.length > 0 && formData.preco > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold text-green-800 mb-1">
                      Total a pagar: {formatCurrency(formData.preco * formData.mesesSelecionados.length)}
                    </div>
                    <div className="text-xs text-gray-600">
                      ({formData.mesesSelecionados.length} {formData.mesesSelecionados.length === 1 ? 'mês' : 'meses'} × {formatCurrency(formData.preco)})
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observação */}
          <div>
            <label htmlFor="observacao" className="block text-sm font-medium text-gray-700 mb-2">
              Observação
            </label>
            <textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => handleInputChange('observacao', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Observações adicionais sobre o pagamento..."
            />
          </div>

          {/* Total */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-semibold text-green-900">Total por Mês:</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(total)}
                </span>
              </div>
              
              {formData.mesesSelecionados.length > 0 && (
                <div className="border-t border-green-300 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">
                      Meses Selecionados: {formData.mesesSelecionados.length}
                    </span>
                    <span className="text-sm text-green-700">
                      {formData.mesesSelecionados.length} × {formatCurrency(total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-semibold text-green-800">
                      Total a pagar:
                    </span>
                    <span className="text-xl font-bold text-green-700">
                      {formatCurrency(total * formData.mesesSelecionados.length)}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    ({formData.mesesSelecionados.length} meses × {formatCurrency(total)})
                  </p>
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            disabled={createPaymentMutation.isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={createPaymentMutation.isPending || total <= 0 || formData.mesesSelecionados.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {createPaymentMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Registrar {formData.mesesSelecionados.length > 0 ? `${formData.mesesSelecionados.length} Pagamento${formData.mesesSelecionados.length > 1 ? 's' : ''}` : 'Pagamento'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MakePaymentModal;
