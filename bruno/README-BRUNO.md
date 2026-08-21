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

## 5) Exclusão de conta: soft versus permanente

O contrato mantém dois fluxos distintos:

- `POST /auth/account-deletion/request` e `POST /auth/account-deletion/confirm` exigem Bearer, usam o token de desativação e fazem soft deactivation, preservando o histórico.
- `POST /auth/account-deletion/permanent/request` recebe somente `email`, não exige Bearer e sempre responde `202`, sem revelar se existem contas correspondentes.
- `POST /auth/account-deletion/permanent/confirm` recebe somente `email` e `token`, não exige Bearer e responde `204` após o purge.

O fluxo permanente usa token dedicado, expirável e de uso único enviado por e-mail. A confirmação remove irreversivelmente todas as contas ativas e inativas com o e-mail normalizado e todas as famílias associadas. Ela não aceita senha, JWT nem texto de confirmação literal. Não registre o token em logs, scripts ou variáveis compartilhadas.
