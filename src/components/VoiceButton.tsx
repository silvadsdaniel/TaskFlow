import { Mic } from 'lucide-react';
import { textos } from '../lib/textos';

type VoiceButtonProps = {
  onClick: () => void;
};

export function VoiceButton({ onClick }: VoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={textos.botaoFalar}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
    >
      <Mic size={20} />
    </button>
  );
}
