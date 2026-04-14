import axios from "axios"
import type {Company } from "../../domain/models/empresa.js"

export class FilazeroApiService {
  private BASE_URL = "https://api.staging.filazero.net";

  async getCompanies(): Promise<Company[]> {
    const response = await fetch(`${this.BASE_URL}/api/companies`);

    if (!response.ok) {
      throw new Error(`Erro HTTP ao buscar empresas: ${response.status}`);
    }

    const data = await response.json();

    return data
  }
}