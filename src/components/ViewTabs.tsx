import { textos } from '../lib/textos';

export type Visao = 'hoje' | 'semana' | 'calendario' | 'concluidas';

type ViewTabsProps = {
  visao: Visao;
  onMudar: (visao: Visao) => void;
};

const ABAS: { visao: Visao; rotulo: string }[] = [
  { visao: 'hoje', rotulo: textos.abaHoje },
  { visao: 'semana', rotulo: textos.abaSemana },
  { visao: 'calendario', rotulo: textos.abaCalendario },
  { visao: 'concluidas', rotulo: textos.abaConcluidas },
];

export function ViewTabs({ visao, onMudar }: ViewTabsProps) {
  return (
    <nav className="mb-md flex w-full gap-xs rounded-lg border border-outline-variant bg-surface-container-low p-xs">
      {ABAS.map((aba) => (
        <button
          key={aba.visao}
          type="button"
          onClick={() => onMudar(aba.visao)}
          aria-pressed={visao === aba.visao}
          className={`flex-1 rounded py-sm text-label-md transition-all ${
            visao === aba.visao ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'
          }`}
        >
          {aba.rotulo}
        </button>
      ))}
    </nav>
  );
}
