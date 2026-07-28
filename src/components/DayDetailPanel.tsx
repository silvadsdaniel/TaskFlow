import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, X } from 'lucide-react';
import type { Tarefa } from '../types/tarefa';
import { textos } from '../lib/textos';
import { capitalizarPrimeiraLetra } from '../lib/formatacao';
import { TaskList } from './TaskList';

type DayDetailPanelProps = {
  dia: Date;
  tarefas: Tarefa[];
  tarefaDestacada: string | null;
  onFechar: () => void;
  onConcluir: (id: string) => void;
  onExcluir: (id: string) => void;
  onAdicionarNoDia: (titulo: string) => void;
};

export function DayDetailPanel({
  dia,
  tarefas,
  tarefaDestacada,
  onFechar,
  onConcluir,
  onExcluir,
  onAdicionarNoDia,
}: DayDetailPanelProps) {
  const [novoTitulo, setNovoTitulo] = useState('');

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    if (novoTitulo.trim() === '') return;
    onAdicionarNoDia(novoTitulo);
    setNovoTitulo('');
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-inverse-surface/30 p-md backdrop-blur-sm"
    >
      <div className="mx-auto max-h-[75vh] w-full max-w-[640px] overflow-y-auto rounded-lg border border-outline-variant bg-surface p-md">
        <div className="mb-md flex items-center justify-between">
          <h2 className="text-display-md-mobile text-on-surface">
            {capitalizarPrimeiraLetra(format(dia, "EEEE, d 'de' MMMM", { locale: ptBR }))}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label={textos.botaoFechar}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <X size={20} />
          </button>
        </div>

        <TaskList
          tarefas={tarefas}
          tarefaDestacada={tarefaDestacada}
          onConcluir={onConcluir}
          onExcluir={onExcluir}
        />

        <form
          onSubmit={handleSubmit}
          className="mt-md flex items-center gap-xs rounded-full border border-outline-variant p-xs"
        >
          <input
            value={novoTitulo}
            onChange={(evento) => setNovoTitulo(evento.target.value)}
            placeholder={textos.placeholderNovaTarefa}
            maxLength={200}
            className="flex-grow bg-transparent px-sm text-body-md text-on-surface focus:outline-none"
          />
          <button
            type="submit"
            aria-label={textos.botaoAdicionar}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary"
          >
            <Plus size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
