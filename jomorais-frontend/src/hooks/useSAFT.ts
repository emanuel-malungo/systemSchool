/**
 * Hook performático para gerenciamento de exportação SAFT-AO
 * Implementa cache, debounce e otimizações de performance
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import SAFTService from '../services/saft.service';
import type { 
  ISAFTExportConfig, 
  ISAFTExportResponse,
  IExportStatistics,
  ICompanyInfo
} from '../types/saft.types';

interface UseSAFTOptions {
  autoLoadCompanyInfo?: boolean;
  cacheTimeout?: number; // ms
  enableDebounce?: boolean;
  debounceDelay?: number; // ms
}

interface UseSAFTReturn {
  // Estados
  isExporting: boolean;
  isLoadingStatistics: boolean;
  isLoadingCompanyInfo: boolean;
  exportProgress: number;
  statistics: IExportStatistics | null;
  companyInfo: ICompanyInfo | null;
  lastExport: ISAFTExportResponse | null;
  error: string | null;

  // Métodos
  exportSAFT: (config: ISAFTExportConfig) => Promise<ISAFTExportResponse>;
  validateConfig: (config: ISAFTExportConfig) => Promise<{ valid: boolean; errors: string[] }>;
  getStatistics: (startDate: string, endDate: string) => Promise<void>;
  loadCompanyInfo: () => Promise<void>;
  downloadLastExport: () => void;
  clearCache: () => void;
  reset: () => void;
}

// Cache global para evitar requisições desnecessárias
const cache = new Map<string, { data: unknown; timestamp: number }>();

export const useSAFT = (options: UseSAFTOptions = {}): UseSAFTReturn => {
  const {
    autoLoadCompanyInfo = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutos
    enableDebounce = true,
    debounceDelay = 500
  } = options;

  // Estados
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);
  const [isLoadingCompanyInfo, setIsLoadingCompanyInfo] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [statistics, setStatistics] = useState<IExportStatistics | null>(null);
  const [companyInfo, setCompanyInfo] = useState<ICompanyInfo | null>(null);
  const [lastExport, setLastExport] = useState<ISAFTExportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  /**
   * Função auxiliar para verificar cache
   */
  const getCachedData = useCallback(<T,>(key: string): T | null => {
    const cached = cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cacheTimeout;
    if (isExpired) {
      cache.delete(key);
      return null;
    }

    return cached.data as T;
  }, [cacheTimeout]);

  /**
   * Função auxiliar para salvar no cache
   */
  const setCachedData = useCallback(<T,>(key: string, data: T): void => {
    cache.set(key, { data, timestamp: Date.now() });
  }, []);

  /**
   * Carrega informações da empresa com cache
   */
  const loadCompanyInfo = useCallback(async () => {
    const cacheKey = 'saft:companyInfo';
    
    // Verificar cache primeiro
    const cached = getCachedData<ICompanyInfo>(cacheKey);
    if (cached) {
      setCompanyInfo(cached);
      return;
    }

    setIsLoadingCompanyInfo(true);
    setError(null);

    try {
      const response = await SAFTService.getCompanyInfo();
      
      if (!isUnmountedRef.current && response.data) {
        setCompanyInfo(response.data);
        setCachedData(cacheKey, response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar informações da empresa';
      if (!isUnmountedRef.current) {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (!isUnmountedRef.current) {
        setIsLoadingCompanyInfo(false);
      }
    }
  }, [getCachedData, setCachedData]);

  /**
   * Obtém estatísticas com cache e debounce
   */
  const getStatistics = useCallback(async (startDate: string, endDate: string) => {
    const cacheKey = `saft:statistics:${startDate}:${endDate}`;

    // Limpar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const executeRequest = async () => {
      // Verificar cache
      const cached = getCachedData<IExportStatistics>(cacheKey);
      if (cached) {
        setStatistics(cached);
        return;
      }

      setIsLoadingStatistics(true);
      setError(null);

      try {
        const data = await SAFTService.getExportStatistics(startDate, endDate);
        
        if (!isUnmountedRef.current) {
          setStatistics(data);
          setCachedData(cacheKey, data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
        if (!isUnmountedRef.current) {
          setError(errorMessage);
          console.error('Erro ao buscar estatísticas:', err);
        }
      } finally {
        if (!isUnmountedRef.current) {
          setIsLoadingStatistics(false);
        }
      }
    };

    // Aplicar debounce se habilitado
    if (enableDebounce) {
      debounceTimerRef.current = setTimeout(executeRequest, debounceDelay);
    } else {
      await executeRequest();
    }
  }, [enableDebounce, debounceDelay, getCachedData, setCachedData]);

  /**
   * Valida configuração antes da exportação
   */
  const validateConfig = useCallback(async (config: ISAFTExportConfig) => {
    try {
      return await SAFTService.validateExportConfig(config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao validar configuração';
      return {
        valid: false,
        errors: [errorMessage]
      };
    }
  }, []);

  /**
   * Exporta ficheiro SAFT com controle de progresso
   */
  const exportSAFT = useCallback(async (config: ISAFTExportConfig): Promise<ISAFTExportResponse> => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsExporting(true);
    setExportProgress(0);
    setError(null);

    try {
      // Simular progresso durante a exportação
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 300);

      toast.info('🔄 Iniciando exportação SAFT...', { autoClose: 2000 });

      const response = await SAFTService.exportSAFT(config);

      clearInterval(progressInterval);
      setExportProgress(100);

      if (!isUnmountedRef.current) {
        if (response.success) {
          setLastExport(response);
          toast.success('✅ Ficheiro SAFT gerado com sucesso!');
          
          // Auto-download se disponível
          if (response.downloadUrl && response.fileName) {
            SAFTService.downloadSAFTFile(response.downloadUrl, response.fileName);
          }
        } else {
          setError(response.message);
          toast.error(`❌ ${response.message}`);
        }
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar SAFT';
      
      if (!isUnmountedRef.current) {
        setError(errorMessage);
        toast.error(`❌ ${errorMessage}`);
      }

      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    } finally {
      if (!isUnmountedRef.current) {
        setIsExporting(false);
        setExportProgress(0);
      }
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Download do último export
   */
  const downloadLastExport = useCallback(() => {
    if (!lastExport?.downloadUrl || !lastExport?.fileName) {
      toast.warning('⚠️ Nenhum ficheiro disponível para download');
      return;
    }

    SAFTService.downloadSAFTFile(lastExport.downloadUrl, lastExport.fileName);
    toast.success('📥 Download iniciado');
  }, [lastExport]);

  /**
   * Limpa cache
   */
  const clearCache = useCallback(() => {
    cache.clear();
    toast.info('🗑️ Cache limpo com sucesso');
  }, []);

  /**
   * Reset completo do estado
   */
  const reset = useCallback(() => {
    setIsExporting(false);
    setIsLoadingStatistics(false);
    setIsLoadingCompanyInfo(false);
    setExportProgress(0);
    setStatistics(null);
    setLastExport(null);
    setError(null);
  }, []);

  // Auto-carregar informações da empresa
  useEffect(() => {
    if (autoLoadCompanyInfo && !companyInfo) {
      loadCompanyInfo();
    }
  }, [autoLoadCompanyInfo, companyInfo, loadCompanyInfo]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      
      // Cancelar requisições em andamento
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Limpar timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    // Estados
    isExporting,
    isLoadingStatistics,
    isLoadingCompanyInfo,
    exportProgress,
    statistics,
    companyInfo,
    lastExport,
    error,

    // Métodos
    exportSAFT,
    validateConfig,
    getStatistics,
    loadCompanyInfo,
    downloadLastExport,
    clearCache,
    reset
  };
};

export default useSAFT;
