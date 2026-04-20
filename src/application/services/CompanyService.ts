import { FilazeroApiService } from "../../infrastructure/services/FilazeroApiService.js";
import type { Company } from "../../domain/models/empresa.js";

export class CompanyService {
  constructor(private apiService: FilazeroApiService) {}

  async listCompanies(): Promise<Company[]> {
    try {
      const data = await this.apiService.getCompanies();

      if (!data || !data.length) {
        throw new Error("Nenhuma empresa encontrada.");
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar empresas: ", error)
      return []
    }
  }

  async getCompanyServices(slug: string): Promise<string> {
    try {
      const services = await this.apiService.getCompanyServices(slug)

      if (!services || !services.length) {
        throw new Error(`Nenhum serviço encontrado para a empresa ${slug}`)
      }

      return services.map((s) => `- ${s.name} (id: ${s.id}) \n Descrição: ${s.description}`).join("\n")


    } catch (error) {
      console.error(`Erro ao buscar serviços da empresa ${slug}`)
      return `Erro ao buscar serviços da empresa ${slug}`
    }
  }
}