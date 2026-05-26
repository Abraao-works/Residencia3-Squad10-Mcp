# Residencia3-Squad10-Mcp

## Sobre o projeto:
Esse projeto se trata de um servidor MCP (Model Context Protocol) para servir como uma camada intermediária entre um agente de IA (mais especificamente o Claude Desktop que foi o que usamos para teste) e a API da plataforma Filazero da empresa Inventione, com o intuito de melhorar a eficiência do processo de agendamento para os clientes do Filazero, através da interação com o agente de IA por linguagem natural

O servidor disponibiliza:
 - Tools
 - Resources
 - Prompts
 - Fluxo de agendamento guiado

## Ferramentas e tecnologias necessárias para execução e teste do MCP:
Antes de começar instale:
 - Node js
 - Claude Desktop
 - Docker Desktop

Certifique-se de que o Docker Desktop esteja em execução antes de iniciar os testes.

## Configuração Claude Desktop 
Adicione essa configuração no arquivo do claude (claude_desktop_config)

```json
{
  "mcpServers": {
    "filazero-mcp": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost/mcp"
      ]
    }
  }
}
```

Para acessar o arquivo `claude_desktop_config` no Claude Desktop clique no nome do seu perfil na parte de baixo e depois vá para configurações, então vá para desenvolvedor e escolha a opção "Editar Config", assim será aberto o arquivo de configuração. 

## Comandos iniciais
Após clonar o repositório, abra o projeto no terminal e digite os seguintes comandos:

```
  npm install
  npm run build
  docker build -t mcp-filazero-squad10 .
  docker compose up --build
```

Detalhando os comandos:
- `npm install` → instala as dependências do projeto
- `npm run build` → transpila o código TypeScript para JavaScript
- `docker build` → cria a imagem Docker do MCP
- `docker compose up --build` → sobe os containers do projeto

Dessa forma o container relativo ao MCP será criado no Docker, agora ao abrir o Claude Desktop, ele se irá se conectar automaticamente ao MCP e você poderá testar suas funcionalidades através do chat


## Prompts disponíveis

| Prompt | Descrição |
|---|---|
| `agendar-atendimento` | Inicia o fluxo completo de agendamento |
| `consultar-agendamento` | Consulta informações de um ticket existente pela sua chave|

O fluxo de agendamento segue os seguintes passos:
  1. Listar Empresas
  2. Listar Serviços da empresa selecionada
  3. Listar datas disponíveis para o serviço selecionado
  4. Listar horários disponíveis para o dia selecionado
  5. Preencher dados relativos ao formulário daquele serviço
  6. Confirmação de agendamento

## Tools disponíveis

O servidor MCP disponibiliza as seguintes tools para interação com a API do Filazero:

| Tool | Descrição | Parâmetros |
|---|---|---|
| `list_companies` | Lista todas as empresas disponíveis no Filazero | Nenhum |
| `get_company_services` | Lista todos os serviços disponíveis de uma empresa | `slug` |
| `get_business_units` | Lista todas as unidades/localizações de uma empresa | `slug` |
| `get_available_dates` | Lista as datas disponíveis para um serviço específico | `slug`, `serviceId` |
| `get_available_sessions` | Lista horários/sessões disponíveis para uma determinada data e unidade | `slug`, `serviceId`, `locationId`, `date` |
| `get_formulario_services` | Obtém os campos do formulário necessários para realizar o agendamento | `providerId`, `sessionId` |
| `schedule_appointment` | Realiza o agendamento e cria um ticket | `body`, `token` |
| `get_ticket_status` | Consulta o status de um ticket utilizando sua chave de acesso | `accessKey` |
| `list_my_tickets` | Lista todos os agendamentos de um cliente | `document` |

---

### Fluxo recomendado de uso das tools

As tools foram projetadas para serem utilizadas na seguinte ordem:

1. `list_companies`
2. `get_company_services`
3. `get_business_units`
4. `get_available_dates`
5. `get_available_sessions`
6. `get_formulario_services`
7. `schedule_appointment`

Para consultas posteriores:

- `get_ticket_status`
- `list_my_tickets`

---

### Exemplo de fluxo de agendamento

```text
Usuário deseja realizar um agendamento
        ↓
list_companies
        ↓
get_company_services
        ↓
get_business_units
        ↓
get_available_dates
        ↓
get_available_sessions
        ↓
get_formulario_services
        ↓
schedule_appointment
```

## Resources disponíveis

| Resource | Descrição |
|---|---|
| `filazero://categories` | Lista oficial de categorias disponíveis no sistema |
| `filazero://scheduling-flow` | Explica o fluxo correto de agendamento |
| `filazero://ticket-lifecycle` | Descreve o ciclo de vida de um ticket/agendamento |



## MCP Inspector
Para abrir o servidor MCP com o MCP Inspector e explorar suas funcionalidades, como tools, resources e prompts, mais detalhadamente, rode o seguinte comando no terminal:
```
npx @modelcontextprotocol/inspector node dist/main.js
```
Assim será aberta uma página do MCP Inspector no seu navegador, clique em "Connect" e então você poderá ver os detalhes das funcionalidades do servidor:

<img width="1919" height="900" alt="image" src="https://github.com/user-attachments/assets/d89f09c3-b0c0-4322-bf79-fbbfd3da3ea9" />


## Problemas comuns

### MCP Remote
Caso o comando `mcp-remote` não funcione, execute:

```bash
npm install -g mcp-remote
```

---

### Docker não conecta

Certifique-se de que o Docker Desktop está aberto e em execução.

---

### Claude não reconhece o MCP

Verifique:
- se o container está rodando
- se a configuração do `claude_desktop_config` está correta
- se a URL `http://localhost/mcp` está acessível

---

### Erro ao executar Docker Compose

Tente reconstruir os containers:

```bash
docker compose down
docker compose up --build
```


## Arquitetura

```text
Claude Desktop
        ↓
MCP Remote
        ↓
Servidor MCP
        ↓
API Filazero
```
