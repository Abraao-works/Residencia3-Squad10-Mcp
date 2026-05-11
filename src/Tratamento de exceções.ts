import { z } from "zod";

function badRequest(message: string) {
  return {
    status: 400,
    body: { error: message }
  };
}

const scheduleSchema = z.object({
  customerName: z.string(),
  abstractServiceId: z.number().min(1, "abstractServiceId deve ser maior que zero"),
  companyId: z.string(),
  date: z.string(),
  durationMinutes: z.number().positive()
});

export function handleScheduleRequest(req: any) {
  // 1. Requisição sem campos obrigatórios
  const requiredFieldsCheck = scheduleSchema.safeParse(req);
  if (!requiredFieldsCheck.success) {
    return badRequest(
      "Campos obrigatórios ausentes ou inválidos: customerName, abstractServiceId (>0), companyId, date, durationMinutes (>0)."
    );
  }

  // 2. Formato de data/horário inválido (ISO 8601 UTC)
  const parsedDate = new Date(req.date);
  if (isNaN(parsedDate.getTime()) || !req.date.endsWith("Z")) {
    return badRequest(
      "Formato de data inválido. Use padrão ISO 8601 em UTC (YYYY-MM-DDTHH:MM:SSZ)."
    );
  }

  // 3. Valor fora da faixa permitida
  if (req.durationMinutes <= 0 || req.durationMinutes > 480) {
    return badRequest(
      "O campo durationMinutes deve ser maior que zero e dentro da faixa permitida (até 480 minutos)."
    );
  }

  // 4. AbstractServiceId não informado ou inválido
  if (!req.abstractServiceId || req.abstractServiceId <= 0) {
    return badRequest(
      "abstractServiceId é obrigatório e deve ser maior que zero para buscar horários disponíveis."
    );
  }

  // 5. Tipos de dados incorretos
  if (typeof req.companyId !== "string" || typeof req.customerName !== "string") {
    return badRequest(
      "Tipos de dados inválidos. Verifique se companyId e customerName são strings e durationMinutes é numérico."
    );
  }

  // Se todas as validações passarem
  return {
    status: 200,
    body: {
      message: "Validação concluída com sucesso"
    }
  };
}
function errorResponse(status: number, message: string) {
  return {
    status,
    body: { error: message }
  };
}

export function handleExternalErrors(error: any) {
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
  if (error.response?.status === 429) {
    return errorResponse(429, "Limite de requisições atingido. Aguarde alguns instantes antes de tentar novamente.");
  }

  // HTTP 500 / 502 / 503
  if ([500, 502, 503].includes(error.response?.status)) {
    return errorResponse(error.response.status, "Erro interno no servidor. Tente novamente mais tarde.");
  }

  // Resposta inesperada (payload inválido)
  if (error.response && !error.response.data) {
    return errorResponse(502, "Resposta inesperada da API Filazero. O formato retornado não pôde ser processado.");
  }

  // Resposta inconsistente da IA
  if (error.type === "IA_INCONSISTENTE") {
    return errorResponse(200, "A resposta da IA está inconsistente ou incompleta. Por favor, reformule sua requisição.");
  }

  // Fallback genérico
  return errorResponse(500, "Erro desconhecido. Tente novamente mais tarde.");
}