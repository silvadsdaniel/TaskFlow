import type { Tarefa } from '../types/tarefa';

// setTimeout tem limite de ~24,8 dias (2.147.483.647 ms); acima disso dispara
// na hora. Por isso o agendamento usa um relógio único de intervalo curto em
// vez de um setTimeout por tarefa.
export const INTERVALO_VERIFICACAO_MS = 20_000;

export function tarefasVencidas(tarefas: Tarefa[]): Tarefa[] {
  const agora = Date.now();
  return tarefas.filter(
    (tarefa) =>
      !tarefa.concluida &&
      !tarefa.notificada &&
      tarefa.lembreteEm !== null &&
      new Date(tarefa.lembreteEm).getTime() <= agora,
  );
}
