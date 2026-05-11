import { FilazeroApiService } from "../../infrastructure/services/FilazeroApiService.js";
import type { Formulario } from "../../domain/models/formulario.ts";
import { cache, TTL } from "../../infrastructure/cache/cache.js";

const apiService = new FilazeroApiService;

export async function getFormularioService(providerId :number, sessionId: number): Promise<String[]> {
    const cacheKey = `formularioServices: ${providerId}:${sessionId}`;
    const cached = cache.get<String[]>(cacheKey);
    if(cached) {return cached;}
    
    try{
    const data = await apiService.getFormularioServices(providerId, sessionId);

    if (!data || !data.length) {
        throw new Error("Nenhum campo personalizado do formulário encontrado.");

    }
    return data

    } catch (error) {
    console.error("Erro ao buscar campos personalizados do formulário: ", error)
    return []
}
}



