import axios from "axios"
import type {Company } from "../../domain/models/empresa.js"
import type {Service } from "../../domain/models/service.js"
import type {AvailableDate} from "../../domain/models/availableDate.js"

export class FilazeroApiService {
  private BASE_URL = "https://api.staging.filazero.net";

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

  async getCompanies(): Promise<Company[]> {
    const response = await fetch(`${this.BASE_URL}/api/companies`, {headers: this.getHeaders()});

    if (!response.ok) {
      throw new Error(`Erro HTTP ao buscar empresas: ${response.status}`);
    }

    const data = await response.json();

    return data
  }

  async getCompanyServices(slug: string): Promise<Service[]> {
    try {
        const response = await fetch(`${this.BASE_URL}/api/companies/${slug}/services`, {headers: this.getHeaders()})

        if (!response.ok) {
          throw new Error(`Erro HTTP ao buscar serviços da empresa com slug ${slug}: ${response.status}`);
        }

        const data = await response.json();

        return data.services
    } catch (error) {
      console.error(`Erro HTTP ao buscar serviços da empresa com slug ${slug}:`, error)

      return []
    }
  }

  async getAvailableDates(slug: string, serviceId: number): Promise<AvailableDate[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/v2/scheduling/self-service/providers/${slug}/services/${serviceId}/available-session-days`, {headers: this.getHeaders()});

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar datas disponíveis:", error);
      return [];
    }
  }
}