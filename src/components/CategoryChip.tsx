import type { Categoria } from '../types/tarefa';
import { corCategoria, rotuloCategoria } from '../lib/categorias';

type CategoryChipProps = {
  categoria: Categoria;
  ativo: boolean;
  onClick: () => void;
};

export function CategoryChip({ categoria, ativo, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`flex shrink-0 items-center gap-xs rounded-full border px-md py-1.5 text-label-md transition-all ${
        ativo
          ? `border-transparent text-on-surface ${corCategoria[categoria]}`
          : 'border-outline-variant bg-transparent text-on-surface-variant hover:bg-surface-container-high'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${corCategoria[categoria]}`} />
      {rotuloCategoria[categoria]}
    </button>
  );
}
