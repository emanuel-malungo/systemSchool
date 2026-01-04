// controller/geographic.controller.js
import { GeographicService } from "../services/geographic.services.js";
import { handleControllerError } from "../utils/validation.utils.js";

export class GeographicController {
  // ===============================
  // NACIONALIDADES
  // ===============================

  static async getAllNacionalidades(req, res) {
    try {
      const nacionalidades = await GeographicService.getAllNacionalidades();
      
      res.json({
        success: true,
        message: "Nacionalidades obtidas com sucesso",
        data: nacionalidades,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter nacionalidades", 500);
    }
  }

  static async getNacionalidadeById(req, res) {
    try {
      const { id } = req.params;
      const nacionalidade = await GeographicService.getNacionalidadeById(id);
      
      res.json({
        success: true,
        message: "Nacionalidade obtida com sucesso",
        data: nacionalidade,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter nacionalidade", 404);
    }
  }

  // ===============================
  // ESTADO CIVIL
  // ===============================

  static async getAllEstadoCivil(req, res) {
    try {
      const estadosCivis = await GeographicService.getAllEstadoCivil();
      
      res.json({
        success: true,
        message: "Estados civis obtidos com sucesso",
        data: estadosCivis,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter estados civis", 500);
    }
  }

  static async getEstadoCivilById(req, res) {
    try {
      const { id } = req.params;
      const estadoCivil = await GeographicService.getEstadoCivilById(id);
      
      res.json({
        success: true,
        message: "Estado civil obtido com sucesso",
        data: estadoCivil,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter estado civil", 404);
    }
  }

  // ===============================
  // PROVÍNCIAS
  // ===============================

  static async getAllProvincias(req, res) {
    try {
      const provincias = await GeographicService.getAllProvincias();
      
      res.json({
        success: true,
        message: "Províncias obtidas com sucesso",
        data: provincias,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter províncias", 500);
    }
  }

  static async getProvinciaById(req, res) {
    try {
      const { id } = req.params;
      const provincia = await GeographicService.getProvinciaById(id);
      
      res.json({
        success: true,
        message: "Província obtida com sucesso",
        data: provincia,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter província", 404);
    }
  }

  // ===============================
  // MUNICÍPIOS
  // ===============================

  static async getAllMunicipios(req, res) {
    try {
      const municipios = await GeographicService.getAllMunicipios();
      
      res.json({
        success: true,
        message: "Municípios obtidos com sucesso",
        data: municipios,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter municípios", 500);
    }
  }

  static async getMunicipioById(req, res) {
    try {
      const { id } = req.params;
      const municipio = await GeographicService.getMunicipioById(id);
      
      res.json({
        success: true,
        message: "Município obtido com sucesso",
        data: municipio,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter município", 404);
    }
  }

  static async getMunicipiosByProvincia(req, res) {
    try {
      const { provinciaId } = req.params;
      const municipios = await GeographicService.getMunicipiosByProvincia(provinciaId);
      
      res.json({
        success: true,
        message: "Municípios da província obtidos com sucesso",
        data: municipios,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter municípios da província", 500);
    }
  }

  // ===============================
  // COMUNAS
  // ===============================

  static async getAllComunas(req, res) {
    try {
      const comunas = await GeographicService.getAllComunas();
      
      res.json({
        success: true,
        message: "Comunas obtidas com sucesso",
        data: comunas,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter comunas", 500);
    }
  }

  static async getComunaById(req, res) {
    try {
      const { id } = req.params;
      const comuna = await GeographicService.getComunaById(id);
      
      res.json({
        success: true,
        message: "Comuna obtida com sucesso",
        data: comuna,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter comuna", 404);
    }
  }

  static async getComunasByMunicipio(req, res) {
    try {
      const { municipioId } = req.params;
      const comunas = await GeographicService.getComunasByMunicipio(municipioId);
      
      res.json({
        success: true,
        message: "Comunas do município obtidas com sucesso",
        data: comunas,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter comunas do município", 500);
    }
  }

  // ===============================
  // OPERAÇÕES ESPECIAIS
  // ===============================

  static async getGeographicHierarchy(req, res) {
    try {
      const hierarchy = await GeographicService.getGeographicHierarchy();
      
      res.json({
        success: true,
        message: "Hierarquia geográfica obtida com sucesso",
        data: hierarchy,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter hierarquia geográfica", 500);
    }
  }

  static async searchGeographic(req, res) {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Termo de busca deve ter pelo menos 2 caracteres",
        });
      }

      const results = await GeographicService.searchByName(searchTerm.trim());
      
      res.json({
        success: true,
        message: "Busca geográfica realizada com sucesso",
        data: results,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao realizar busca geográfica", 500);
    }
  }

  // ===============================
  // CRUD PROVÍNCIAS
  // ===============================

  static async createProvincia(req, res) {
    try {
      const { designacao } = req.body;

      if (!designacao || designacao.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Designação é obrigatória",
        });
      }

      const provincia = await GeographicService.createProvincia({ designacao: designacao.trim() });
      
      res.status(201).json({
        success: true,
        message: "Província criada com sucesso",
        data: provincia,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao criar província", 400);
    }
  }

  static async updateProvincia(req, res) {
    try {
      const { id } = req.params;
      const { designacao } = req.body;

      if (!designacao || designacao.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Designação é obrigatória",
        });
      }

      const provincia = await GeographicService.updateProvincia(id, { designacao: designacao.trim() });
      
      res.json({
        success: true,
        message: "Província atualizada com sucesso",
        data: provincia,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar província", 400);
    }
  }

  static async deleteProvincia(req, res) {
    try {
      const { id } = req.params;
      const result = await GeographicService.deleteProvincia(id);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao excluir província", 400);
    }
  }

  // ===============================
  // CRUD MUNICÍPIOS
  // ===============================

  static async createMunicipio(req, res) {
    try {
      const { designacao, codigo_Provincia } = req.body;

      if (!designacao || designacao.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Designação é obrigatória",
        });
      }

      if (!codigo_Provincia) {
        return res.status(400).json({
          success: false,
          message: "Código da província é obrigatório",
        });
      }

      const municipio = await GeographicService.createMunicipio({ 
        designacao: designacao.trim(), 
        codigo_Provincia 
      });
      
      res.status(201).json({
        success: true,
        message: "Município criado com sucesso",
        data: municipio,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao criar município", 400);
    }
  }

  static async updateMunicipio(req, res) {
    try {
      const { id } = req.params;
      const { designacao, codigo_Provincia } = req.body;

      if (!designacao || designacao.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Designação é obrigatória",
        });
      }

      const municipio = await GeographicService.updateMunicipio(id, { 
        designacao: designacao.trim(),
        ...(codigo_Provincia && { codigo_Provincia })
      });
      
      res.json({
        success: true,
        message: "Município atualizado com sucesso",
        data: municipio,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar município", 400);
    }
  }

  static async deleteMunicipio(req, res) {
    try {
      const { id } = req.params;
      const result = await GeographicService.deleteMunicipio(id);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao excluir município", 400);
    }
  }

  // ===============================
  // CRUD COMUNAS
  // ===============================

  static async createComuna(req, res) {
    try {
      const { designacao, codigo_Municipio } = req.body;

      if (!designacao || designacao.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Designação é obrigatória",
        });
      }

      if (!codigo_Municipio) {
        return res.status(400).json({
          success: false,
          message: "Código do município é obrigatório",
        });
      }

      const comuna = await GeographicService.createComuna({ 
        designacao: designacao.trim(), 
        codigo_Municipio 
      });
      
      res.status(201).json({
        success: true,
        message: "Comuna criada com sucesso",
        data: comuna,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao criar comuna", 400);
    }
  }

  static async updateComuna(req, res) {
    try {
      const { id } = req.params;
      const { designacao, codigo_Municipio } = req.body;

      if (!designacao || designacao.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Designação é obrigatória",
        });
      }

      const comuna = await GeographicService.updateComuna(id, { 
        designacao: designacao.trim(),
        ...(codigo_Municipio && { codigo_Municipio })
      });
      
      res.json({
        success: true,
        message: "Comuna atualizada com sucesso",
        data: comuna,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar comuna", 400);
    }
  }

  static async deleteComuna(req, res) {
    try {
      const { id } = req.params;
      const result = await GeographicService.deleteComuna(id);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao excluir comuna", 400);
    }
  }
}
