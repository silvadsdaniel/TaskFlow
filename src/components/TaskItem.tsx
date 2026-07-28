import { Trash2 } from 'lucide-react';
import type { Tarefa } from '../types/tarefa';
import { textos } from '../lib/textos';

type TaskItemProps = {
  tarefa: Tarefa;
  onConcluir: (id: string) => void;
  onExcluir: (id: string) => void;
};

export function TaskItem({ tarefa, onConcluir, onExcluir }: TaskItemProps) {
  return (
    <div className="group flex items-center gap-md rounded-lg border border-outline-variant bg-surface p-md">
      <input
        type="checkbox"
        checked={tarefa.concluida}
        onChange={() => onConcluir(tarefa.id)}
        aria-label={tarefa.titulo}
        className="h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-[4px] border-2 border-outline-variant checked:border-primary checked:bg-primary"
      />
      <span
        className={`flex-grow text-body-lg text-on-surface ${
          tarefa.concluida ? 'text-on-surface-variant line-through' : ''
        }`}
      >
        {tarefa.titulo}
      </span>
      <button
        type="button"
        onClick={() => onExcluir(tarefa.id)}
        aria-label={textos.botaoExcluir}
        className="text-on-surface-variant opacity-0 transition-opacity hover:text-error focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
