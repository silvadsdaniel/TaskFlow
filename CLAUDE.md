# Regras do projeto

## Stack — fixa, não alterar sem me perguntar
- React 18 + TypeScript (strict)
- Vite
- Tailwind CSS
- Ícones: lucide-react
- Estado: useReducer + Context. Sem Redux, Zustand, Jotai ou similar.
- Datas: date-fns (locale pt-BR). Sem moment, sem dayjs.
- Validação: zod
- Persistência: localStorage. Sem backend, sem banco, sem IndexedDB.

Qualquer dependência fora desta lista exige minha aprovação antes da instalação.

## Convenções de código
- TypeScript strict. Sem `any`. Sem `@ts-ignore`.
- Componentes funcionais, um por arquivo, nomeados em PascalCase.
- Lógica de negócio fica em `src/lib/`, nunca dentro de componentes.
- Nada de comentário óbvio. Comente apenas decisão não evidente.
- Textos da interface em português do Brasil, todos centralizados em `src/lib/textos.ts`.
- Nomes de variáveis e funções em inglês; textos de UI em português.

## Estrutura de pastas
```
src/
  components/     componentes de UI, sem lógica de negócio
  lib/            regras, agendador, storage, cliente de IA, voz
  hooks/          hooks customizados
  types/          tipos compartilhados
  App.tsx
```

## O que NUNCA fazer
- Commitar chave de API ou arquivo `.env`
- Chamar a API de IA direto do navegador em código destinado a produção
- Salvar tarefa vinda de voz sem confirmação explícita do usuário
- Mudar a estrutura do objeto persistido sem escrever a migração correspondente
- Usar `alert`, `confirm` ou `prompt` nativos
- Adicionar animação acima de 300ms
- Inventar tela, campo ou funcionalidade que não esteja no SPEC.md

## Fluxo de trabalho
- Uma fase por vez, na ordem do SPEC.md.
- Antes de dizer que terminou: `npm run build` e `npm run lint` precisam passar limpos.
- Ao terminar uma fase, pare e me mostre o resultado. Não emende a próxima.
- Se encontrar ambiguidade no SPEC, pergunte. Não escolha por conta própria.
