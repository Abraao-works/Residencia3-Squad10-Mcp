import axios from "axios"
import type {Company } from "../../domain/models/empresa.js"
import type {Service } from "../../domain/models/service.js"
import type {AvailableDate} from "../../domain/models/availableDate.js"
import { handleCustomErrors } from "../exceptions/errorHandler.js";
import { logger } from "../logging/logger.js";

export class FilazeroApiService {
private BASE_URL = process.env.FILAZERO_API_URL || "https://api.staging.filazero.net";

  // Verificar erros de negócio na resposta
  checkApiErrors(response: { messages?: { type: string; description: string }[] }): void {
    const error = response.messages?.find(m => m.type === 'ERROR');
    if (error) {
      throw new Error(error.description);
    }
}

  private getHeaders() {
  return {
    Accept: "application/json, text/plain, */*",
    Origin: "https://app.filazero.net",
    Referer: "https://app.filazero.net/",
    "User-Agent": "MCP-Server-FilaZero/1.0",
    DNT: "1",
  };
  }

  // Para requisições POST
  private getWriteHeaders(token?: string) {
  return {
    ...this.getHeaders(),
    "Content-Type": "application/json;charset=UTF-8",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  }

  // Em cenario de Conexão Recusada tenta 3 vezes com backoff exponencial
  private async fetchWithBackoff(url: string): Promise<Response> {
    let delay = 1000;
    const MAX_RETRIES = 3;

    // Regra 2 Content-Type com charset UTF-8
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://app.filazero.net",
        "Referer": "https://app.filazero.net/",
        "User-Agent": "MCP-Server-FilaZero/1.0",
        "DNT": "1",
      },
    };

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        return response;
      } catch (error) {
        if (attempt < MAX_RETRIES) {
           await new Promise((resolve) => setTimeout(resolve, delay)); // Espera antes de tentar novamente
           delay *= 2;
           console.warn(`Tentando novamente... (tentativa ${attempt + 1})`);
        }else{
          throw error; 
        }
      }

    }
    
    throw new Error("Serviço Filazero temporariamente indisponível.");
  }

  async getCompanies(): Promise<Company[]> {
    try {
      const response = await this.fetchWithBackoff(`${this.BASE_URL}/api/companies`);

      const data = await response.json();
      this.checkApiErrors(data);

      return data
    } catch (error) {
      logger.error({
        err: error,
        url: `${this.BASE_URL}/api/companies`
      }, "Erro HTTP ao buscar empresas");
  
        throw error;
    }
  }

  async getCompanyServices(slug: string): Promise<Service[]> {
    try {
        const response = await this.fetchWithBackoff(`${this.BASE_URL}/api/companies/${slug}/services`)

        const data = await response.json();
        this.checkApiErrors(data);

        return data.services
    } catch (error) {
      console.error(`Erro HTTP ao buscar serviços da empresa com slug ${slug}:`, error)
      return []
    }
  }

  async getAvailableDates(slug: string, serviceId: number): Promise<AvailableDate[]> {
    try {
      const response = await this.fetchWithBackoff(`${this.BASE_URL}/v2/scheduling/self-service/providers/${slug}/services/${serviceId}/available-session-days`);
      const data = await response.json();
      this.checkApiErrors(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar datas disponíveis:", error);
      return [];
    }
  }
  // resposta bruta da api, vem o corpo json completo 
  async getFormularioServices(providerId :number, sessionId: number): Promise<any> {
    try {
      const response = await this.fetchWithBackoff(`${this.BASE_URL}/api/providers/${providerId}/sessions/${sessionId}/custom-fields`);
     if(!response.ok){
        throw new Error(`Erro HTTP: ${response.status}`)
     }
     const data = await response.json();
     this.checkApiErrors(data);
     return data;
      
    }catch(e){
        console.error("Erro ao buscar formulário de serviços:", e);
        return [];
       }
  }

  async getTicketStatus(accessKey: string): Promise<{status: number, data: string} | {status: number, body: {error: string}}> {
    try {
      const response = await this.fetchWithBackoff(`${this.BASE_URL}/v2/ticketing/public/ticket?key=${accessKey}`);

      const data = await response.json();
      this.checkApiErrors(data);
      return { status: 200, data: data };
      
    } catch(e){
        console.error("Erro ao buscar status do ticket:", e);
        return handleCustomErrors(e);
       }
  }
  async getBusinessUnits(slug: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/api/companies/${slug}/business-units`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP ao buscar unidades: ${response.status}`);
      }

      const data = await response.json();
      this.checkApiErrors(data);

      return data;
    } catch (error) {
      console.error("Erro ao buscar unidades:", error);
      return [];
    }
}
 async getAvailableSessions(
  slug: string,
  serviceId: number,
  locationId: number,
  date: string
  ): Promise<any> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/v2/scheduling/self-service/providers/${slug}/locations/${locationId}/services/${serviceId}/sessions-resources-by-service?date=${date}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      this.checkApiErrors(data);

      return data;
    } catch (error) {
      console.error("Erro ao buscar sessões:", error);
      return { resources: [], sessions: [] };
    }
  }
   async scheduleAppointment(body: any, token: string) {
    try{
    return fetch(
      `${this.BASE_URL}/v2/ticketing/tickets`,
      {
        method: "POST",

        // headers obrigatórios da API
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json;charset=UTF-8', // obrigatório
          'Authorization': `Bearer ${token}`,
          'Origin': 'https://app.filazero.net',
          'Referer': 'https://app.filazero.net/',
          'User-Agent': 'MCP-Server-FilaZero/1.0',
          'DNT': '1',
        },

        body: JSON.stringify(body)
      }
    );
  }catch(e){
    return handleCustomErrors(e)
  }
}

  // Lista tickets do usuário 
  async listMyTickets(document: string) {
    try {
    const response = await fetch(
      `${this.BASE_URL}/api/tickets?document=${document}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    this.checkApiErrors(data);
    return { status: 200, body: data };
  }catch(e){
     return handleCustomErrors(e);
  }
}
}