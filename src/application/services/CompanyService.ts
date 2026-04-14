import { FilazeroApiService } from "../../infrastructure/services/FilazeroApiService.js";
import type { Company } from "../../domain/models/empresa.js";

export class CompanyService {
  constructor(private apiService: FilazeroApiService) {}

  async listCompanies(): Promise<Company[]> {
    const data = await this.apiService.getCompanies();

    if (!data || !data.length) {
      throw new Error("Nenhuma empresa encontrada.");
    }

    return data;
  }
}