import http, { Server } from 'node:http';
import express from 'express';
import { randomUUID } from 'node:crypto'; // ids únicos para sessões HTTP 
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { FilazeroApiService } from "./infrastructure/services/FilazeroApiService.js";
import { CompanyService } from "./application/services/CompanyService.js";
import { CompanyToolsController } from "./interface/controllers/CompanyToolsController.js";
import { CategoriesResource } from "./interface/resources/CategoriesResource.js";
import { TicketService } from "./application/services/TicketService.js";
import { SchedulingPrompt } from "./interface/prompts/SchedulingPrompt.js";
import { ConsultAppointmentPrompt } from "./interface/prompts/ConsultAppointmentPrompt.js";
import { FlowGuideResource } from "./interface/resources/FlowGuideResource.js";
import { TicketLifecycleResource } from "./interface/resources/TicketLifeCycleResource.js";
import { httpLogger } from './infrastructure/logging/httplogger.js';
import { logger } from './infrastructure/logging/logger.js';

export function createServer(): McpServer{
    const server = new McpServer({
    name: "filazero-mcp",
    version: "1.0.0"
  });

  const apiService = new FilazeroApiService();
  const companyService = new CompanyService(apiService);
  const ticketService = new TicketService(apiService);
  
  // Registrar tools
  new CompanyToolsController(server, companyService, ticketService);

  // Registrar resources
  new CategoriesResource(server);
  new FlowGuideResource(server);
  new TicketLifecycleResource(server);

  // Registrar prompts
  new SchedulingPrompt(server);

  new ConsultAppointmentPrompt(server);

  return server;
}
async function startHttp(): Promise<void> {

  const port = Number(process.env['MCP_SERVER_PORT'] ?? 3000);
  const app = express();

  app.use(httpLogger); 

  app.set('trust proxy', true); 
  app.use(express.json({limit: '10mb'})); 

  const transports = new Map<string, StreamableHTTPServerTransport>(); // armazena sessões ativas apenas na memória do container

  app.all('/mcp', async (req, res) => { // endpoint mcp 
    const sessionId = req.headers['mcp-session-id'] as string | undefined; 

    if (req.method === 'POST' && !sessionId) {
      // Nova sessão 
      const transport = new StreamableHTTPServerTransport({ 
        sessionIdGenerator: () => randomUUID(), 
      });

      const mcpServer = createServer(); 
      await mcpServer.connect(transport);

      transport.onclose = () => { 
        if (transport.sessionId) transports.delete(transport.sessionId); 
        logger.info({
          sessionId: transport.sessionId,
        }, 'Session closed and removed from active transports');
      };

      await transport.handleRequest(req, res, req.body);

      if (transport.sessionId) {
        transports.set(transport.sessionId, transport); // armazena nova sessão
      }
      return;
    }

    if (sessionId) {
      const transport = transports.get(sessionId);
      if (!transport) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      await transport.handleRequest(req, res, req.body); //processando requisição 
      return;
    }

    res.status(400).json({ error: 'Missing mcp-session-id header' });
  });

  app.get('/mcp/health', (_req, res) => { // monitoramento de saúde da aplicação
    logger.info({
      route: '/mcp/health',
    }, 'Health check endpoint called');
    res.json({ status: 'ok', server: 'filazero-mcp' });
  });

  app.get('/mcp', (_req, res) => {
    res.json({
      server: 'filazero-mcp',
      status: 'running',
  })});

  app.disable('x-powered-by'); // segurança básica, remove header do Express

  const httpServer = http.createServer(app);
  httpServer.listen(port,'0.0.0.0' ,() => {

  logger.info({
  port,
  transport: 'http',
  pid: process.pid,
}, 'MCP Server started');

  });
}

async function startStdio(): Promise<void> {
  const transport = new StdioServerTransport();
  await createServer().connect(transport);
  logger.info({
  port: 'stdio',
  transport: 'stdio',
}, 'MCP Stdio Server started');}

async function main(): Promise<void> {
  const mode = process.env['MCP_TRANSPORT'] ?? 'stdio';
  if (mode === 'http') {
    await startHttp();
  } else {
    await startStdio();
  }
}

main().catch((error) => {
  logger.error({
  err:error,
}, 'Fatal error starting MCP Server');
  process.exit(1);
});
