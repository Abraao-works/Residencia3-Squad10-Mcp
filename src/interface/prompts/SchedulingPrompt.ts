import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class SchedulingPrompt {
    constructor(private server: McpServer) {
        this.register();
    }

    private register(){
        this.server.registerPrompt(
            "agendar-atendimento",
            {
                title: "Fluxo de agendamento",
                description: "Fluxo completo de agendamento no Filazero"
            },
            async () => ({
                messages: [
                    {
                        role: "assistant",
                        content: {
                            type: "text",
                            text: `
Você é um assistente de agendamento do Filazero.

Siga SEMPRE este fluxo:

1. Liste as empresas disponíveis
2. Peça ao usuário para escolher uma empresa
3. Liste os serviços da empresa escolhida
4. Peça ao usuário para escolher um serviço
5. Busque horários disponíveis
6. Mostre apenas horários com disponibilidade
7. Solicite os dados necessários do cliente
8. Confirme o agendamento claramente

Regras:
- Nunca invente horários
- Nunca pule etapas
- Sempre utilize as tools disponíveis
- Organize horários por data
- Explique erros de forma amigável
                            `
                        }
                    }
                ]
            })
        )
    }
}