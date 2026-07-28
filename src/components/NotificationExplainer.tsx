import { Bell } from 'lucide-react';
import { textos } from '../lib/textos';

type NotificationExplainerProps = {
  onPermitir: () => void;
  onFechar: () => void;
};

export function NotificationExplainer({ onPermitir, onFechar }: NotificationExplainerProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="explicacao-notificacoes-titulo"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 p-md"
    >
      <div className="w-full max-w-sm rounded-md border border-outline-variant bg-surface p-lg">
        <div className="mb-md flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <Bell size={20} />
        </div>
        <h2 id="explicacao-notificacoes-titulo" className="mb-sm text-display-md-mobile text-on-surface">
          {textos.explicacaoNotificacoesTitulo}
        </h2>
        <p className="mb-lg text-body-md text-on-surface-variant">
          {textos.explicacaoNotificacoesTexto}
        </p>
        <div className="flex justify-end gap-sm">
          <button
            type="button"
            onClick={onFechar}
            className="rounded px-md py-sm text-label-md text-on-surface-variant hover:bg-surface-container-high"
          >
            {textos.botaoAgoraNao}
          </button>
          <button
            type="button"
            onClick={onPermitir}
            className="rounded bg-primary px-md py-sm text-label-md text-on-primary"
          >
            {textos.botaoPermitirNotificacoes}
          </button>
        </div>
      </div>
    </div>
  );
}
