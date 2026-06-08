import axios from "axios";

function errorResponse(status: number, message: string) {
  return {
    status,
    body: {
      error: message
    }
  };
}

export function handleCustomErrors(error: unknown) {

  if (axios.isAxiosError(error)) {

    if (error.code === "ECONNREFUSED") {
      return errorResponse(
        503,
        "Não foi possível conectar à API Filazero. O serviço está temporariamente indisponível."
      );
    }

    if (error.code === "ENOTFOUND") {
      return errorResponse(
        503,
        "Servidor não encontrado. Verifique a conectividade ou o endereço da API."
      );
    }

    if (error.code === "ECONNRESET") {
      return errorResponse(
        503,
        "A conexão com a API foi interrompida inesperadamente."
      );
    }

    if (
      error.code === "ETIMEDOUT" ||
      error.code === "ECONNABORTED"
    ) {
      return errorResponse(
        504,
        "Tempo limite excedido. A API não respondeu em até 10 segundos."
      );
    }

    if (error.response?.status === 400) {
      return errorResponse(
        400,
        "Dados inválidos enviados para a API."
      );
    }

    if (error.response?.status === 401) {
      return errorResponse(
        401,
        "Acesso negado. Verifique suas credenciais."
      );
    }

    if (error.response?.status === 403) {
      return errorResponse(
        403,
        "Acesso proibido. Você não possui permissão para esta operação."
      );
    }

    if (error.response?.status === 404) {
      return errorResponse(
        404,
        "Recurso solicitado não encontrado."
      );
    }

    if (error.response?.status === 429) {
      return errorResponse(
        429,
        "Limite de requisições atingido. Aguarde alguns instantes antes de tentar novamente."
      );
    }

    if ([500, 502, 503].includes(error.response?.status ?? 0)) {
      return errorResponse(
        error.response!.status,
        "Erro interno no servidor. Tente novamente mais tarde."
      );
    }

    if (error.response && !error.response.data) {
      return errorResponse(
        502,
        "Resposta inesperada da API Filazero. O formato retornado não pôde ser processado."
      );
    }
  }

  const customError = error as {
    code?: string;
    type?: string;
  };

  if (customError.type === "RATE_LIMIT") {
    return errorResponse(
      429,
      "Limite de requisições atingido. Aguarde alguns instantes antes de tentar novamente."
    );
  }

  if (customError.type === "IA_INCONSISTENTE") {
    return errorResponse(
      422,
      "A resposta da IA está inconsistente ou incompleta."
    );
  }

  if (customError.type === "IA_INCOMPLETA") {
    return errorResponse(
      422,
      "A resposta da IA está incompleta."
    );
  }

  if (customError.type === "IA_ORDEM_INCORRETA") {
    return errorResponse(
      422,
      "A IA processou a solicitação em ordem incorreta."
    );
  }

  if (customError.code === "OPERATION_NOT_ALLOWED") {
    return errorResponse(
      403,
      "Operação não permitida."
    );
  }

  if (customError.type === "HIGH_LATENCY") {
    return errorResponse(
      504,
      "Latência elevada detectada."
    );
  }

  if (customError.code === "SERVICE_UNAVAILABLE") {
    return errorResponse(
      503,
      "Serviço indisponível."
    );
  }

  if (customError.type === "HIGH_LOAD") {
    return errorResponse(
      503,
      "Sistema sob alta carga."
    );
  }

  if (customError.type === "VALIDATION_ERROR") {
    return errorResponse(
      400,
      "Erro de validação no fluxo."
    );
  }

  if (customError.type === "FLOW_RATE_LIMIT") {
    return errorResponse(
      429,
      "Limite de operações deste fluxo atingido."
    );
  }

  return errorResponse(
    500,
    "Erro desconhecido. Tente novamente mais tarde."
  );
}
