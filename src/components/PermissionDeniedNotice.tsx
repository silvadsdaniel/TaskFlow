import { BellOff } from 'lucide-react';
import { textos } from '../lib/textos';

export function PermissionDeniedNotice() {
  return (
    <p
      role="status"
      className="mb-md flex items-center gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm text-body-md text-on-surface-variant"
    >
      <BellOff size={16} className="shrink-0" />
      {textos.avisoNotificacoesNegadas}
    </p>
  );
}
