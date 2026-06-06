---
quick_id: 260604-wme
slug: adicionar-pin-de-respons-vel-para-acessa
status: complete
completed_at: 2026-06-05T02:55:03.000Z
implementation_commit: b4c1863
---

# Summary: PIN Do Responsável

## Resultado

O cadastro do responsável agora exige um PIN de 4 dígitos, e o acesso à gestão da família a partir do modo criança passa por uma verificação desse PIN.

## Mudanças Entregues

- Backend armazena `responsible_pin_hash` no usuário responsável e valida `responsiblePin` no cadastro.
- Novo endpoint autenticado `POST /auth/responsible-pin/verify` verifica o PIN do responsável atual.
- Mobile adiciona campo "PIN do responsável" na tela de registro.
- Mobile exibe prompt de PIN antes de navegar por "Gerenciar família" no seletor de crianças e no perfil infantil.
- Mensagem de erro `INVALID_RESPONSIBLE_PIN` é convertida para texto amigável no app.
- Testes backend e mobile foram atualizados para cobrir cadastro, validação e navegação protegida por PIN.

## Observações

- A migration mantém a coluna nullable para não quebrar bancos locais já existentes. Novos cadastros passam a exigir e salvar o PIN.
- Troca, recuperação ou redefinição de PIN continuam fora do escopo deste quick task.
