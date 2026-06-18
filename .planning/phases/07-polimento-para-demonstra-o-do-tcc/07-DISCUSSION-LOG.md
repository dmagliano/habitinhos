# Phase 7: Polimento para demonstração do TCC - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-18
**Phase:** 7-Polimento para demonstração do TCC
**Areas discussed:** Registration password confirmation, registration validation behavior, disabled submit explanation, UI design contract need

---

## Discussion Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Campos e validação | Define confirmação de senha, bloqueio de envio e mensagens antes de planejar. | |
| UI completa | Inclui também layout, copy fina e necessidade de UI-SPEC com gsd-ui-phase. | ✓ |
| Só registrar | Captura a decisão objetiva e deixa detalhes de UI para o executor. | |

**User's choice:** UI completa.
**Notes:** User wanted to refine the registration UI and align with UI questions where needed.

---

## Validation Before Submit

| Option | Description | Selected |
|--------|-------------|----------|
| Bloquear envio com mensagens inline | Button calls `register` only when password has 8+ characters and confirmation matches; messages appear near fields. | ✓ |
| Permitir envio e mostrar erro geral | Let submit happen and show a general form error. | |
| Bloquear só quando confirmação divergir | Treat length as visual guidance and keep final enforcement on backend. | |

**User's choice:** Bloquear envio com mensagens inline.
**Notes:** Mobile should prevent avoidable invalid registration attempts.

---

## Password Mismatch Timing

| Option | Description | Selected |
|--------|-------------|----------|
| Depois que o usuário preencher a confirmação | Avoid showing mismatch before there is confirmation input to compare. | ✓ |
| Enquanto digita | Immediate feedback while typing. | |
| Só ao tocar em Criar conta | Quiet until submit. | |

**User's choice:** Depois que o usuário preencher a confirmação.
**Notes:** Inline feedback should be helpful without feeling premature.

---

## Minimum Password Length Copy

| Option | Description | Selected |
|--------|-------------|----------|
| Helper fixo abaixo do campo Senha | Always visible copy like `Use pelo menos 8 caracteres.` | |
| Dentro do placeholder | Placeholder communicates the rule, e.g. `Mínimo de 8 caracteres`. | ✓ |
| Só como erro inline | Rule appears only after invalid input. | |

**User's choice:** Dentro do placeholder.
**Notes:** Preferred copy: `Mínimo de 8 caracteres`.

---

## Create Account Button State

| Option | Description | Selected |
|--------|-------------|----------|
| Desabilitado até estar válido | Enable only when password has 8+ characters, confirmation matches, and required fields are filled. | ✓ |
| Sempre habilitado, mas valida inline ao tocar | Keep button active and validate on press. | |
| Habilita campos básicos, valida senha ao tocar | Require basic fields before enabling, then validate password/confirmation on submit. | |

**User's choice:** Desabilitado até estar válido.
**Notes:** Disabled action should reflect the complete local validity check.

---

## Confirm Password Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Logo abaixo de Senha | Keep password and confirmation adjacent. | ✓ |
| Depois de Nome da família | Preserve most of the old field order but separate the two password fields. | |
| No fim do formulário, antes do PIN | Lower visual priority. | |

**User's choice:** Logo abaixo de Senha.
**Notes:** Field order should make password comparison easy.

---

## Disabled Button Explanation

| Option | Description | Selected |
|--------|-------------|----------|
| Mensagem objetiva do primeiro bloqueio | Show the first specific reason preventing account creation. | |
| Checklist compacto | Show compact requirement checklist. | |
| Mensagem genérica única | Show one generic explanation near the disabled button. | ✓ |

**User's choice:** Mensagem genérica única.
**Notes:** User explicitly requested an explanation near the disabled button when fields are missing, then chose the generic version. Preferred copy: `Complete os campos obrigatórios para criar a conta.`

---

## Finalization

| Option | Description | Selected |
|--------|-------------|----------|
| Gerar contexto agora | Create Phase 7 context and discussion log; recommend `gsd-ui-phase 7` next. | ✓ |
| Refinar mais UI | Continue refining microcopy, accessibility, and error states. | |
| Implementar direto | Make the code change immediately as a small adjustment. | |

**User's choice:** Gerar contexto agora.
**Notes:** Context should be available for the UI design contract and planner.

---

## the agent's Discretion

- Exact function names, local state shape, and tests are left to the planner/executor.
- The executor may make minor copy adjustments if the chosen text needs to fit existing layout, while preserving the generic disabled-button explanation intent.

## Deferred Ideas

None.
