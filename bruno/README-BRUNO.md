# Bruno setup (Habitinhos)

## 1) Importar collection OAS

- Bruno -> Import Collection -> OpenAPI -> File
- Arquivo: `bruno/habitinhos-openapi.yaml`

## 2) Importar ambiente dev

- Bruno -> Import Environment
- Arquivo: `bruno/habitinhos-dev.postman_environment.json`

Variáveis criadas:
- `baseUrl`: `http://localhost:8080`
- `token`: vazio (preencher após login)

## 3) Fluxo de autenticação

1. Rode `POST /auth/login` com email/senha.
2. Copie o `token` da resposta.
3. Salve em `token` no environment.
4. Nos endpoints protegidos, use header:
   - `Authorization: Bearer {{token}}`

## 4) Atualizar quando a API mudar

- Se adicionar endpoints, reimporte o OAS.
- Se quiser atualização contínua, conecte via OpenAPI Sync no Bruno.
