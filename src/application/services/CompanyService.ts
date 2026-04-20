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

  async getAvailableDates(slug: string, serviceId: number): Promise<string> {
    const dates = await this.apiService.getAvailableDates(slug, serviceId);

    if (!dates.length) {
      return "Nenhuma data disponível"
    }

    const avaiable = dates.filter((d) => d.hasSlotLeft)

    if (!avaiable.length) {
      return "Não há datas com vagas disponíveis.";
    }

    // Agrupando por dia
    const grouped: Record<string, string[]> = {}

    avaiable.forEach((d) => {
      const dateObj = new Date(d.date);

      const day = dateObj.toLocaleDateString("pt-BR");
      const time = dateObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      });

      if (!grouped[day]) {
        grouped[day] = []
      }

      grouped[day].push(time)
    })

    // Montar resposta
    let response = "Horários disponíveis:\n\n"

    for (const day in grouped) {
      response += `${day}: \n`
      grouped[day]?.forEach((time) => {
        response += `- ${time}\n`
      })
      response += "\n"
    }

    return response
  }
}