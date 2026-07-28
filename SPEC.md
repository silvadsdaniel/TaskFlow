# Especificação — Lista de tarefas pessoal

## Modelo de dados

```typescript
type Categoria = 'trabalho' | 'casa' | 'familia' | 'compras';

type Tarefa = {
  id: string;                    // crypto.randomUUID()
  titulo: string;                // 1 a 200 caracteres
  nota: string | null;
  categoria: Categoria | null;
  lembreteEm: string | null;     // ISO 8601 com offset
  concluida: boolean;
  criadaEm: string;
  concluidaEm: string | null;
  notificada: boolean;
  origem: 'texto' | 'voz';
};

type EstadoPersistido = {
  versao: 1;
  tarefas: Tarefa[];
};
```

Chave no localStorage: `tarefas:v1`.
Ao ler, validar com zod. Se o parse falhar, preservar o conteúdo bruto em `tarefas:v1:backup`, iniciar com estado vazio e avisar o usuário — nunca descartar dados silenciosamente.
Gravar com debounce de 300ms.

## Regras de negócio

### Fuso e datas
- Fuso fixo: America/Sao_Paulo.
- Datas sempre armazenadas em ISO 8601 com offset. Nunca gravar string sem offset.
- "Hoje" vai de 00:00 a 23:59 do dia local.
- Tarefa atrasada = pendente, com lembrete anterior ao momento atual.

### Visões
- **Hoje**: pendentes com lembrete até o fim do dia atual, incluindo atrasadas, mais uma seção "Sem data" no fim.
- **Semana**: próximos 7 dias a partir de hoje, agrupados por dia. Dias sem tarefa aparecem colapsados em uma linha.
- **Calendário**: grade mensal. Cada dia mostra até 3 pontos coloridos por categoria, e "+N" acima disso. Tarefas sem lembrete não aparecem no calendário.

### Filtros
- Filtro por categoria, múltipla seleção. Nenhuma selecionada equivale a todas.
- O filtro persiste ao trocar de visão e é gravado no localStorage em `filtros:v1`.

### Ordenação
1. Atrasadas, da mais antiga para a mais recente
2. Com lembrete, do mais próximo para o mais distante
3. Sem lembrete, da criação mais recente para a mais antiga

### Conclusão e exclusão
- Concluir grava `concluidaEm` e remove a tarefa da lista principal.
- Excluir e concluir exibem toast com "Desfazer" por 5 segundos. Durante esse período a tarefa fica em estado pendente de remoção na memória; só é removida de fato ao expirar o toast.

## Agendamento de lembretes

**Não use `setTimeout` por tarefa.** O limite de `setTimeout` é 2.147.483.647 ms (cerca de 24,8 dias); acima disso ele dispara imediatamente, o que causaria notificação errada para lembretes distantes.

Implementar assim:
- Um único `setInterval` de 20 segundos como relógio do app.
- A cada tique: buscar tarefas pendentes com `lembreteEm <= agora` e `notificada === false`; disparar notificação para cada uma; marcar `notificada = true` e persistir.
- Também rodar a verificação no `visibilitychange` quando a aba voltar a ficar visível, e uma vez no carregamento do app.
- Na verificação de carregamento, tarefas com lembrete vencido enquanto o app estava fechado alimentam o banner de lembretes perdidos, em vez de disparar notificações atrasadas em rajada.

### Notificações
- Só solicitar permissão quando o usuário criar o primeiro lembrete, e após uma tela explicativa própria.
- Estados a tratar: `default` (ainda não perguntado), `granted`, `denied`. Com `denied`, exibir aviso persistente e discreto de que os lembretes não vão tocar, com instrução de como reverter nas configurações do navegador.
- Notificação leva `tag` igual ao id da tarefa, para evitar duplicidade.
- Clique na notificação foca a janela e destaca a tarefa correspondente por 2 segundos.
- Notification API exige contexto seguro: funciona em `localhost` e HTTPS.

## Entrada por voz

Usar Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).

- `lang = 'pt-BR'`, `interimResults = true`, `continuous = false`.
- Detectar suporte no carregamento. Sem suporte (Firefox, por exemplo), o botão de microfone não é renderizado — não exibir botão quebrado.
- Erros a tratar explicitamente: `not-allowed` (permissão negada), `no-speech` (nada capturado), `network`, `aborted`. Cada um com mensagem própria em português.
- Timeout de 15 segundos: encerra a captura sozinho.
- Transcrição parcial visível em tempo real durante a fala.
- Ao encerrar, enviar a transcrição para a IA e exibir o card de confirmação.
- **Jamais salvar direto.** O usuário sempre revisa antes.

## Integração com IA

Responsabilidade da IA: apenas transformar texto livre em objeto estruturado. Ela não transcreve áudio e não decide nada além disso.

