# Spike Manifest

## Idea

Validar e implementar um padrão acessível de exibição temporária de senhas e PINs, com confirmação local para novos PINs, sem alterar contratos de autenticação do backend.

## Requirements

- Segredos permanecem ocultos por padrão.
- Cada campo possui botão persistente e independente `Exibir`/`Ocultar`.
- O controle usa semântica de toggle button e alvo mínimo de 48 px.
- Cadastro e redefinição exigem confirmação do PIN de 4 dígitos.
- Confirmações são locais ao frontend e não alteram payloads da API.
- Nenhuma dependência visual externa será adicionada.

## Spikes

| # | Name | Type | Validates | Verdict | Tags |
|---|------|------|-----------|---------|------|
| 001 | secure-input-visibility | standard | Toggle masking without losing value or accessible state | VALIDATED | react-native, accessibility, credentials, ux |
| 002 | pin-confirmation | standard | Accept only matching four-digit PINs without API changes | VALIDATED | react-native, pin, validation, ux |
| 003 | credential-flow-integration | standard | Apply independent visibility controls across all protected fields | VALIDATED | react-native, integration, credentials, accessibility, ux |
