function errorResponse(status: number, message: string) {
  return {
    status,
    body: { error: message }
  };
}

export function handleCustomErrors(error: any) {
  // Conexão recusada / API fora do ar
  if (error.code === "ECONNREFUSED") {
    return errorResponse(503, "Não foi possível conectar à API Filazero. O serviço está temporariamente indisponível.");
  }

  // Timeout (>10s sem resposta)
  if (error.code === "ETIMEDOUT") {
    return errorResponse(504, "Tempo limite excedido. A API não respondeu em até 10 segundos.");
  }

  // HTTP 401 / 403
  if (error.response?.status === 401) {
    return errorResponse(401, "Acesso negado. Verifique suas credenciais.");
  }
  if (error.response?.status === 403) {
    return errorResponse(403, "Acesso proibido. Você não possui permissão para esta operação.");
  }

  // HTTP 429 (rate limiting)
  if (error.response?.status === 429 || error.type === "RATE_LIMIT") {
    return errorResponse(429, "Limite de requisições atingido. Aguarde alguns instantes antes de tentar novamente.");
  }

  // HTTP 500 / 502 / 503
  if ([500, 502, 503].includes(error.response?.status)) {
    return errorResponse(error.response.status, "Erro interno no servidor. Tente novamente mais tarde.");
  }

  // Resposta inesperada
  if (error.response && !error.response.data) {
    return errorResponse(502, "Resposta inesperada da API Filazero. O formato retornado não pôde ser processado.");
  }

  // Resposta inconsistente da IA
  if (error.type === "IA_INCONSISTENTE") {
    return errorResponse(200, "A resposta da IA está inconsistente ou incompleta. Reformule sua requisição.");
  }

  // Resposta incompleta (IA)
  if (error.type === "IA_INCOMPLETA") {
    return errorResponse(200, "A resposta da IA está incompleta. Reformule sua requisição ou tente novamente.");
  }

  // Ordem incorreta (IA)
  if (error.type === "IA_ORDEM_INCORRETA") {
    return errorResponse(200, "A IA processou a requisição em ordem incorreta. Ajuste o fluxo e tente novamente.");
  }

  // Operação não permitida
  if (error.code === "OPERATION_NOT_ALLOWED") {
    return errorResponse(403, "Operação não permitida. Verifique suas permissões ou credenciais.");
  }

  // Latência alta
  if (error.type === "HIGH_LATENCY") {
    return errorResponse(504, "Latência elevada detectada. O sistema demorou mais que o esperado para responder.");
  }

  // Indisponibilidade total
  if (error.code === "SERVICE_UNAVAILABLE") {
    return errorResponse(503, "Serviço indisponível. O sistema está fora do ar temporariamente.");
  }

  // Alta carga
  if (error.type === "HIGH_LOAD") {
    return errorResponse(503, "Sistema sob alta carga. Tente novamente em alguns instantes.");
  }

  // Erro de validação (Fluxo)
  if (error.type === "VALIDATION_ERROR") {
    return errorResponse(400, "Erro de validação no fluxo. Verifique os dados enviados e tente novamente.");
  }

  // Rate limit (Fluxo específico)
  if (error.type === "FLOW_RATE_LIMIT") {
    return errorResponse(429, "Limite de operações neste fluxo atingido. Aguarde antes de prosseguir.");
  }

  // Fallback genérico
  return errorResponse(500, "Erro desconhecido. Tente novamente mais tarde.");
}