### Chamada
- Endpoint configurado por variável de ambiente. Chave lida de `import.meta.env.VITE_AI_API_KEY`.
- `temperature: 0`.
- Timeout de 10 segundos.
- Uma tentativa de retry em caso de erro de rede.

### Prompt

```
Você extrai tarefas de frases em português brasileiro.
Data e hora atual: {TIMESTAMP_ISO} (timezone America/Sao_Paulo).

Retorne APENAS um objeto JSON, sem markdown, sem explicação, no formato:
{"titulo": string, "nota": string|null, "categoria": "trabalho"|"casa"|"familia"|"compras"|null, "lembrete": string|null, "confianca": "alta"|"media"|"baixa"}

Regras:
- "titulo": ação principal, imperativo curto, sem a parte temporal.
- "lembrete": ISO 8601 com offset, ou null se não houver referência de tempo.
- Resolva expressões relativas ("amanhã", "sexta que vem", "daqui a duas horas") com base na data atual informada.
- Se houver data sem hora, use 09:00.
- "categoria": infira pelo conteúdo. Use null quando não estiver claro; não force.
- "confianca": "baixa" se a frase for ambígua.

Frase: "{TRANSCRICAO}"
```

### Tratamento da resposta
- Remover cercas de markdown (```json) antes do parse.
- Validar com zod.
- Se o parse falhar, cair para o modo degradado: abrir o card de confirmação com a transcrição bruta no campo de título, sem data e sem categoria. O usuário nunca fica sem saída.
- Se `lembrete` vier no passado, limpar o campo e sinalizar no card: "não entendi a data, confira".
- Se `confianca` for "baixa", o card abre com o campo de título já focado.

## Segurança da chave

- `.env` no `.gitignore`, sempre. Fornecer `.env.example` sem valores.
- Deixar a chamada de IA isolada em `src/lib/ia.ts`, atrás de uma função única `interpretarTarefa(texto: string)`. Isso permite trocar a chamada direta por um proxy no futuro alterando um arquivo só.
- Incluir comentário no topo desse arquivo registrando que a chamada direta do navegador expõe a chave e é aceitável apenas em ambiente local.

## Acessibilidade
- Toda a aplicação navegável por teclado.
- `Enter` no campo de entrada cria a tarefa. `Escape` fecha painéis e cancela gravação.
- Elementos interativos com foco visível.
- Categoria nunca indicada só por cor: sempre acompanhada de rótulo textual em algum ponto.
- Mudanças de estado importantes anunciadas em região `aria-live` (tarefa criada, concluída, excluída).

## Plano de fases

### Fase 1 — Fundação
Projeto Vite + React + TS + Tailwind. Tipos, storage com validação zod, reducer de estado, layout base. CRUD de tarefas por texto, sem categoria e sem lembrete.
Pronto quando: criar, editar, concluir e excluir funciona e o estado sobrevive ao reload.

### Fase 2 — Categorias e visões
Campo de categoria, chips coloridos, filtros combináveis persistidos, visões Hoje e Semana com a ordenação especificada.
Pronto quando: filtrar por categoria e alternar entre Hoje e Semana funciona sem perder estado.

### Fase 3 — Lembretes e notificações
Seletor de data e hora, agendador por intervalo, fluxo de permissão, banner de lembretes perdidos, tratamento dos três estados de permissão.
Pronto quando: um lembrete criado para dali a um minuto dispara a notificação com a aba aberta, e o banner aparece corretamente ao reabrir o app.

### Fase 4 — Voz e IA
Botão de microfone, captura, transcrição em tempo real, chamada de IA, card de confirmação, modo degradado.
Pronto quando: ditar "me lembra de ligar para o cliente amanhã às nove" gera uma tarefa com data correta, categoria trabalho e confirmação antes de salvar.

### Fase 5 — Calendário
Grade mensal, pontos por categoria, navegação entre meses, painel de detalhe do dia, adicionar tarefa com data pré-preenchida.
Pronto quando: o mês renderiza os indicadores corretos e clicar num dia abre suas tarefas.

### Fase 6 — Refino
Tema escuro, microinterações, toast de desfazer, estados vazios, responsividade em 390px, PWA instalável.
Pronto quando: nenhum erro de console, layout íntegro em 390px e app instalável.

## Critérios de aceite finais
1. Criar tarefa com lembrete e receber a notificação no horário, com a aba aberta.
2. Fechar e reabrir o navegador sem perder nenhuma tarefa.
3. Ditar frase com referência temporal relativa e ver a data resolvida corretamente.
4. Filtrar por duas categorias ao mesmo tempo e trocar de visão mantendo o filtro.
5. Usar o app inteiro pelo teclado.
6. Nenhuma chave de API no código versionado.
7. Layout íntegro em 390px de largura.
8. `npm run build` e `npm run lint` sem erros nem avisos.
