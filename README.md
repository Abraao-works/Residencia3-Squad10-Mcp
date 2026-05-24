# Residencia3-Squad10-Mcp

## Para Rodar O MCP server HTTP, adicione esse configuração no arquivo do claude (claude_desktop_config)

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
