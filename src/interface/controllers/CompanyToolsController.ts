import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CompanyService } from "../../application/services/CompanyService.js"
import {getFormularioService} from "../../application/services/formularioService.js";
import { TicketService } from "../../application/services/TicketService.js";

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
    this.registerGetAvailableDatesToolHandler();
    this.registerGetFormularioToolHandler();
    this.registerGetTicketStatusToolHandler();
  }

  private registerGetCompanyServicesToolHandler(): void {
    this.server.tool(
      "get_company_services",
      "List all avaiable services of a company from Filazero using its slug",
      {
        slug: z.string().describe("Company slug")
      },
      async ({slug}) => {
        const responseServiceText = await this.companyService.getCompanyServices(slug)

        return {
          content: [
            {
              type: "text",
              text: responseServiceText
            }
          ]
        }
      }
    )
  }

  private registerListCompaniesToolHandler(): void {
    this.server.tool(
      "list_companies",
      "List all available companies from Filazero",

      {},

      async () => {
        const companies = await this.companyService.listCompanies();

        const text = companies
          .map(
            (c) =>
              `🏢 ${c.name}\nslug: ${c.slug}\ncategoria: ${c.category}`
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text,
            },
          ],
        };
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
        const result = await this.companyService.getAvailableDates(slug, serviceId)

        return {
          content: [
            {
              type: "text",
              text: result
            }
          ]
        }
      }
    )
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
        const result = await getFormularioService(providerId, sessionId)
        const text = result.map((f: any) => `Id: ${f.id} \n Nome: ${f.name} \n Description: ${f.description}`).join("\n\n")

        return {
          content: [
            {
              type: "text",
              text: text 
            }
          ]
        }
      }
    )
  }

    private registerGetTicketStatusToolHandler(): void {
    this.server.tool(
      "get_ticket_status",
      "Get the status of a ticket using its access key",
      {
        accessKey: z.string().describe("Ticket access key"),
      },
      async ({accessKey}) => {
        const status = await this.ticketService.getTicketStatus(accessKey);
      
        return {
          content: [
            {
              type: "text",
              text: status
            }
          ]
        }
      }
    )
  }

}