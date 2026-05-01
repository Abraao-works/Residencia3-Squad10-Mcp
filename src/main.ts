import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { FilazeroApiService } from "./infrastructure/services/FilazeroApiService.js";
import { CompanyService } from "./application/services/CompanyService.js";
import { CompanyToolsController } from "./interface/controllers/CompanyToolsController.js";
import { CategoriesResource } from "./interface/resources/CategoriesResource.js";

async function main() {
  const server = new McpServer({
    name: "filazero-mcp",
    version: "1.0.0"
  });

  const apiService = new FilazeroApiService();
  const companyService = new CompanyService(apiService);

  // Registrar tools
  new CompanyToolsController(server, companyService);

  // Registra resources
  new CategoriesResource(server);


  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("MCP Server rodando...");
}

main().catch((error) => {
  console.error("Erro:", error);
});