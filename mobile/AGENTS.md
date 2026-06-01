# AGENTS.md

## Projeto
Aplicativo mobile Android-first feito com React Native + Expo para gamificação de tarefas domésticas infantis.

## Contexto funcional
O app possui dois modos:
- Responsável: gerencia crianças, missões, recompensas, aprovações e progresso.
- Criança: visualiza missões, conclui tarefas, acompanha moedas e resgata recompensas.

A lógica do produto vem da documentação do TCC: missões representam tarefas, moedas representam fichas/token economy, e recompensas são resgates definidos pela família. :contentReference[oaicite:4]{index=4}

## Stack
- React Native
- Expo
- TypeScript
- Android como plataforma inicial

## Regras de UI
- Seguir os arquivos em docs/design/
- Recriar visualmente as telas dos screenshots exportados do Stitch
- Não usar imagens externas
- Não usar Lottie, SVG complexo, ilustrações ou assets pesados
- Usar emojis para ícones, categorias, missões, recompensas e avatares
- Usar componentes reutilizáveis
- Manter o app leve e performático

## Estrutura sugerida
- app/ ou src/screens para telas
- src/components para componentes reutilizáveis
- src/theme para cores, espaçamentos, raios e tipografia
- src/data para mocks temporários
- src/types para tipos TypeScript

## Comandos
- npm install
- npx expo start
- npm run lint, se existir
- npm test, se existir

## Critério de pronto
- A tela deve compilar no Expo
- Deve funcionar em Android
- Deve respeitar os screenshots de referência
- Deve não depender de assets de imagem
- Deve usar dados mockados quando backend ainda não existir
