import { FilazeroApiService } from "../../infrastructure/services/FilazeroApiService.js";
import type { Company } from "../../domain/models/empresa.js";
import { cache, TTL } from "../../infrastructure/cache/cache.js";

export class CompanyService {
  constructor(private apiService: FilazeroApiService) {}

  async listCompanies(): Promise<Company[]> {
    const cacheKey = "companies: all";

    const cached = cache.get<Company[]>(cacheKey);

    if(cached) {return cached;}

    try {
      const data = await this.apiService.getCompanies();

      if (!data || !data.length) {
        throw new Error("Nenhuma empresa encontrada.");
      }

      cache.set(cacheKey, data, TTL.companies);
      return data;
    } catch (error) {
      console.error("Erro ao buscar empresas: ", error)
      return []
    }
  }

  async getCompanyServices(slug: string): Promise<string> {
    const cacheKey = `services: ${slug}`;

    const cached = cache.get<string>(cacheKey);
    if(cached) {return cached;}

    try {
      const services = await this.apiService.getCompanyServices(slug)

      if (!services || !services.length) {
        throw new Error(`Nenhum serviço encontrado para a empresa ${slug}`)
      }

      const result = services.map((s) => `- ${s.name} (id: ${s.id}) \n Descrição: ${s.description}`).join("\n");
      cache.set(cacheKey, result, TTL.services);
      return result;


    } catch (error) {
      console.error(`Erro ao buscar serviços da empresa ${slug}`)
      return `Erro ao buscar serviços da empresa ${slug}`
    }
  }

  async getAvailableDates(slug: string, serviceId: number): Promise<string> {

    const cacheKey = `availableDates: ${slug}:${serviceId}`;
    const cached = cache.get<string>(cacheKey);

    if(cached) {return cached;}

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
    cache.set(cacheKey, response, TTL.availableDates);
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
  serviceId: number,
  locationId: number,
  date: string
): Promise<any> {

  // busca dados na API
  const data = await this.apiService.getAvailableSessions(
    slug,
    serviceId,
    locationId,
    date
  );

  const resources = data.resources || [];
  const sessions = data.sessions || [];

  // normaliza data recebida
  const normalizedDate = new Date(date).toLocaleDateString("sv-SE");

  // filtra sessões válidas da data
  const availableSessions = sessions.filter((s: any) => {

    const sessionDate = new Date(s.startDate)
      .toLocaleDateString("sv-SE");

    return (
      sessionDate === normalizedDate &&
      s.hasSlotLeft === true &&
      s.blocked !== true
    );
  });

  // estrutura profissionais + horários
  const professionals = resources.map((r: any) => ({
    id: r.id,
    name: r.name,

    times: availableSessions
      .filter((s: any) => s.resourceId === r.id)
      .map((s: any) =>
        new Date(s.startDate).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      ),
  }));

  return {
    date,
    hasAvailability: availableSessions.length > 0,
    professionals,
  };
}

// Realiza o agendamento criando um ticket
  async scheduleAppointment(body: any, token: string) {
    const response = await this.apiService.scheduleAppointment(body, token);
    const data = await response.json();

    // tratamento de erro da API
    if (data.messages?.length) {
      const err = data.messages.find((m: any) => m.type === "ERROR");
      if (err) throw new Error(err.description);
    }

    return data;
  }

  async listMyTickets(document: string): Promise<any[]> {

    const tickets = await this.apiService.listMyTickets(document);

    // garante array válido
    if (!tickets || !Array.isArray(tickets)) {
      return [];
    }

    // padroniza os dados
    return tickets.map((ticket: any) => ({
      protocol: ticket.protocol,
      service: ticket.serviceName,
      date: ticket.date,
      status: ticket.status,
      professional: ticket.resourceName,
      unit: ticket.locationName,
    }));
}
}