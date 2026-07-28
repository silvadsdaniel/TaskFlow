import { textos } from '../lib/textos';

export type Visao = 'hoje' | 'semana';

type ViewTabsProps = {
  visao: Visao;
  onMudar: (visao: Visao) => void;
};

export function ViewTabs({ visao, onMudar }: ViewTabsProps) {
  return (
    <nav className="mb-md flex w-full gap-xs rounded-lg border border-outline-variant bg-surface-container-low p-xs">
      <button
        type="button"
        onClick={() => onMudar('hoje')}
        aria-pressed={visao === 'hoje'}
        className={`flex-1 rounded py-sm text-label-md transition-all ${
          visao === 'hoje' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'
        }`}
      >
        {textos.abaHoje}
      </button>
      <button
        type="button"
        onClick={() => onMudar('semana')}
        aria-pressed={visao === 'semana'}
        className={`flex-1 rounded py-sm text-label-md transition-all ${
          visao === 'semana' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'
        }`}
      >
        {textos.abaSemana}
      </button>
    </nav>
  );
}
