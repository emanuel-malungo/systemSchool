import api from "../utils/api.utils";

// GET https://angolaapi.herokuapp.com/api/v1/validate/bi/[bi]

// Exemplo de consulta com sucesso

// GET https://angolaapi.herokuapp.com/api/v1/validate/bi/006151112LA041
// Status: 200
// {
//   "message": "This is an Angola valid bi number"
// }
// Exemplo de consulta com erro

// // GET https://angolaapi.herokuapp.com/api/v1/validate/bi/006151112LA04A
// // Status: 400
// {
//   "message": "Invalid bi number"
// }

// https://consulta.edgarsingui.ao/consultar/${BI}/bilhete

class BIService {
    static async validateBI(bi: string) {
        try {
            const response = await api.get(`/validate/bi/${bi}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async fetchBIDetails(bi: string) {
        try {
            const response = await api.get(`https://consulta.edgarsingui.ao/consultar/${bi}/bilhete`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default BIService;