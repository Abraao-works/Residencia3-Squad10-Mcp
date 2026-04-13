import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const server = new McpServer({
    name: "filazero-mcp",
    version: "1.0.0"
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("MCP Server rodando...");
}

main().catch((error) => {
  console.error("Erro:", error);
});