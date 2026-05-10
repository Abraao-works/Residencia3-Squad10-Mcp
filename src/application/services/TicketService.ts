import type { FilazeroApiService } from "../../infrastructure/services/FilazeroApiService.js";

export class TicketService {
  constructor(private apiService: FilazeroApiService) {}

  async getTicketStatus(accessKey: string): Promise<string> {
    try {
      const status = await this.apiService.getTicketStatus(accessKey);
      
      if (!status) {
        throw new Error("Status do ticket não encontrado.");
      }

      return JSON.stringify(status, null, 2);
      
    } catch (error) {
      console.error("Erro ao buscar status do ticket:", error);
      throw error;
    }
  }
  
}