import { Monitor, Moon, Sun } from 'lucide-react';
import type { Tema } from '../lib/tema';
import { textos } from '../lib/textos';

const ICONE: Record<Tema, typeof Sun> = {
  sistema: Monitor,
  claro: Sun,
  escuro: Moon,
};

const ROTULO: Record<Tema, string> = {
  sistema: textos.temaSistema,
  claro: textos.temaClaro,
  escuro: textos.temaEscuro,
};

type ThemeToggleProps = {
  tema: Tema;
  onAlternar: () => void;
};

export function ThemeToggle({ tema, onAlternar }: ThemeToggleProps) {
  const Icone = ICONE[tema];

  return (
    <button
      type="button"
      onClick={onAlternar}
      aria-label={`${textos.botaoAlternarTema}: ${ROTULO[tema]}`}
      title={ROTULO[tema]}
      className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
    >
      <Icone size={20} />
    </button>
  );
}
