import axios from "axios";
import { handleCustomErrors } from "../errorHandler.js";

const api = axios.create({
  baseURL: "https://api.filazero.net",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8"
  }
});

export async function listCompanies() {
  try {
    const response = await api.get("/companies");

    return {
      status: 200,
      body: response.data
    };
  } catch (error: unknown) {
    return handleCustomErrors(error);
  }
}

export async function getCompanyServices(
  companySlug: string
) {
  try {
    const response = await api.get(
      /companies/${companySlug}/services
    );

    return {
      status: 200,
      body: response.data
    };
  } catch (error: unknown) {
    return handleCustomErrors(error);
  }
}
