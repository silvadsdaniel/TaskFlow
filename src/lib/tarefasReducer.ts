import type { Categoria, EstadoPersistido, Tarefa } from '../types/tarefa';

export type AcaoTarefas =
  | { tipo: 'adicionar'; titulo: string; categoria: Categoria | null; lembreteEm: string | null }
  | { tipo: 'concluir'; id: string }
  | { tipo: 'excluir'; id: string }
  | { tipo: 'editarTitulo'; id: string; titulo: string }
  | { tipo: 'marcarNotificada'; id: string };

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
        nota: null,
        categoria: acao.categoria,
        lembreteEm: acao.lembreteEm,
        concluida: false,
        criadaEm: new Date().toISOString(),
        concluidaEm: null,
        notificada: false,
        origem: 'texto',
      };
      return { ...estado, tarefas: [novaTarefa, ...estado.tarefas] };
    }

    case 'concluir': {
      return {
        ...estado,
        tarefas: estado.tarefas.map((tarefa) =>
          tarefa.id === acao.id
            ? { ...tarefa, concluida: true, concluidaEm: new Date().toISOString() }
            : tarefa,
        ),
      };
    }

    case 'excluir': {
      return {
        ...estado,
        tarefas: estado.tarefas.filter((tarefa) => tarefa.id !== acao.id),
      };
    }

    case 'editarTitulo': {
      const titulo = acao.titulo.trim();
      if (titulo.length === 0) return estado;

      return {
        ...estado,
        tarefas: estado.tarefas.map((tarefa) =>
          tarefa.id === acao.id ? { ...tarefa, titulo } : tarefa,
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

    default:
      return estado;
  }
}
