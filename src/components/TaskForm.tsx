import { useState } from 'react';
import { Bell, Plus, Star, Tag, X } from 'lucide-react';
import { textos } from '../lib/textos';
import type { Categoria, Prioridade, Recorrencia } from '../types/tarefa';
import type { CategoriaDef } from '../types/categoria';
import { CategoryChip } from './CategoryChip';
import { RecurrenceField } from './RecurrenceField';
import { valorDatetimeLocalParaIso, valorMinimoDatetimeLocal } from '../lib/datas';
import { recorrenciaValida } from '../lib/recorrencia';
import { VoiceButton } from './VoiceButton';
import { suportadoReconhecimentoVoz } from '../lib/voz';

type TaskFormProps = {
  categorias: CategoriaDef[];
  onAdicionar: (
    titulo: string,
    categoria: Categoria | null,
    lembreteEm: string | null,
    tags: string[],
    recorrencia: Recorrencia | null,
    prioridade: Prioridade,
  ) => void;
  onIniciarVoz: () => void;
};

export function TaskForm({ categorias, onAdicionar, onIniciarVoz }: TaskFormProps) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [valorLembrete, setValorLembrete] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [novaTag, setNovaTag] = useState('');
  const [recorrencia, setRecorrencia] = useState<Recorrencia | null>(null);
  const [prioridade, setPrioridade] = useState<Prioridade>('normal');

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    const lembreteEm = valorLembrete === '' ? null : valorDatetimeLocalParaIso(valorLembrete);
    onAdicionar(
      titulo,
      categoria,
      lembreteEm,
      tags,
      lembreteEm === null ? null : recorrenciaValida(recorrencia),
      prioridade,
    );
    setTitulo('');
    setCategoria(null);
    setValorLembrete('');
    setTags([]);
    setNovaTag('');
    setRecorrencia(null);
    setPrioridade('normal');
  }

  function adicionarTag() {
    const tag = novaTag.trim();
    if (tag === '' || tags.includes(tag)) {
      setNovaTag('');
      return;
    }
    setTags((atuais) => [...atuais, tag]);
    setNovaTag('');
  }

  function handleTeclaTag(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Enter' || evento.key === ',') {
      evento.preventDefault();
      adicionarTag();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 flex w-full flex-col items-center gap-sm p-md"
    >
      {titulo.length > 0 && (
        <div className="flex w-full max-w-[640px] flex-col gap-sm rounded-lg border border-outline-variant bg-surface p-sm">
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

          <div className="flex items-center gap-sm rounded-lg border border-outline-variant px-md py-sm">
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

          {valorLembrete !== '' && <RecurrenceField recorrencia={recorrencia} onMudar={setRecorrencia} />}

          <div className="flex items-center gap-sm rounded-lg border border-outline-variant px-md py-sm">
            <Tag size={16} className="shrink-0 text-on-surface-variant" />
            <input
              value={novaTag}
              onChange={(evento) => setNovaTag(evento.target.value)}
              onKeyDown={handleTeclaTag}
              onBlur={adicionarTag}
              placeholder={textos.placeholderNovaTag}
              maxLength={40}
              aria-label={textos.rotuloTags}
              className="flex-grow bg-transparent text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none"
            />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-xs">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags((atuais) => atuais.filter((t) => t !== tag))}
                  aria-label={`${textos.botaoRemoverTag}: ${tag}`}
                  className="flex items-center gap-xs rounded-full bg-surface-container-high px-sm py-1 text-label-sm text-on-surface-variant hover:text-error"
                >
                  #{tag}
                  <X size={12} />
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setPrioridade((atual) => (atual === 'importante' ? 'normal' : 'importante'))}
            aria-pressed={prioridade === 'importante'}
            aria-label={textos.rotuloPrioridade}
            className={`flex items-center justify-center gap-xs self-start rounded-full border px-md py-1.5 text-label-md transition-all ${
              prioridade === 'importante'
                ? 'border-transparent bg-tertiary text-on-tertiary'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Star size={14} fill={prioridade === 'importante' ? 'currentColor' : 'none'} />
            {textos.rotuloPrioridade}
          </button>
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
