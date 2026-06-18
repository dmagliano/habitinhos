# Roteiro de Demonstração do TCC

Este roteiro guia uma apresentação local do MVP Habitinhos usando dados de demonstração repetíveis.

## Preparação

1. Subir o PostgreSQL local:
   ```bash
   docker compose up -d postgres
   ```
2. Iniciar o backend com seed local:
   ```bash
   cd backend
   HABITINHOS_DEMO_SEED_ENABLED=true ./mvnw spring-boot:run
   ```
3. Confirmar Swagger em `http://localhost:8080/swagger-ui.html`.
4. Iniciar o app mobile contra a API local:
   ```bash
   cd mobile
   npm run android:local
   ```
   Para iOS use `npm run ios:local`; para navegador use `npm run web:local`.

## Credenciais da demo

Estas credenciais são apenas locais e não representam dados reais:

| Uso | Valor |
|-----|-------|
| E-mail | `demo@habitinhos.local` |
| Senha | `Demo12345` |
| PIN do responsável | `1234` |

## Jornada do Responsável

1. Entrar com `demo@habitinhos.local` e `Demo12345`.
2. Abrir o painel do Responsável e destacar:
   - crianças cadastradas;
   - saldos de moedas;
   - missões pendentes, aguardando aprovação e concluídas;
   - resgates recentes.
3. Entrar em gerenciamento de missões e comentar que o responsável cria missões com moedas, recorrência e aprovação.
4. Entrar em gerenciamento de recompensas e comentar que o responsável define custo e disponibilidade.
5. Usar a área de aprovações para mostrar uma missão aguardando decisão.
6. Marcar um resgate como entregue, se houver item pendente no histórico recente.
7. Usar `Retornar às crianças` para demonstrar a troca de contexto sem trocar de conta.

## Jornada da Criança

1. Na tela `Quem vai brincar agora?`, selecionar uma criança da família demo.
2. Mostrar a home da Criança com saldo, progresso e missões.
3. Abrir uma missão pendente e concluir a atividade.
4. Explicar a diferença entre missão que credita automaticamente e missão que fica aguardando aprovação.
5. Abrir recompensas, escolher uma recompensa possível e confirmar o resgate.
6. Mostrar o efeito no saldo e no histórico de resgate.
7. Usar `Gerenciar família` e digitar PIN `1234` para voltar ao fluxo do responsável.

## Cadastro e Polimento de UX

1. Sair ou voltar para a entrada de autenticação.
2. Abrir `Criar conta`.
3. Mostrar que `Senha` informa `Mínimo de 8 caracteres`.
4. Mostrar `Confirmar senha` logo abaixo da senha.
5. Deixar algum campo faltando e apontar a mensagem `Complete os campos obrigatórios para criar a conta.` próxima ao botão desativado.
6. Digitar confirmação diferente e mostrar `As senhas precisam ser iguais.`.

## Pontos técnicos para comentar

- O backend deriva `familyUnitId` do JWT e não confia em `familyUnitId` vindo do cliente.
- `WalletService` credita e debita moedas de forma transacional.
- Cada crédito ou débito cria `CoinTransaction`, preservando histórico de moedas.
- Recompensas geram `RewardRedemption` e podem ser marcadas como entregues.
- Reset de senha, reset de PIN responsável e exclusão de conta usam `auth_reset_tokens`.
- O seed local usa `HABITINHOS_DEMO_SEED_ENABLED=true`, perfil local e dados sintéticos.

## Plano B se o ambiente falhar

- Se o app mobile não abrir, usar Swagger para demonstrar `/auth/login`, `/me`, `/dashboard/responsible`, `/children`, `/missions`, `/rewards` e `/reward-redemptions/{id}/delivered`.
- Se e-mail real não estiver configurado, explicar que o backend usa logging local para códigos de reset quando `RESEND_API_KEY` está ausente.
- Se o banco local estiver sujo, derrubar e subir novamente o serviço PostgreSQL ou usar um banco limpo antes de iniciar o backend com seed.
- Se a demo de resgate falhar por saldo insuficiente, usar a tela para explicar a regra de bloqueio de recompensa sem moedas suficientes.

## Checklist final

- [ ] PostgreSQL local ativo.
- [ ] Backend ativo com `HABITINHOS_DEMO_SEED_ENABLED=true`.
- [ ] Swagger acessível.
- [ ] Mobile iniciado com `npm run android:local`, `npm run ios:local` ou `npm run web:local`.
- [ ] Login com `demo@habitinhos.local` e `Demo12345` validado.
- [ ] Responsável consegue ver dashboard, missões, recompensas, aprovações e resgates.
- [ ] Criança consegue ver missões, saldo, recompensa e resgate.
- [ ] PIN `1234` retorna para `Gerenciar família`.
- [ ] Tela `Criar conta` mostra confirmação de senha, regra mínima e bloqueio de botão.
