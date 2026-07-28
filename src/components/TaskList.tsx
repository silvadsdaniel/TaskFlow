import type { Tarefa } from '../types/tarefa';
import { textos } from '../lib/textos';
import { TaskItem } from './TaskItem';

type TaskListProps = {
  tarefas: Tarefa[];
  tarefaDestacada: string | null;
  onConcluir: (id: string) => void;
  onExcluir: (id: string) => void;
};

export function TaskList({ tarefas, tarefaDestacada, onConcluir, onExcluir }: TaskListProps) {
  if (tarefas.length === 0) {
    return (
      <p className="mt-lg text-center text-body-md text-on-surface-variant">
        {textos.listaVazia}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      {tarefas.map((tarefa) => (
        <TaskItem
          key={tarefa.id}
          tarefa={tarefa}
          destacada={tarefa.id === tarefaDestacada}
          onConcluir={onConcluir}
          onExcluir={onExcluir}
        />
      ))}
    </div>
  );
}
