import { useState } from 'react';
import { Bell, Plus, X } from 'lucide-react';
import { textos } from '../lib/textos';
import type { Categoria } from '../types/tarefa';
import type { CategoriaDef } from '../types/categoria';
import { CategoryChip } from './CategoryChip';
import { valorDatetimeLocalParaIso, valorMinimoDatetimeLocal } from '../lib/datas';
import { VoiceButton } from './VoiceButton';
import { suportadoReconhecimentoVoz } from '../lib/voz';

type TaskFormProps = {
  categorias: CategoriaDef[];
  onAdicionar: (titulo: string, categoria: Categoria | null, lembreteEm: string | null) => void;
  onIniciarVoz: () => void;
};

export function TaskForm({ categorias, onAdicionar, onIniciarVoz }: TaskFormProps) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [valorLembrete, setValorLembrete] = useState('');

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    const lembreteEm = valorLembrete === '' ? null : valorDatetimeLocalParaIso(valorLembrete);
    onAdicionar(titulo, categoria, lembreteEm);
    setTitulo('');
    setCategoria(null);
    setValorLembrete('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 flex w-full flex-col items-center gap-sm p-md"
    >
      {titulo.length > 0 && (
        <div className="flex w-full max-w-[640px] flex-col gap-sm">
          <div className="no-scrollbar flex gap-sm overflow-x-auto">
            {categorias.map((opcao) => (
              <CategoryChip
                key={opcao.id}
                categoria={opcao}
                ativo={categoria === opcao.id}
                onClick={() => setCategoria((atual) => (atual === opcao.id ? null : opcao.id))}
              />
            ))}
          </div>
          <div className="flex items-center gap-sm rounded-lg border border-outline-variant bg-surface px-md py-sm">
            <Bell size={16} className="shrink-0 text-on-surface-variant" />
            <input
              type="datetime-local"
              value={valorLembrete}
              min={valorMinimoDatetimeLocal()}
              onChange={(evento) => setValorLembrete(evento.target.value)}
              aria-label={textos.botaoLembrete}
              className="flex-grow bg-transparent text-body-md text-on-surface focus:outline-none"
            />
            {valorLembrete !== '' && (
              <button
                type="button"
                onClick={() => setValorLembrete('')}
                aria-label={textos.botaoRemoverLembrete}
                className="text-on-surface-variant hover:text-error"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex w-full max-w-[640px] items-center gap-xs rounded-full border border-outline-variant bg-surface p-xs shadow-xl">
        <input
          value={titulo}
          onChange={(evento) => setTitulo(evento.target.value)}
          placeholder={textos.placeholderNovaTarefa}
          maxLength={200}
          className="flex-grow bg-transparent px-sm text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none"
        />
        {titulo === '' && suportadoReconhecimentoVoz() && <VoiceButton onClick={onIniciarVoz} />}
        <button
          type="submit"
          disabled={titulo.trim() === ''}
          aria-label={textos.botaoAdicionar}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
        >
          <Plus size={20} />
        </button>
      </div>
    </form>
  );
}
