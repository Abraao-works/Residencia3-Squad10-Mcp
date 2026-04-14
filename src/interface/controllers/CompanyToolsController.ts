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
}