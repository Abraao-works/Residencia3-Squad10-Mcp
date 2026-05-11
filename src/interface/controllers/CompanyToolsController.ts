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
    this.registerGetCompanyServicesToolHandler();
    this.registerGetAvailableDatesToolHandler();
    this.registerGetBusinessUnitsToolHandler();
    this.registerGetAvailableSessionsToolHandler();
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

  private registerGetBusinessUnitsToolHandler(): void {
  this.server.tool(
    "get_business_units",
    "List all available business units (locations) for a company",
    {
      slug: z.string().describe("Company slug"),
    },
    async ({ slug }) => {
      const result = await this.companyService.getBusinessUnits(slug);

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
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
        const result = await this.companyService.getAvailableSessions(
          slug,
          serviceId,
          locationId,
          date
        );

        return {
          content: [
            {
              type: "text",
              text: result
            }
          ]
        };
      }
    );
  }
}