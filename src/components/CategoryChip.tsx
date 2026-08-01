import type { CategoriaDef } from '../types/categoria';

type CategoryChipProps = {
  categoria: CategoriaDef;
  ativo: boolean;
  onClick: () => void;
};

export function CategoryChip({ categoria, ativo, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      style={ativo ? { backgroundColor: categoria.cor } : undefined}
      className={`flex shrink-0 items-center gap-xs rounded-full border px-md py-1.5 text-label-md transition-all ${
        ativo
          ? 'border-transparent text-on-surface'
          : 'border-outline-variant bg-transparent text-on-surface-variant hover:bg-surface-container-high'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: categoria.cor }} />
      {categoria.nome}
    </button>
  );
}
