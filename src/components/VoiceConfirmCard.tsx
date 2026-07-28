import { useEffect, useRef, useState } from 'react';
import { Check, Mic, Trash2 } from 'lucide-react';
import { textos } from '../lib/textos';
import { CATEGORIAS } from '../lib/categorias';
import type { Categoria } from '../types/tarefa';
import { CategoryChip } from './CategoryChip';
import { valorDatetimeLocalParaIso, valorMinimoDatetimeLocal } from '../lib/datas';

export type SugestaoTarefa = {
  titulo: string;
  nota: string | null;
  categoria: Categoria | null;
  lembreteEm: string | null;
  tituloFocado: boolean;
  avisoData?: string;
};

type VoiceConfirmCardProps = {
  sugestao: SugestaoTarefa;
  onConfirmar: (titulo: string, categoria: Categoria | null, lembreteEm: string | null, nota: string | null) => void;
  onDescartar: () => void;
};

function paraValorDatetimeLocal(iso: string | null): string {
  if (iso === null) return '';
  return iso.slice(0, 16);
}

export function VoiceConfirmCard({ sugestao, onConfirmar, onDescartar }: VoiceConfirmCardProps) {
  const [titulo, setTitulo] = useState(sugestao.titulo);
  const [nota, setNota] = useState(sugestao.nota ?? '');
  const [categoria, setCategoria] = useState<Categoria | null>(sugestao.categoria);
  const [valorLembrete, setValorLembrete] = useState(paraValorDatetimeLocal(sugestao.lembreteEm));
  const inputTituloRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sugestao.tituloFocado) inputTituloRef.current?.focus();
  }, [sugestao.tituloFocado]);

  function handleConfirmar() {
    const tituloFinal = titulo.trim();
    if (tituloFinal === '') return;
    const lembreteEm = valorLembrete === '' ? null : valorDatetimeLocalParaIso(valorLembrete);
    onConfirmar(tituloFinal, categoria, lembreteEm, nota.trim() === '' ? null : nota.trim());
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-confirm-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 p-md backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-lg border border-primary bg-surface p-md">
        <div className="mb-md flex items-center justify-between">
          <span className="flex items-center gap-xs rounded-full bg-primary-container px-sm py-1 text-label-sm text-on-primary-container">
            <Mic size={14} />
            {textos.badgeEntradaPorVoz}
          </span>
        </div>

        <div className="flex flex-col gap-md">
          <div className="border-b border-outline-variant pb-xs">
            <label htmlFor="voice-confirm-titulo" className="text-label-sm text-on-surface-variant">
              {textos.rotuloTituloTarefa}
            </label>
            <input
              id="voice-confirm-titulo"
              ref={inputTituloRef}
              value={titulo}
              onChange={(evento) => setTitulo(evento.target.value)}
              maxLength={200}
              className="w-full bg-transparent py-xs text-display-md-mobile text-on-surface focus:outline-none"
            />
          </div>

          <div className="border-b border-outline-variant pb-xs">
            <label htmlFor="voice-confirm-nota" className="text-label-sm text-on-surface-variant">
              {textos.rotuloNota}
            </label>
            <textarea
              id="voice-confirm-nota"
              value={nota}
              onChange={(evento) => setNota(evento.target.value)}
              placeholder={textos.placeholderNota}
              rows={2}
              className="w-full resize-none bg-transparent py-xs text-body-md text-on-surface focus:outline-none"
            />
          </div>

          <div>
            <span className="text-label-sm text-on-surface-variant">{textos.rotuloCategoriaCard}</span>
            <div className="no-scrollbar mt-xs flex gap-sm overflow-x-auto">
              {CATEGORIAS.map((opcao) => (
                <CategoryChip
                  key={opcao}
                  categoria={opcao}
                  ativo={categoria === opcao}
                  onClick={() => setCategoria((atual) => (atual === opcao ? null : opcao))}
                />
              ))}
            </div>
          </div>

          <div className="border-b border-outline-variant pb-xs">
            <label htmlFor="voice-confirm-lembrete" className="text-label-sm text-on-surface-variant">
              {textos.rotuloLembreteCard}
            </label>
            <input
              id="voice-confirm-lembrete"
              type="datetime-local"
              value={valorLembrete}
              min={valorMinimoDatetimeLocal()}
              onChange={(evento) => setValorLembrete(evento.target.value)}
              className="w-full bg-transparent py-xs text-body-md text-on-surface focus:outline-none"
            />
            {sugestao.avisoData && (
              <p className="pb-xs text-label-sm text-error">{sugestao.avisoData}</p>
            )}
          </div>
        </div>

        <div className="mt-md flex gap-sm">
          <button
            type="button"
            onClick={onDescartar}
            className="flex flex-1 items-center justify-center gap-sm rounded-lg border border-outline-variant py-sm text-label-md text-on-surface-variant hover:bg-surface-container-high"
          >
            <Trash2 size={18} />
            {textos.botaoDescartar}
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            className="flex flex-1 items-center justify-center gap-sm rounded-lg bg-inverse-surface py-sm text-label-md text-inverse-on-surface hover:opacity-90"
          >
            <Check size={18} />
            {textos.botaoConfirmarTarefa}
          </button>
        </div>
      </div>
    </div>
  );
}
