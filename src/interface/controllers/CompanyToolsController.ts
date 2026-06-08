import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CompanyService } from "../../application/services/CompanyService.js"
import {getFormularioService} from "../../application/services/formularioService.js";
import { TicketService } from "../../application/services/TicketService.js";
import { executeTool } from "../../infrastructure/logging/toollogger.js";

export class CompanyToolsController {
  constructor(
    private server: McpServer,
    private companyService: CompanyService,
    private ticketService: TicketService
  ) {
    this.registerTools();
  }

  private registerTools(): void {
    this.registerListCompaniesToolHandler();
    this.registerGetCompanyServicesToolHandler();
    this.registerGetBusinessUnitsToolHandler();
    this.registerGetAvailableDatesToolHandler();
    this.registerGetAvailableSessionsToolHandler();
    this.registerGetFormularioToolHandler();
    this.registerScheduleAppointmentToolHandler();
    this.registerGetTicketStatusToolHandler();
    this.registerListMyTicketsToolHandler();
  }

  private registerGetCompanyServicesToolHandler(): void {
    this.server.tool(
      "get_company_services",
      "List all avaiable services of a company from Filazero using its slug",
      {
        slug: z.string().describe("Company slug")
      },
      async ({slug}) => {
        try {
          const services = await executeTool("get_company_services", { slug }, async () => {
            return await this.companyService.getCompanyServices(slug);
          });
          return {
            content: [{ type: "text", text: JSON.stringify({ services }) }]
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message }) }]
          };
        }
      }
    );
  }

  private registerListCompaniesToolHandler(): void {
    this.server.tool(
      "list_companies",
      "List all available companies from Filazero",

      {},

      async () => {

      try{

        const companies = await executeTool("list_companies",{},
           async () => {

          return await this.companyService.listCompanies();
        });

        return {
          content: [{ type: "text", text: JSON.stringify({ companies }) }],
        };

      }catch(error: any){
        return {
          content: [{ type: "text", text: JSON.stringify({ error: error.message }) }]
        };
      }
      }
    );
  }

  private registerGetAvailableDatesToolHandler(): void {
    this.server.tool(
      "get_available_dates",
      "Get available dates for a service. Usa o ID do serviço (usar o campo 'id' retornado pela ferramenta get_company_services, NÃO usar abstractServiceId)",
      {
        slug: z.string().describe("Company slug"),
        serviceId: z.number().describe("Service ID"),
      },
      async ({slug, serviceId}) => {

        try {

          const result = await executeTool("get_available_dates", { slug, serviceId }, async () => {

            return await this.companyService.getAvailableDates(slug, serviceId);
          });

          return {
            content: [{ type: "text", text: JSON.stringify(result) }]
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message }) }]
          };
        }
      }
    );
  }

  private registerGetFormularioToolHandler(): void {
  this.server.tool(
      "get_formulario_services",
      "Get formulario for a service",
      {
        providerId: z.number().describe("Provider ID"),
        sessionId: z.number().describe("Session ID")
      },
      async ({providerId, sessionId}) => {
       try {
       const result = await executeTool("get_formulario_services", { providerId, sessionId }, async () => {
             return await getFormularioService(providerId, sessionId);
          });
          return {
            content: [{ type: "text", text: JSON.stringify({ formulario: result }) }]
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message }) }]
          };
        }
      }
    );
  }

    private registerGetTicketStatusToolHandler(): void {
    this.server.tool(
      "get_ticket_status",
      "Get the status of a ticket using its access key",
      {
        accessKey: z.string().describe("Ticket access key"),
      },
      async ({accessKey}) => {
        try {
          const status = await executeTool("get_ticket_status", { accessKey }, async () => {
            return await this.ticketService.getTicketStatus(accessKey);
          });
          return {
            content: [{ type: "text", text: status }]
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message }) }]
          };
        }
      }
    );
  }

  private registerGetBusinessUnitsToolHandler(): void {
    this.server.tool(
      "get_business_units",
      "List all available business units (locations) for a company",
      {
        slug: z.string().describe("Company slug"),
      },
      async ({ slug }) => {
        try {
          const result = await executeTool("get_business_units", { slug }, async () => {
            return await this.companyService.getBusinessUnits(slug);
          });
          return {
            content: [{ type: "text", text: JSON.stringify({ businessUnits: result})}],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message }) }]
          };
        }
      }
    );
  }

  private registerGetAvailableSessionsToolHandler(): void {
    this.server.tool(
      "get_available_sessions",
      "Get available sessions and professionals for a specific date, service and location",
      {
        slug: z.string().describe("Company slug"),
        serviceId: z.number().describe("Service ID (use abstractServiceId when available)"),
        locationId: z.number().describe("Business unit / location ID"),
        date: z.string().describe("Selected date (ISO format or yyyy-mm-dd)")
      },
      async ({ slug, serviceId, locationId, date }) => {
        try {
          const result = await executeTool("get_available_sessions", { slug, serviceId, locationId, date }, async () => {
            return await this.companyService.getAvailableSessions(slug, serviceId, locationId, date);
          });
          return {
            content: [{ type: "text", text: JSON.stringify(result) }]
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message }) }]
          };
        }
      }
    );
  }


  private registerScheduleAppointmentToolHandler(): void {
    this.server.tool(
      "schedule_appointment",
      "Realiza o agendamento e cria um ticket",
      {
        body: z.object({
          companyId: z.number().optional(),
          serviceId: z.number(),
          locationId: z.number(),
          date: z.string(),
          time: z.string(),
          customerName: z.string(),
          customerPhone: z.string(),
        }).describe("Dados do agendamento"),
        token: z.string().describe("Bearer token do usuário"),
      },
      async ({ body, token }) => {
        try {
          const result = await executeTool("schedule_appointment", { body, token }, async () => {
            return await this.companyService.scheduleAppointment(body, token);
          });
          // retorno simplificado
          return {
            content: [
              {
                type: "text",
                text: `Agendamento realizado com sucesso. Ticket: ${result.ticketId || "N/A"}`,
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              { type: "text", text: `Erro ao agendar: ${error.message}` },
            ],
          };
        }
      }
    );
  }

  private registerListMyTicketsToolHandler(): void {
    this.server.tool(
      "list_my_tickets",
      "Lista os agendamentos de um cliente",

      {
        document: z.string().describe("CPF do cliente"),
      },

      async ({ document }) => {
        try {
          const tickets = await executeTool("list_my_tickets", { document }, async () => {
            return await this.companyService.listMyTickets(document);
          });
          return {
            content: [{ type: "text", text: JSON.stringify({ tickets }) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: `Erro ao buscar agendamentos: ${error.message}` }) }],
          };
        }
      }
    );
  }


}