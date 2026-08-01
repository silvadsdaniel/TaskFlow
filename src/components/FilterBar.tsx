import { Settings } from 'lucide-react';
import type { Categoria } from '../types/tarefa';
import type { CategoriaDef } from '../types/categoria';
import { textos } from '../lib/textos';
import { CategoryChip } from './CategoryChip';

type FilterBarProps = {
  categorias: CategoriaDef[];
  categoriasSelecionadas: Categoria[];
  onAlternar: (categoria: Categoria) => void;
  onLimpar: () => void;
  onGerenciarCategorias: () => void;
};

export function FilterBar({
  categorias,
  categoriasSelecionadas,
  onAlternar,
  onLimpar,
  onGerenciarCategorias,
}: FilterBarProps) {
  const todasAtiva = categoriasSelecionadas.length === 0;

  return (
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
  );
}
