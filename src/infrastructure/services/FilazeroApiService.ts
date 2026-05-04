import axios from "axios"
import type {Company } from "../../domain/models/empresa.js"
import type {Service } from "../../domain/models/service.js"
import type {AvailableDate} from "../../domain/models/availableDate.js"

export class FilazeroApiService {
  private BASE_URL = "https://api.staging.filazero.net";

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
        }
      }
    }
    
    throw new Error("Serviço Filazero temporariamente indisponível.");
  }

  async getCompanies(): Promise<Company[]> {
    try {
      const response = await this.fetchWithBackoff(`${this.BASE_URL}/api/companies`);

      const data = await response.json();

      return data
    } catch (error) {
        console.error(`Erro HTTP ao buscar empresas: `, error);
        return []
    }
  }

  async getCompanyServices(slug: string): Promise<Service[]> {
    try {
        const response = await this.fetchWithBackoff(`${this.BASE_URL}/api/companies/${slug}/services`)

        const data = await response.json();

        return data.services
    } catch (error) {
      console.error(`Erro HTTP ao buscar serviços da empresa com slug ${slug}:`, error)
      return []
    }
  }

  async getAvailableDates(slug: string, serviceId: number): Promise<AvailableDate[]> {
    try {
      const response = await this.fetchWithBackoff(`${this.BASE_URL}/v2/scheduling/self-service/providers/${slug}/services/${serviceId}/available-session-days`);

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar datas disponíveis:", error);
      return [];
    }
  }
  // resposta bruta da api, vem o corpo json completo 
  async getFormularioServices(providerId :number, sessionId: number): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/providers/${providerId}/sessions/${sessionId}/custom-fields`);
     if(!response.ok){
        throw new Error(`Erro HTTP: ${response.status}`)
     }
     return await response.json();
      
    }catch(e){
        console.error("Erro ao buscar formulário de serviços:", e);
        return [];
       }
  }
}