import { Mic, X } from 'lucide-react';
import { textos } from '../lib/textos';
import type { ErroReconhecimentoVoz } from '../lib/voz';

const MENSAGENS_ERRO: Record<ErroReconhecimentoVoz, string> = {
  'not-allowed': textos.erroVozNotAllowed,
  'no-speech': textos.erroVozNoSpeech,
  network: textos.erroVozNetwork,
  aborted: textos.erroVozAborted,
  outro: textos.erroVozOutro,
};

type VoiceCaptureOverlayProps =
  | { fase: 'capturando'; parcial: string; onParar: () => void; onCancelar: () => void }
  | { fase: 'processando' }
  | { fase: 'erro'; erro: ErroReconhecimentoVoz; onFechar: () => void };

export function VoiceCaptureOverlay(props: VoiceCaptureOverlayProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-inverse-surface/30 p-md backdrop-blur-sm"
    >
      <div className="w-full max-w-[640px] rounded-lg border border-outline-variant bg-surface p-lg">
        {props.fase === 'capturando' && (
          <>
            <div className="mb-md flex items-center gap-sm text-label-sm uppercase tracking-wide text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {textos.legendaOuvindo}
            </div>
            <p className="mb-lg min-h-[3lh] text-display-md-mobile text-on-surface">
              {props.parcial === '' ? textos.placeholderTranscricao : props.parcial}
            </p>
            <div className="flex justify-end gap-sm">
              <button
                type="button"
                onClick={props.onCancelar}
                className="rounded px-md py-sm text-label-md text-on-surface-variant hover:bg-surface-container-high"
              >
                {textos.botaoCancelarGravacao}
              </button>
              <button
                type="button"
                onClick={props.onParar}
                aria-label={textos.botaoPararGravacao}
                className="flex items-center gap-sm rounded-full bg-primary px-lg py-sm text-label-md text-on-primary"
              >
                <Mic size={16} />
                {textos.botaoPararGravacao}
              </button>
            </div>
          </>
        )}

        {props.fase === 'processando' && (
          <p className="text-center text-body-lg text-on-surface-variant">
            {textos.processandoTranscricao}
          </p>
        )}

        {props.fase === 'erro' && (
          <>
            <p className="mb-lg text-body-lg text-on-surface">{MENSAGENS_ERRO[props.erro]}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={props.onFechar}
                className="flex items-center gap-sm rounded-full border border-outline-variant px-lg py-sm text-label-md text-on-surface-variant"
              >
                <X size={16} />
                {textos.botaoFechar}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
