import { Trash2 } from 'lucide-react';
import type { Tarefa } from '../types/tarefa';
import { textos } from '../lib/textos';
import { corCategoria, rotuloCategoria } from '../lib/categorias';

type TaskItemProps = {
  tarefa: Tarefa;
  onConcluir: (id: string) => void;
  onExcluir: (id: string) => void;
};

export function TaskItem({ tarefa, onConcluir, onExcluir }: TaskItemProps) {
  return (
    <div className="group relative flex items-center gap-md overflow-hidden rounded-lg border border-outline-variant bg-surface p-md">
      {tarefa.categoria && (
        <div className={`absolute bottom-0 left-0 top-0 w-1 ${corCategoria[tarefa.categoria]}`} />
      )}
      <input
        type="checkbox"
        checked={tarefa.concluida}
        onChange={() => onConcluir(tarefa.id)}
        aria-label={tarefa.titulo}
        className="h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-[4px] border-2 border-outline-variant checked:border-primary checked:bg-primary"
      />
      <div className="flex flex-grow flex-col gap-xs">
        <span
          className={`text-body-lg text-on-surface ${
            tarefa.concluida ? 'text-on-surface-variant line-through' : ''
          }`}
        >
          {tarefa.titulo}
        </span>
        {tarefa.categoria && (
          <span className="flex items-center gap-xs text-label-sm text-on-surface-variant">
            <span className={`h-1.5 w-1.5 rounded-full ${corCategoria[tarefa.categoria]}`} />
            {rotuloCategoria[tarefa.categoria]}
          </span>
        )}
      </div>
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
