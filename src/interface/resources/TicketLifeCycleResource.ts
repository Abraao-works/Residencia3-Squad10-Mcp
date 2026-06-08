import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class TicketLifecycleResource {
    constructor(private server: McpServer) {
        this.register();
    }

    private register() {
        this.server.registerResource(
            "ticket-lifecycle",
            "filazero://ticket-lifecycle",
            {
                title: "Gerenciamento e Ciclo de Vida de Tickets do Filazero",
                description: "Descrição de como emitir, listar e consultar o status de tickets no Filazero utilizando as tools corretas",
                mimeType: "text/plain",
            },
            async () => ({
                contents: [
                    {
                        uri: "filazero://ticket-lifecycle",
                        mimeType: "text/plain",
                        text: `
Esta é uma descrição das etapas de emissão e acompanhamento de um ticket de agendamento no Filazero.

IMPORTANTE:
O ticket é o comprovante do agendamento do usuário. Ele possui um código único, serviço, tipo de atendimento, um status, e as informações de data, hora e local.

1. Emissão do Ticket (Fim do fluxo de agendamento):
Tool utilizada: schedule_appointment (Requer Bearer Token)
Objetivo: Conclui o agendamento e gera o ticket.
Status Inicial: Após a emissão com sucesso, o status inicial do ticket é "Autorizado". O usuário recebe um código (ex: WSK-DY) e os dados do atendimento (se é presencial, endereço, data e hora).

2. Consultar status de um ticket específico:
Tool utilizada: check_ticket_status (Pública)
Objetivo: Permite consultar a situação atual e os detalhes de um ticket específico, caso o usuário forneça o código do ticket.

3. Listar os tickets do usuário:
Tool utilizada: list_my_tickets (Requer Bearer Token)
Objetivo: Busca e lista todos os tickets atrelados ao usuário que está logado no momento, permitindo que ele veja seus agendamentos passados ou futuros.
                        `
                    }
                ]
            })
        );
    }
}