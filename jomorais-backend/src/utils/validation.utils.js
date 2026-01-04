// ===== Utilitários para Validação =====

export const MAX_STRING = 30; // Tamanho máximo padrão para strings
export const NAME_REGEX = /^[A-Za-zÀ-ÿ\s]+$/; // Permite acentos e espaços, evita números e símbolos
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/; // Pelo menos 1 letra maiúscula, 1 minúscula e 1 número


export const handleControllerError = (res, error, defaultMessage = "Erro interno", statusCode = 500) => {
  console.error(defaultMessage, error);

  if (error.name === "ZodError" && error.errors && Array.isArray(error.errors)) {
    // Extrair mensagens específicas dos erros do Zod
    const errorMessages = error.errors.map(err => {
      const field = err.path.join('.');
      return `${field}: ${err.message}`;
    });

    return res.status(400).json({
      success: false,
      message: errorMessages.join('; '),
      errors: error.errors,
      details: error.errors.map(err => ({
        campo: err.path.join('.'),
        mensagem: err.message,
        tipo: err.code,
        valorRecebido: err.received
      }))
    });
  }

  const response = {
    success: false,
    message: error.message || defaultMessage
  };

  // Incluir detalhes se disponíveis (para AppError)
  if (error.details) {
    response.details = error.details;
  }

  res.status(error.statusCode || error.status || statusCode).json(response);
};

/**
 * Classe de erro customizado para padronizar mensagens e status HTTP.
 * Pode ser capturada por um middleware global de erros.
 */
export class AppError extends Error {
  /**
   * 
   * @param {string} message Mensagem de erro a ser exibida
   * @param {number} statusCode Código HTTP (ex.: 400, 401, 404, 500)
   * @param {string|object} [code] Código interno opcional para logs/diagnósticos ou objeto com detalhes
   * @param {object} [details] Detalhes adicionais do erro (opcional)
   */
  constructor(message, statusCode = 500, code = 'APP_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    
    // Se code for um objeto, trata como details
    if (typeof code === 'object' && code !== null) {
      this.details = code;
      this.code = 'APP_ERROR';
    } else {
      this.code = code;
      this.details = details;
    }

    // Mantém a stack trace correta para debug
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}