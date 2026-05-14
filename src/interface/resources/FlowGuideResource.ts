import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class FlowGuideResource {
    constructor(private server: McpServer) {
        this.register();
    }

    private register() {
        this.server.registerResource(
            "flow-guide",
            "filazero://scheduling-flow",
            {
                title: "Descrição do fluxo de agendamento do Filazero",
                description: "Descrição detalhada da ordem de processos que compoêm o fluxo para realizar um agedamento no Filazero",
                mimeType: "text/plain",
            },
            async () => ({
                    contents: [
                        {
                            uri: "filazero://scheduling-flow",
                            mimeType: "text/plain",
                            text: `
Esta é uma descrição da ordem das etapas que deve ser seguida para realizar o fluxo de agendamento:

IMPORTANTE:
O fluxo de agendamento deve seguir obrigatoriamente a ordem abaixo.
Uma etapa depende da anterior.

1. Listar empresas: 
Tool utilizada: list_companies
Objetivo: Listar as empresas disponíveis para que seja selecionanda a que o usuário deseja

2. Listar serviços:
Tool utilizada: get_company_services
Objetivo: São listados os serviços presentes na determinada empresa selecionada pelo usuário para que ele possa escolher o serviço que desejar agendar

3. Listar datas disponíveis:
Tool utilizada: get_available_dates
Objetivo: Mostra as datas disponíveis para agendamento para aquele serviço selecionado para o usuário escolher o dia que deseja

4. Listar horários do dia: 
Tool Utilizada: get_available_dates
Objetivo: São mostrados os horários disponíveis para o dia selecionado

5. Campos do formulário:
Tool utilizada: get_formulario_services
Objetivo: São informados os campos do formulário do determinado serviço para que o usuário informe os seus dados

6. Emitir ticket: Após preencher o formulário com os dados do usuário, será emitido o ticket relativo aquele agendamento
                            `
                        }
                    ]
                }
            )
        )
    }
}