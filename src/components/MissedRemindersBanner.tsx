import { X } from 'lucide-react';
import type { Tarefa } from '../types/tarefa';
import { textos } from '../lib/textos';

type MissedRemindersBannerProps = {
  tarefas: Tarefa[];
  onFechar: () => void;
};

export function MissedRemindersBanner({ tarefas, onFechar }: MissedRemindersBannerProps) {
  if (tarefas.length === 0) return null;

  return (
    <div role="alert" className="mb-md rounded-lg border border-outline-variant bg-surface-container-low p-md">
      <div className="mb-xs flex items-start justify-between gap-sm">
        <h2 className="text-label-md text-on-surface">{textos.bannerLembretesPerdidosTitulo}</h2>
        <button
          type="button"
          onClick={onFechar}
          aria-label={textos.botaoFecharBanner}
          className="text-on-surface-variant hover:text-on-surface"
        >
          <X size={16} />
        </button>
      </div>
      <p className="mb-sm text-body-md text-on-surface-variant">{textos.bannerLembretesPerdidosTexto}</p>
      <ul className="flex flex-col gap-xs text-body-md text-on-surface">
        {tarefas.map((tarefa) => (
          <li key={tarefa.id}>• {tarefa.titulo}</li>
        ))}
      </ul>
    </div>
  );
}
