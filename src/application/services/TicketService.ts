import { cache } from "../../infrastructure/cache/cache.js";
import type { FilazeroApiService } from "../../infrastructure/services/FilazeroApiService.js";

export class TicketService {
  constructor(private apiService: FilazeroApiService) {}

  async getTicketStatus(accessKey: string): Promise<string> {
    const cachekey = `ticketStatus:${accessKey}`;
    const cached = cache.get<string>(cachekey);
    if (cached) {
      return cached;
    }
    try {
      const status = await this.apiService.getTicketStatus(accessKey);
      
      if (!status.status) {
        throw new Error("Status do ticket não encontrado.");
      }

      return JSON.stringify(status.status, null, 2);
      
    } catch (error) {
      console.error("Erro ao buscar status do ticket:", error);
      throw error;
    }
  }
  
}