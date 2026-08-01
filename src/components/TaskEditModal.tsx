import { useState } from 'react';
import { Bell, Check, Tag, X } from 'lucide-react';
import { textos } from '../lib/textos';
import type { Categoria, Prioridade, Recorrencia, Tarefa } from '../types/tarefa';
import type { CategoriaDef } from '../types/categoria';
import { CategoryChip } from './CategoryChip';
import { RecurrenceField } from './RecurrenceField';
import { isoParaValorDatetimeLocal, valorDatetimeLocalParaIso } from '../lib/datas';
import { recorrenciaValida } from '../lib/recorrencia';

type TaskEditModalProps = {
  tarefa: Tarefa;
  categorias: CategoriaDef[];
  onFechar: () => void;
  onSalvar: (
    id: string,
    titulo: string,
    nota: string | null,
    categoria: Categoria | null,
    tags: string[],
    lembreteEm: string | null,
    recorrencia: Recorrencia | null,
    prioridade: Prioridade,
  ) => void;
};

export function TaskEditModal({ tarefa, categorias, onFechar, onSalvar }: TaskEditModalProps) {
  const [titulo, setTitulo] = useState(tarefa.titulo);
  const [nota, setNota] = useState(tarefa.nota ?? '');
  const [categoria, setCategoria] = useState<Categoria | null>(tarefa.categoria);
  const [tags, setTags] = useState<string[]>(tarefa.tags);
  const [novaTag, setNovaTag] = useState('');
  const [valorLembrete, setValorLembrete] = useState(
    tarefa.lembreteEm === null ? '' : isoParaValorDatetimeLocal(tarefa.lembreteEm),
  );
  const [recorrencia, setRecorrencia] = useState<Recorrencia | null>(tarefa.recorrencia);
  const [prioridade, setPrioridade] = useState<Prioridade>(tarefa.prioridade);

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

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    if (titulo.trim() === '') return;
    const lembreteEm = valorLembrete === '' ? null : valorDatetimeLocalParaIso(valorLembrete);
    onSalvar(
      tarefa.id,
      titulo,
      nota.trim() === '' ? null : nota,
      categoria,
      tags,
      lembreteEm,
      lembreteEm === null ? null : recorrenciaValida(recorrencia),
      prioridade,
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-edit-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 p-md backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[85vh] w-full max-w-md flex-col gap-sm overflow-y-auto rounded-lg border border-outline-variant bg-surface p-md"
      >
        <div className="mb-xs flex items-center justify-between">
          <h2 id="task-edit-titulo" className="text-display-md-mobile text-on-surface">
            {textos.tituloEditarTarefa}
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

        <label className="flex flex-col gap-xs">
          <span className="text-label-md text-on-surface-variant">{textos.rotuloTituloTarefa}</span>
          <input
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            maxLength={200}
            autoFocus
            className="rounded-lg border border-outline-variant bg-transparent px-md py-sm text-body-md text-on-surface focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-xs">
          <span className="text-label-md text-on-surface-variant">{textos.rotuloNota}</span>
          <textarea
            value={nota}
            onChange={(evento) => setNota(evento.target.value)}
            placeholder={textos.placeholderNota}
            rows={2}
            className="rounded-lg border border-outline-variant bg-transparent px-md py-sm text-body-md text-on-surface focus:border-primary focus:outline-none"
          />
        </label>

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
          {textos.rotuloPrioridade}
        </button>

        <div className="mt-sm flex justify-end gap-sm">
          <button
            type="button"
            onClick={onFechar}
            className="rounded px-md py-xs text-label-md text-on-surface-variant hover:bg-surface-container-high"
          >
            {textos.botaoCancelarEdicao}
          </button>
          <button
            type="submit"
            disabled={titulo.trim() === ''}
            className="flex items-center gap-xs rounded bg-primary px-md py-xs text-label-md text-on-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Check size={16} />
            {textos.botaoSalvarEdicao}
          </button>
        </div>
      </form>
    </div>
  );
}
