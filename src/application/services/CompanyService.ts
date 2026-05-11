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


  //tool para o locationID
  async getBusinessUnits(slug: string): Promise<string> {
    try {
      const units = await this.apiService.getBusinessUnits(slug);

      if (!units || !units.length) {
        return "Nenhuma unidade de atendimento encontrada para essa empresa.";
      }

      let response = "Unidades disponíveis:\n\n";

      units.forEach((u) => {
        response += `- ${u.name} (id: ${u.id}) - ${u.city}\n`;
      });

      return response;
    } catch (error) {
      console.error("Erro ao buscar unidades:", error);
      return "Erro ao buscar unidades de atendimento.";
    }
  }

  async getAvailableSessions(
  slug: string,
  service: number, // ID do serviço
  locationId: number,
  date: string
): Promise<string> {
  try {
    //chamar a API para obter as sessões disponíveis
    const data = await this.apiService.getAvailableSessions(slug, service, locationId);

    if (!data) {
      return "não foi possivel obter dados de sessões";
    }

    const ressources = data.resources || [];
    const sessions = data.sessions || [];

    //normaliza data para comparação
    const normalizedDate = new Date(date).toLocaleDateString("sv-SE");

    //filtra sessões pela data escolhida
    const filteredSessions = sessions.filter((s: any) => {
      const sessionDate = new Date(s.date).toLocaleDateString("sv-SE");
      return sessionDate === normalizedDate;
    });

    let response = "";

    //profissionais
    response += "Profissionais disponíveis:\n\n";
    if (!ressources.length) {
      response += "Nenhum profissional disponível;\n\n";
    } else {
      ressources.forEach((r: any) => {
        response += `- ${r.name} (id: ${r.id})\n`;
      });
      response += "\n";
    }

    //horários
    response += "Horários disponíveis:\n\n";
    //caso 1: sem sessões no geral
    if (!sessions.length) {
      response += 
      "Foram encontrados profissionais para este serviço, porém não há horários disponíveis para a data selecionada.\n\n" +
        "Isso pode ocorrer porque:\n" +
        "- não há agenda configurada no ambiente de teste\n" +
        "- ou não existem horários liberados para este dia\n\n" +
        "Sugestão:\n" +
        "- tente outra data com disponibilidade\n" +
        "- ou consulte os dias disponíveis usando a ferramenta get_available_dates";

      return response;
    }
    // caso 2: tem sessões, mas não nessa data
    if (!filteredSessions.length) {
      response +=
        "Não há horários disponíveis para a data selecionada.\n\n" +
        "Sugestão:\n" +
        "- tente outra data com vagas disponíveis\n" +
        "- utilize a ferramenta get_available_dates para consultar os dias disponíveis";

      return response;
    }
    // caso 3: sucesso
    filteredSessions.forEach((s: any) => {
      const time = new Date(s.date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      response += `- ${time}\n`;
    });

    return response;

  } catch (error) {
    //erro controlado
    return (
      "Erro ao buscar sessões disponíveis.\n\n" +
      "Possíveis causas:\n" +
      "- instabilidade na API\n" +
      "- parâmetros inválidos\n\n" +
      "Tente novamente ou escolha outra data."
    );
  }
}

}