import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class CategoriesResource {
    constructor(private server: McpServer) {
        this.register();
    }

    private register() {
        this.server.resource(
            "filazero-categories",
            "filazero://categories",
            async () => {
                return {
                    contents: [
                        {
                            uri: "filazero://categories",
                            mimeType: "text/plain",
                            text: `
CATEGORIAS DISPONÍVEIS NO FILAZERO

Este resource define oficialmente todas as categorias do sistema Filazero.
Ele deve ser utilizado como referência principal para entender e interpretar as categorias das empresas.

Cada categoria representa um tipo de serviço ou segmento de atuação.

Lista de categorias:

- ARTS_AND_ENTERTAINMENT: Artes e entretenimento (eventos, lazer, cultura)
- AUTOMOTIVE: Automotivo (veículos, manutenção, oficinas)
- BEAUTY_AND_FITNESS: Beleza e fitness (salões, academias, estética)
- BOOKS_AND_LITERATURE: Livros e literatura (editoras, leitura, bibliotecas)
- BUSINESS_AND_INDUSTRIAL: Negócios e mercado industrial (empresas, indústria, serviços corporativos)
- TECHNOLOGY: Tecnologia (software, hardware, inovação)
- FINANCE: Finanças (bancos, investimentos, serviços financeiros)
- FOOD_AND_DRINK: Comidas e bebidas (restaurantes, bares, alimentação)
- GAMES: Jogos (games, entretenimento digital)
- HEALTH: Saúde (clínicas, hospitais, consultas médicas)
- HOBBIES_AND_LEISURE: Hobbies e lazer (atividades recreativas)
- HOME_AND_GARDEN: Casa e jardim (decoração, construção, jardinagem)
- INTERNET_AND_TELECOM: Internet e telecomunicações (provedores, comunicação)
- JOBS_AND_EDUCATION: Empregos e educação (carreiras, cursos, ensino)
- LAW_AND_GOVERNMENT: Lei e governo (serviços públicos, jurídico)
- NEWS: Notícias (mídia, jornalismo)
- ONLINE_COMMUNITIES: Comunidades online (fóruns, redes sociais)
- PEOPLE_AND_SOCIETY: Pessoas e sociedade (cultura, comportamento)
- PETS_AND_ANIMALS: Animais de estimação (cuidados, veterinária)
- REAL_ESTATE: Imobiliária (compra, venda e aluguel de imóveis)
- REFERENCE: Referência (conteúdo informativo, guias)
- SCIENCE: Ciência (pesquisa, estudos científicos)
- SHOPPING: Compras (varejo, e-commerce)
- SPORTS: Esportes (atividades esportivas, academias)
- TRAVEL: Viagens (turismo, hospedagem, transporte)
- OTHER: Outros (categorias não classificadas)

Essas categorias são utilizadas para classificar empresas e podem ser usadas para filtrar, sugerir ou explicar serviços ao usuário.
                            `.trim()
                        }
                    ]
                }
            }
        )
    }
}