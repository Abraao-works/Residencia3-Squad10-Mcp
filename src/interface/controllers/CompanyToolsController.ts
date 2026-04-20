import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CompanyService } from "../../application/services/CompanyService.js";

export class CompanyToolsController {
  constructor(
    private server: McpServer,
    private companyService: CompanyService
  ) {
    this.registerTools();
  }

  private registerTools(): void {
    this.registerListCompaniesToolHandler();
    this.registerGetCompanyServicesToolHandler()
    this.registerGetAvailableDatesToolHandler()
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
      "Get available dates for a service",
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
}