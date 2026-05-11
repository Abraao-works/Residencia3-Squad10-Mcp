import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CompanyService } from "../../application/services/CompanyService.js";

export class CompanyToolsController {
  constructor(
    private server: McpServer,
    private companyService: CompanyService
  ) {
    this.registerTools();
  }

  private registerTools(): void {
    this.registerListCompaniesToolHandler();
    this.registerGetCompanyServicesToolHandler();
    this.registerGetAvailableDatesToolHandler();
    this.registerGetBusinessUnitsToolHandler();
    this.registerGetAvailableSessionsToolHandler();
    this.registerGetBookingFormToolHandler();
    this.registerScheduleAppointmentToolHandler();
    this.registerListMyTicketsToolHandler
  }

  private registerGetCompanyServicesToolHandler(): void {
    this.server.tool(
      "get_company_services",
      "List all avaiable services of a company from Filazero using its slug",
      {
        slug: z.string().describe("Company slug")
      },
      async ({slug}) => {
        const responseServiceText = await this.companyService.getCompanyServices(slug)

        return {
          content: [
            {
              type: "text",
              text: responseServiceText
            }
          ]
        }
      }
    )
  }

  private registerListCompaniesToolHandler(): void {
    this.server.tool(
      "list_companies",
      "List all available companies from Filazero",

      {},

      async () => {
        const companies = await this.companyService.listCompanies();

        const text = companies
          .map(
            (c) =>
              `🏢 ${c.name}\nslug: ${c.slug}\ncategoria: ${c.category}`
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text,
            },
          ],
        };
      }
    );
  }

  private registerGetAvailableDatesToolHandler(): void {
    this.server.tool(
      "get_available_dates",
      "Get available dates for a service",
      {
        slug: z.string().describe("Company slug"),
        serviceId: z.number().describe("Service ID"),
      },
      async ({slug, serviceId}) => {
        const result = await this.companyService.getAvailableDates(slug, serviceId)

        return {
          content: [
            {
              type: "text",
              text: result
            }
          ]
        }
      }
    )
  }

  private registerGetBusinessUnitsToolHandler(): void {
    this.server.tool(
      "get_business_units",
      "List all available business units (locations) for a company",
      {
        slug: z.string().describe("Company slug"),
      },
      async ({ slug }) => {
        const result = await this.companyService.getBusinessUnits(slug);

        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      }
    );
  }

  private registerGetAvailableSessionsToolHandler(): void {
    this.server.tool(
      "get_available_sessions",
      "Get available sessions and professionals for a specific date, service and location",
      {
        slug: z.string().describe("Company slug"),
        serviceId: z.number().describe("Service ID (use abstractServiceId when available)"),
        locationId: z.number().describe("Business unit / location ID"),
        date: z.string().describe("Selected date (ISO format or yyyy-mm-dd)")
      },
      async ({ slug, serviceId, locationId, date }) => {
        const result = await this.companyService.getAvailableSessions(
          slug,
          serviceId,
          locationId,
          date
        );

        return {
          content: [
            {
              type: "text",
              text: result
            }
          ]
        };
      }
    );
  }

  private registerGetBookingFormToolHandler(): void {
    this.server.tool(
      "get_booking_form",
      "Retorna os campos necessários para preencher o agendamento",
      {
        providerId: z.number(),
        sessionId: z.number(),
      },
      async ({ providerId, sessionId }) => {
        try {
          const form = await this.companyService.getBookingForm(
            providerId,
            sessionId
          );

          // formatação simples para leitura da IA
          const text = form
            .map((f: any) => `- ${f.label} (${f.type})`)
            .join("\n");

          return {
            content: [{ type: "text", text }],
          };
        } catch (error: any) {
          return {
            content: [
              { type: "text", text: `Erro ao buscar formulário: ${error.message}` },
            ],
          };
        }
      }
    );
  }

  private registerScheduleAppointmentToolHandler(): void {
    this.server.tool(
      "schedule_appointment",
      "Realiza o agendamento e cria um ticket",
      {
        body: z.object({
          companyId: z.number().optional(),
          serviceId: z.number(),
          locationId: z.number(),
          date: z.string(),
          time: z.string(),
          customerName: z.string(),
          customerPhone: z.string(),
        }).describe("Dados do agendamento"),
        token: z.string().describe("Bearer token do usuário"),
      },
      async ({ body, token }) => {
        try {
          const result = await this.companyService.scheduleAppointment(
            body,
            token
          );

          // retorno simplificado
          return {
            content: [
              {
                type: "text",
                text: `Agendamento realizado com sucesso. Ticket: ${result.ticketId || "N/A"}`,
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              { type: "text", text: `Erro ao agendar: ${error.message}` },
            ],
          };
        }
      }
    );
  }

  private registerListMyTicketsToolHandler(): void {
    this.server.tool(
      "list_my_tickets",
      "Lista os agendamentos de um cliente",

      {
        document: z.string().describe("CPF do cliente"),
      },

      async ({ document }) => {

        try {

          const tickets =
            await this.companyService.listMyTickets(document);

          // sem tickets
          if (!tickets.length) {
            return {
              content: [
                {
                  type: "text",
                  text: "Nenhum agendamento encontrado.",
                },
              ],
            };
          }

          // formatação amigável
          const text = tickets
            .map((t: any) => {

              const date = new Date(t.date)
                .toLocaleString("pt-BR");

              return (
                `Protocolo: ${t.protocol}\n` +
                `Serviço: ${t.service}\n` +
                `Data: ${date}\n` +
                `Profissional: ${t.professional || "Não informado"}\n` +
                `Unidade: ${t.unit || "Não informada"}\n` +
                `Status: ${t.status}`
              );

            })
            .join("\n\n");

          return {
            content: [
              {
                type: "text",
                text,
              },
            ],
          };

        } catch (error: any) {

          return {
            content: [
              {
                type: "text",
                text: `Erro ao buscar agendamentos: ${error.message}`,
              },
            ],
          };

        }

      }
    );
  }
}