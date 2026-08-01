import type { Dispatch } from 'react';
import type { Tarefa } from '../types/tarefa';
import type { CategoriaDef } from '../types/categoria';
import type { AcaoTarefas } from '../lib/tarefasReducer';
import { textos } from '../lib/textos';
import { TaskItem } from './TaskItem';

type TaskListProps = {
  tarefas: Tarefa[];
  categorias: CategoriaDef[];
  tarefaDestacada: string | null;
  onConcluir: (id: string) => void;
  onExcluir: (id: string) => void;
  dispatch: Dispatch<AcaoTarefas>;
  mensagemVazia?: string;
  somenteExibirConclusao?: boolean;
};

export function TaskList({
  tarefas,
  categorias,
  tarefaDestacada,
  onConcluir,
  onExcluir,
  dispatch,
  mensagemVazia = textos.listaVazia,
  somenteExibirConclusao = false,
}: TaskListProps) {
  if (tarefas.length === 0) {
    return (
      <p className="mt-lg text-center text-body-md text-on-surface-variant">{mensagemVazia}</p>
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      {tarefas.map((tarefa) => (
        <TaskItem
          key={tarefa.id}
          tarefa={tarefa}
          categorias={categorias}
          destacada={tarefa.id === tarefaDestacada}
          onConcluir={onConcluir}
          onExcluir={onExcluir}
          dispatch={dispatch}
          somenteExibirConclusao={somenteExibirConclusao}
        />
      ))}
    </div>
  );
}
