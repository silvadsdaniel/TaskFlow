import { Bell } from 'lucide-react';
import { textos } from '../lib/textos';

type NotificationEnableNoticeProps = {
  onAtivar: () => void;
};

export function NotificationEnableNotice({ onAtivar }: NotificationEnableNoticeProps) {
  return (
    <div
      role="status"
      className="mb-md flex items-center justify-between gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm text-body-md text-on-surface-variant"
    >
      <span className="flex items-center gap-sm">
        <Bell size={16} className="shrink-0" />
        {textos.avisoNotificacoesNaoAtivadas}
      </span>
      <button
        type="button"
        onClick={onAtivar}
        className="shrink-0 text-label-md font-bold text-primary hover:underline"
      >
        {textos.botaoAtivarNotificacoes}
      </button>
    </div>
  );
}
