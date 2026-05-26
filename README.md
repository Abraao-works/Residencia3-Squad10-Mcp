# Residencia3-Squad10-Mcp

## Ferramentas e tecnologias necessárias para execução e teste do MCP:
  - Node js
  - Claude Desktop
  - Docker Desktop

## ATENÇÃO
**Abra o docker antes de começar a testar, senão não irá funcionar**

## Configuração Claude Desktop 
Adicione essa configuração no arquivo do claude (claude_desktop_config)

```json
  "mcpServers": {
    "filazero-mcp": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost/mcp"
      ]
    }
  }
```
Para acessar o arquivo `claude_desktop_config` no Claude Desktop clique no nome do seu perfil na parte de baixo e depois vá para configurações, então vá para desenvolvedor e escolha a opção "Editar Config", assim será aberto o arquivo de configuração. 

## Comandos iniciais
Após puxar o código do MCP para o seu dispositivo, abra o projeto no terminal e digite os seguintes comandos:

```
  npm run build
  docker build -t mcp-filazero-squad10 .
  docker compose up --build
```

Dessa forma o container relativo ao MCP será criado no Docker, agora ao abrir o Claude Desktop, ele se irá se conectar ao MCP e você poderá testar suas funcionalidade através do chat

## Prompts do MCP
Temos 2 prompts que podem ser usados para iniciar diretamente as funcionalidades do servidor MCP
O primeiro:
```
  agendar-atendimento
```
Ao digitar isso para o Claude Desktop, será iniciado o fluxo de agendamento seguindo os seguintes passos:
  1. Listar Empresas
  2. Listar Serviços a empresa selecionada
  3. Listar datas disponíveis para o serviço selecionado
  4. Listar horários disponívei para o dia selecionado
  5. Preencher dados relativos ao formulário daquele serviço
  6. Confirmação de agendamento

O segundo prompt seria:
```
  consultar-agendamento
```
Ao digitar este comando para o Claude Desktop, ele irá pedir a chave referente ao seu ticket e então você poderá acompanhar o status e ver as informações referentes a um agendamento em específico.


