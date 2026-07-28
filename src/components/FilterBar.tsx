import type { Categoria } from '../types/tarefa';
import { CATEGORIAS } from '../lib/categorias';
import { textos } from '../lib/textos';
import { CategoryChip } from './CategoryChip';

type FilterBarProps = {
  categoriasSelecionadas: Categoria[];
  onAlternar: (categoria: Categoria) => void;
  onLimpar: () => void;
};

export function FilterBar({ categoriasSelecionadas, onAlternar, onLimpar }: FilterBarProps) {
  const todasAtiva = categoriasSelecionadas.length === 0;

  return (
    <div className="no-scrollbar flex gap-sm overflow-x-auto pb-sm">
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
      {CATEGORIAS.map((categoria) => (
        <CategoryChip
          key={categoria}
          categoria={categoria}
          ativo={categoriasSelecionadas.includes(categoria)}
          onClick={() => onAlternar(categoria)}
        />
      ))}
    </div>
  );
}
