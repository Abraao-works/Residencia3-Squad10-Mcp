import axios from "axios";
import { handleCustomErrors } from "../errorHandler.js";

const api = axios.create({
  baseURL: "https://api.filazero.net/v2/ticketing",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8"
  }
});

export async function scheduleAppointment(
  token: string,
  payload: unknown
) {
  try {
    const response = await api.post(
      "/tickets",
      payload,
      {
        headers: {
          Authorization: Bearer ${token}
        }
      }
    );

    return {
      status: 200,
      body: response.data
    };
  } catch (error: unknown) {
    return handleCustomErrors(error);
  }
}

export async function checkTicketStatus(
  accessKey: string
) {
  try {
    const response = await api.get(
      /tickets/${accessKey}
    );

    return {
      status: 200,
      body: response.data
    };
  } catch (error: unknown) {
    return handleCustomErrors(error);
  }
}

export async function listMyTickets(
  token: string
) {
  try {
    const response = await api.get(
      "/tickets",
      {
        headers: {
          Authorization: Bearer ${token}
        }
      }
    );

    return {
      status: 200,
      body: response.data
    };
  } catch (error: unknown) {
    return handleCustomErrors(error);
  }
}
