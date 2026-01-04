import api from "../utils/api.utils";
import type {
  IMoedaListResponse,
  IMoedaResponse,
  IMoedaInput,
  ICategoriaServicoListResponse,
  ICategoriaServicoResponse,
  ICategoriaServicoInput,
  ITipoServicoListResponse,
  ITipoServicoResponse,
  ITipoServicoInput,
  ITipoServicoFilter,
  IRelatorioFinanceiroResponse
} from '../types/financialService.types';

class FinancialServiceService {
  // ===============================
  // MOEDAS
  // ===============================
  
  static async getMoedas(page: number = 1, limit: number = 10, search: string = ''): Promise<IMoedaListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });
      
      const response = await api.get(`/api/financial-services/moedas?${params}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar moedas:", error);
      throw error;
    }
  }

  static async getMoedaById(id: number): Promise<IMoedaResponse> {
    try {
      const response = await api.get(`/api/financial-services/moedas/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar moeda:", error);
      throw error;
    }
  }

  static async createMoeda(data: IMoedaInput): Promise<IMoedaResponse> {
    try {
      const response = await api.post('/api/financial-services/moedas', data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar moeda:", error);
      throw error;
    }
  }

  static async updateMoeda(id: number, data: IMoedaInput): Promise<IMoedaResponse> {
    try {
      const response = await api.put(`/api/financial-services/moedas/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar moeda:", error);
      throw error;
    }
  }

  static async deleteMoeda(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/api/financial-services/moedas/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir moeda:", error);
      throw error;
    }
  }

  // ===============================
  // CATEGORIAS DE SERVIÇOS
  // ===============================
  
  static async getCategorias(page: number = 1, limit: number = 10, search: string = ''): Promise<ICategoriaServicoListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });
      
      const response = await api.get(`/api/financial-services/categorias?${params}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
  }

  static async getCategoriaById(id: number): Promise<ICategoriaServicoResponse> {
    try {
      const response = await api.get(`/api/financial-services/categorias/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar categoria:", error);
      throw error;
    }
  }

  static async createCategoria(data: ICategoriaServicoInput): Promise<ICategoriaServicoResponse> {
    try {
      const response = await api.post('/api/financial-services/categorias', data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      throw error;
    }
  }

  static async updateCategoria(id: number, data: ICategoriaServicoInput): Promise<ICategoriaServicoResponse> {
    try {
      const response = await api.put(`/api/financial-services/categorias/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      throw error;
    }
  }

  static async deleteCategoria(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/api/financial-services/categorias/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      throw error;
    }
  }

  // ===============================
  // TIPOS DE SERVIÇOS (PRINCIPAL)
  // ===============================
  
  static async getTiposServicos(page: number = 1, limit: number = 10, filters?: ITipoServicoFilter): Promise<ITipoServicoListResponse> {
    try {
      console.log('🔍 getTiposServicos - Parâmetros recebidos:', { page, limit, filters });
      
      // Validar e limpar parâmetros
      const cleanParams: Record<string, string> = {
        page: Math.max(1, page).toString(),
        limit: Math.max(1, Math.min(100, limit)).toString()
      };

      // Adicionar filtros apenas se válidos
      if (filters?.search && filters.search.trim()) {
        cleanParams.search = filters.search.trim();
      }
      
      if (filters?.tipoServico && filters.tipoServico !== 'all') {
        cleanParams.tipoServico = filters.tipoServico;
      }
      
      if (filters?.status && filters.status !== 'all') {
        cleanParams.status = filters.status;
      }
      
      if (filters?.categoria && !isNaN(filters.categoria)) {
        cleanParams.categoria = filters.categoria.toString();
      }
      
      if (filters?.moeda && !isNaN(filters.moeda)) {
        cleanParams.moeda = filters.moeda.toString();
      }

      const params = new URLSearchParams(cleanParams);
      
      const url = `/api/financial-services/tipos-servicos?${params}`;
      console.log('🌐 URL da requisição:', url);
      console.log('📋 Parâmetros da URL:', Object.fromEntries(params));
      
      // Tentar primeiro sem parâmetros para testar o endpoint
      if (Object.keys(cleanParams).length === 2) { // apenas page e limit
        console.log('🧪 Testando endpoint básico primeiro...');
        try {
          const testResponse = await api.get('/api/financial-services/tipos-servicos');
          console.log('✅ Endpoint básico funciona:', testResponse.data);
        } catch (testError: unknown) {
          const testAxiosError = testError as any;
          console.log('❌ Endpoint básico falhou:', testAxiosError.response?.data);
        }
      }
      
      const response = await api.get(url);
      console.log('✅ Resposta da API:', response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as any;
      console.error("❌ Erro ao buscar tipos de serviços:", {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          params: axiosError.config?.params
        }
      });
      throw error;
    }
  }

  static async getTipoServicoById(id: number): Promise<ITipoServicoResponse> {
    try {
      const response = await api.get(`/api/financial-services/tipos-servicos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tipo de serviço:", error);
      throw error;
    }
  }

  static async createTipoServico(data: ITipoServicoInput): Promise<ITipoServicoResponse> {
    try {
      const response = await api.post('/api/financial-services/tipos-servicos', data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar tipo de serviço:", error);
      throw error;
    }
  }

  static async updateTipoServico(id: number, data: ITipoServicoInput): Promise<ITipoServicoResponse> {
    try {
      const response = await api.put(`/api/financial-services/tipos-servicos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar tipo de serviço:", error);
      throw error;
    }
  }

  static async deleteTipoServico(id: number): Promise<{ 
    success: boolean; 
    message: string;
    deleted?: {
      pagamentos: number;
      propinasClasse: number;
      servicosAluno: number;
      servicosTurma: number;
    }
  }> {
    try {
      const response = await api.delete(`/api/financial-services/tipos-servicos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir tipo de serviço:", error);
      throw error;
    }
  }

  // ===============================
  // CONSULTAS ESPECIAIS
  // ===============================
  
  static async getTiposServicosAtivos(): Promise<ITipoServicoListResponse> {
    try {
      const response = await api.get('/api/financial-services/tipos-servicos/ativos');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tipos de serviços ativos:", error);
      throw error;
    }
  }

  static async getTiposServicosComMulta(): Promise<ITipoServicoListResponse> {
    try {
      const response = await api.get('/api/financial-services/tipos-servicos/com-multa');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tipos de serviços com multa:", error);
      throw error;
    }
  }

  static async getTiposServicosPorCategoria(categoriaId: number): Promise<ITipoServicoListResponse> {
    try {
      const response = await api.get(`/api/financial-services/categorias/${categoriaId}/tipos-servicos`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tipos de serviços por categoria:", error);
      throw error;
    }
  }

  static async getTiposServicosPorMoeda(moedaId: number): Promise<ITipoServicoListResponse> {
    try {
      const response = await api.get(`/api/financial-services/moedas/${moedaId}/tipos-servicos`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tipos de serviços por moeda:", error);
      throw error;
    }
  }

  // ===============================
  // RELATÓRIOS
  // ===============================
  
  static async getRelatorioFinanceiro(): Promise<IRelatorioFinanceiroResponse> {
    try {
      const response = await api.get('/api/financial-services/relatorio');
      return response.data;
    } catch (error) {
      console.error("Erro ao gerar relatório financeiro:", error);
      throw error;
    }
  }
}

export default FinancialServiceService;
