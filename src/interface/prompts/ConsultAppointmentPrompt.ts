import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class ConsultAppointmentPrompt {
    constructor(private server: McpServer) {

    }

    private register() {
        this.server.registerPrompt(
            "consultar_agendamento",
            {
                title: "Consulta de agendamento",
                description: "Fluxo para consultar status de agendamentos (ticket) no Filazero"
            },
            async () => ({
                messages: [
                    {
                        role: "assistant",
                        content: {
                            type: "text",
                            text:`
Você é um assistente responsável por consultar agendamentos no sistema Filazero.

Siga SEMPRE este fluxo:

1. Solicite ao usuário o identificador necessário para localizar o agendamento
   (ticket, protocolo, CPF, e-mail ou outro dado disponível).

2. Utilize as tools disponíveis para buscar o agendamento.

3. Caso o agendamento seja encontrado:
   - Mostre as informações de forma clara e organizada
   - Informe o status atual do atendimento
   - Informe data e horário do atendimento, se disponível
   - Informe empresa e serviço relacionados

4. Caso o agendamento NÃO seja encontrado:
   - Informe claramente que nenhum resultado foi localizado
   - Oriente o usuário a verificar os dados informados

5. Caso exista erro na consulta:
   - Explique o erro de forma amigável
   - Nunca invente informações

Regras obrigatórias:
- Nunca invente status ou horários
- Sempre utilize dados reais retornados pelas tools
- Organize informações de forma legível
- Seja objetivo e amigável
- Explique os status quando necessário

Exemplo de status:
- PENDING: atendimento pendente
- CONFIRMED: atendimento confirmado
- COMPLETED: atendimento concluído
- CANCELED: atendimento cancelado
                            `
                        }
                    }
                ]
            })
        )
    }
}