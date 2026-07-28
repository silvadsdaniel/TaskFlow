import { useEffect, useRef } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Tarefa } from '../types/tarefa';
import { textos } from '../lib/textos';
import { corCategoria, rotuloCategoria } from '../lib/categorias';
import { estaAtrasada } from '../lib/datas';

type TaskItemProps = {
  tarefa: Tarefa;
  destacada: boolean;
  onConcluir: (id: string) => void;
  onExcluir: (id: string) => void;
};

export function TaskItem({ tarefa, destacada, onConcluir, onExcluir }: TaskItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (destacada) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [destacada]);

  const atrasada = !tarefa.concluida && estaAtrasada(tarefa.lembreteEm);

  return (
    <div
      ref={ref}
      className={`group relative flex items-center gap-md overflow-hidden rounded-lg border bg-surface p-md transition-colors duration-300 ${
        destacada ? 'border-primary bg-primary-container/10' : 'border-outline-variant'
      }`}
    >
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
        <div className="flex flex-wrap items-center gap-sm">
          {tarefa.categoria && (
            <span className="flex items-center gap-xs text-label-sm text-on-surface-variant">
              <span className={`h-1.5 w-1.5 rounded-full ${corCategoria[tarefa.categoria]}`} />
              {rotuloCategoria[tarefa.categoria]}
            </span>
          )}
          {tarefa.lembreteEm && (
            <span
              className={`flex items-center gap-xs text-label-sm ${
                atrasada ? 'text-error' : 'text-on-surface-variant'
              }`}
            >
              <Bell size={12} />
              {format(new Date(tarefa.lembreteEm), "d 'de' MMM, HH:mm", { locale: ptBR })}
            </span>
          )}
        </div>
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
