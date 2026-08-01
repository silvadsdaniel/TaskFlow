import type { Categoria, EstadoPersistido, Prioridade, Recorrencia, Tarefa } from '../types/tarefa';
import { proximaOcorrencia } from './datas';

export type AcaoTarefas =
  | {
      tipo: 'adicionar';
      titulo: string;
      categoria: Categoria | null;
      lembreteEm: string | null;
      nota: string | null;
      origem: 'texto' | 'voz';
      tags?: string[];
      recorrencia?: Recorrencia | null;
      prioridade?: Prioridade;
    }
  | { tipo: 'concluir'; id: string }
  | { tipo: 'excluir'; id: string }
  | {
      tipo: 'editar';
      id: string;
      titulo: string;
      nota: string | null;
      categoria: Categoria | null;
      tags: string[];
      lembreteEm: string | null;
      recorrencia: Recorrencia | null;
      prioridade: Prioridade;
    }
  | { tipo: 'marcarNotificada'; id: string }
  | { tipo: 'substituirTudo'; tarefas: Tarefa[] }
  | { tipo: 'adicionarSubtarefa'; id: string; texto: string }
  | { tipo: 'alternarSubtarefa'; id: string; subtarefaId: string }
  | { tipo: 'removerSubtarefa'; id: string; subtarefaId: string }
  | { tipo: 'editarSubtarefa'; id: string; subtarefaId: string; texto: string };

export function tarefasReducer(
  estado: EstadoPersistido,
  acao: AcaoTarefas,
): EstadoPersistido {
  switch (acao.tipo) {
    case 'adicionar': {
      const titulo = acao.titulo.trim();
      if (titulo.length === 0) return estado;

      const novaTarefa: Tarefa = {
        id: crypto.randomUUID(),
        titulo,
        nota: acao.nota,
        categoria: acao.categoria,
        tags: acao.tags ?? [],
        lembreteEm: acao.lembreteEm,
        recorrencia: acao.recorrencia ?? null,
        prioridade: acao.prioridade ?? 'normal',
        subtarefas: [],
        concluida: false,
        criadaEm: new Date().toISOString(),
        concluidaEm: null,
        notificada: false,
        origem: acao.origem,
      };
      return { ...estado, tarefas: [novaTarefa, ...estado.tarefas] };
    }

    case 'concluir': {
      const tarefaConcluida = estado.tarefas.find((tarefa) => tarefa.id === acao.id);
      const tarefas = estado.tarefas.map((tarefa) =>
        tarefa.id === acao.id
          ? { ...tarefa, concluida: true, concluidaEm: new Date().toISOString() }
          : tarefa,
      );

      // Só faz sentido gerar a próxima ocorrência quando há uma data de
      // referência para deslocar — sem lembrete, recorrência é ignorada.
      if (tarefaConcluida && tarefaConcluida.recorrencia !== null && tarefaConcluida.lembreteEm !== null) {
        const proximaTarefa: Tarefa = {
          ...tarefaConcluida,
          id: crypto.randomUUID(),
          lembreteEm: proximaOcorrencia(tarefaConcluida.lembreteEm, tarefaConcluida.recorrencia),
          subtarefas: tarefaConcluida.subtarefas.map((subtarefa) => ({ ...subtarefa, concluida: false })),
          concluida: false,
          criadaEm: new Date().toISOString(),
          concluidaEm: null,
          notificada: false,
        };
        return { ...estado, tarefas: [proximaTarefa, ...tarefas] };
      }

      return { ...estado, tarefas };
    }

    case 'excluir': {
      return {
        ...estado,
        tarefas: estado.tarefas.filter((tarefa) => tarefa.id !== acao.id),
      };
    }

    case 'editar': {
      const titulo = acao.titulo.trim();
      if (titulo.length === 0) return estado;

      return {
        ...estado,
        tarefas: estado.tarefas.map((tarefa) =>
          tarefa.id === acao.id
            ? {
                ...tarefa,
                titulo,
                nota: acao.nota,
                categoria: acao.categoria,
                tags: acao.tags,
                lembreteEm: acao.lembreteEm,
                recorrencia: acao.lembreteEm === null ? null : acao.recorrencia,
                prioridade: acao.prioridade,
              }
            : tarefa,
        ),
      };
    }

    case 'marcarNotificada': {
      return {
        ...estado,
        tarefas: estado.tarefas.map((tarefa) =>
          tarefa.id === acao.id ? { ...tarefa, notificada: true } : tarefa,
        ),
      };
    }

    case 'substituirTudo': {
      return { ...estado, tarefas: acao.tarefas };
    }

    case 'adicionarSubtarefa': {
      const texto = acao.texto.trim();
      if (texto.length === 0) return estado;

      return {
        ...estado,
        tarefas: estado.tarefas.map((tarefa) =>
          tarefa.id === acao.id
            ? {
                ...tarefa,
                subtarefas: [...tarefa.subtarefas, { id: crypto.randomUUID(), texto, concluida: false }],
              }
            : tarefa,
        ),
      };
    }

    case 'alternarSubtarefa': {
      return {
        ...estado,
        tarefas: estado.tarefas.map((tarefa) =>
          tarefa.id === acao.id
            ? {
                ...tarefa,
                subtarefas: tarefa.subtarefas.map((subtarefa) =>
                  subtarefa.id === acao.subtarefaId
                    ? { ...subtarefa, concluida: !subtarefa.concluida }
                    : subtarefa,
                ),
              }
            : tarefa,
        ),
      };
    }

    case 'removerSubtarefa': {
      return {
        ...estado,
        tarefas: estado.tarefas.map((tarefa) =>
          tarefa.id === acao.id
            ? { ...tarefa, subtarefas: tarefa.subtarefas.filter((subtarefa) => subtarefa.id !== acao.subtarefaId) }
            : tarefa,
        ),
      };
    }

    case 'editarSubtarefa': {
      const texto = acao.texto.trim();
      if (texto.length === 0) return estado;

      return {
        ...estado,
        tarefas: estado.tarefas.map((tarefa) =>
          tarefa.id === acao.id
            ? {
                ...tarefa,
                subtarefas: tarefa.subtarefas.map((subtarefa) =>
                  subtarefa.id === acao.subtarefaId ? { ...subtarefa, texto } : subtarefa,
                ),
              }
            : tarefa,
        ),
      };
    }

    default:
      return estado;
  }
}
