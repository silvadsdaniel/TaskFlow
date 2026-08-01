import { DatabaseBackup } from 'lucide-react';
import { textos } from '../lib/textos';

type BackupButtonProps = {
  onAbrir: () => void;
};

export function BackupButton({ onAbrir }: BackupButtonProps) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={textos.botaoBackup}
      title={textos.botaoBackup}
      className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
    >
      <DatabaseBackup size={20} />
    </button>
  );
}
