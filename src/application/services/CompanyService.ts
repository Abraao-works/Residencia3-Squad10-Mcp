import { FilazeroApiService } from "../../infrastructure/services/FilazeroApiService.js";
import type { Company } from "../../domain/models/empresa.js";
import type { Service } from "../../domain/models/service.js";
import { cache, TTL } from "../../infrastructure/cache/cache.js";
import type { BusinessUnit } from "../../domain/models/businessUnit.js";
import { handleCustomErrors } from "../../infrastructure/exceptions/errorHandler.js";

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

  async getCompanyServices(slug: string): Promise<Service[]> {
    const cacheKey = `services: ${slug}`;

    const cached = cache.get<Service[]>(cacheKey);
    if(cached) {return cached;}

    try {
      const services = await this.apiService.getCompanyServices(slug)

      if (!services || !services.length) {
        throw new Error(`Nenhum serviço encontrado para a empresa ${slug}`)
      }

      cache.set(cacheKey, services, TTL.services);
      return services;
    
    } catch (error) {
      console.error(`Erro ao buscar serviços da empresa ${slug}`)
      throw error;
    }
  }

  async getAvailableDates(slug: string, serviceId: number): Promise<{ horariosDisponiveis: Record<string, string[]> }> {

    const cacheKey = `availableDates: ${slug}:${serviceId}`;
    const cached = cache.get<{ horariosDisponiveis: Record<string, string[]> }>(cacheKey);

    if(cached) {return cached;}

    const dates = await this.apiService.getAvailableDates(slug, serviceId);

    if (!dates.length) {
      throw new Error("Nenhuma data disponível");
    }

    const available = dates.filter((d) => d.hasSlotLeft)

    if (!available.length) {
      throw new Error("Não há datas com vagas disponíveis.");
    }

    // Agrupando por dia
    const grouped: Record<string, string[]> = {};

    available.forEach((d) => {
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

    const response = {
      horariosDisponiveis: grouped
    };
    
    cache.set(cacheKey, response, TTL.availableDates);
    return response;
  }
  
  // tool para o locationID
  async getBusinessUnits(slug: string): Promise<BusinessUnit[]> {
    try {
      const units = await this.apiService.getBusinessUnits(slug);

      if (!units || !units.length) {
        throw new Error("Nenhuma unidade de atendimento encontrada para essa empresa.");
      }

      return units;
    } catch (error) {
      console.error("Erro ao buscar unidades:", error);
      throw new Error("Erro ao buscar unidades de atendimento.");
    }
  }

  async getAvailableSessions(slug: string, serviceId: number, locationId: number, date: string): Promise<any> {

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
    if(!(response instanceof Response)){
      throw new Error(response.body.error || "Erro desconhecido ao agendar.");
    }
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