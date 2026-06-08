import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

export interface SessionContext {
    sessionId: string;
    transport: StreamableHTTPServerTransport;
    createdAt: number;
    lastAccessAt: number;
    requestCount: number;
    clientIp?: string;
    userAgent?: string;
    status: 'active' | 'closed' | 'expired';
}