import { Settings, Tag } from 'lucide-react';
import type { Categoria } from '../types/tarefa';
import type { CategoriaDef } from '../types/categoria';
import { textos } from '../lib/textos';
import { CategoryChip } from './CategoryChip';

type FilterBarProps = {
  categorias: CategoriaDef[];
  categoriasSelecionadas: Categoria[];
  tagsDisponiveis: string[];
  tagsSelecionadas: string[];
  onAlternar: (categoria: Categoria) => void;
  onAlternarTag: (tag: string) => void;
  onLimpar: () => void;
  onGerenciarCategorias: () => void;
};

export function FilterBar({
  categorias,
  categoriasSelecionadas,
  tagsDisponiveis,
  tagsSelecionadas,
  onAlternar,
  onAlternarTag,
  onLimpar,
  onGerenciarCategorias,
}: FilterBarProps) {
  const todasAtiva = categoriasSelecionadas.length === 0 && tagsSelecionadas.length === 0;

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center gap-sm">
        <div className="no-scrollbar flex flex-1 gap-sm overflow-x-auto pb-sm">
          <button
            type="button"
            onClick={onLimpar}
            aria-pressed={todasAtiva}
            className={`flex shrink-0 items-center rounded-full px-md py-1.5 text-label-md transition-all ${
              todasAtiva
                ? 'bg-primary text-on-primary'
                : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {textos.filtroTodas}
          </button>
          {categorias.map((categoria) => (
            <CategoryChip
              key={categoria.id}
              categoria={categoria}
              ativo={categoriasSelecionadas.includes(categoria.id)}
              onClick={() => onAlternar(categoria.id)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onGerenciarCategorias}
          aria-label={textos.botaoGerenciarCategorias}
          className="mb-sm shrink-0 rounded-full p-sm text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
        >
          <Settings size={18} />
        </button>
      </div>

      {tagsDisponiveis.length > 0 && (
        <div
          className="no-scrollbar flex items-center gap-sm overflow-x-auto pb-sm"
          aria-label={textos.filtrarPorTags}
        >
          <Tag size={14} className="shrink-0 text-on-surface-variant" aria-hidden="true" />
          {tagsDisponiveis.map((tag) => {
            const ativo = tagsSelecionadas.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onAlternarTag(tag)}
                aria-pressed={ativo}
                className={`flex shrink-0 items-center rounded-full border px-sm py-1 text-label-sm transition-all ${
                  ativo
                    ? 'border-transparent bg-secondary text-on-secondary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
