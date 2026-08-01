import type { Tarefa } from '../types/tarefa';
import { estaAtrasada, limitesDoDiaAtual, limitesDosProximosDias } from './datas';

export function ordenarTarefas(tarefas: Tarefa[]): Tarefa[] {
  return [...tarefas].sort((a, b) => {
    const grupoA = grupoDeOrdenacao(a);
    const grupoB = grupoDeOrdenacao(b);
    if (grupoA !== grupoB) return grupoA - grupoB;

    if (grupoA === 0) {
      // Atrasadas: da mais antiga para a mais recente.
      return new Date(a.lembreteEm!).getTime() - new Date(b.lembreteEm!).getTime();
    }
    if (grupoA === 1) {
      // Com lembrete futuro: do mais próximo para o mais distante.
      return new Date(a.lembreteEm!).getTime() - new Date(b.lembreteEm!).getTime();
    }
    // Sem lembrete: da criação mais recente para a mais antiga.
    return new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime();
  });
}

function grupoDeOrdenacao(tarefa: Tarefa): 0 | 1 | 2 {
  if (tarefa.lembreteEm === null) return 2;
  return estaAtrasada(tarefa.lembreteEm) ? 0 : 1;
}

export type VisaoHoje = {
  comData: Tarefa[];
  semData: Tarefa[];
};

export function agruparHoje(tarefas: Tarefa[]): VisaoHoje {
  const { fim } = limitesDoDiaAtual();
  const pendentes = tarefas.filter((tarefa) => !tarefa.concluida);

  const comData = pendentes.filter(
    (tarefa) => tarefa.lembreteEm !== null && new Date(tarefa.lembreteEm).getTime() <= fim.getTime(),
  );
  const semData = pendentes.filter((tarefa) => tarefa.lembreteEm === null);

  return { comData: ordenarTarefas(comData), semData: ordenarTarefas(semData) };
}

export function ordenarConcluidas(tarefas: Tarefa[]): Tarefa[] {
  return tarefas
    .filter((tarefa) => tarefa.concluida && tarefa.concluidaEm !== null)
    .sort((a, b) => new Date(b.concluidaEm!).getTime() - new Date(a.concluidaEm!).getTime());
}

export type DiaDaSemana = {
  inicio: Date;
  tarefas: Tarefa[];
};

export function agruparSemana(tarefas: Tarefa[]): DiaDaSemana[] {
  const pendentes = tarefas.filter((tarefa) => !tarefa.concluida && tarefa.lembreteEm !== null);
  const dias = limitesDosProximosDias(7);

  return dias.map(({ inicio, fim }) => {
    const tarefasDoDia = pendentes.filter((tarefa) => {
      const momento = new Date(tarefa.lembreteEm!).getTime();
      return momento >= inicio.getTime() && momento <= fim.getTime();
    });
    return { inicio, tarefas: ordenarTarefas(tarefasDoDia) };
  });
}
