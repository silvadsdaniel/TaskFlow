import { useRef, useState } from 'react';
import { Download, Upload, X } from 'lucide-react';
import type { Tarefa } from '../types/tarefa';
import type { CategoriaDef } from '../types/categoria';
import type { BackupExportado } from '../lib/backup';
import { lerBackupDeArquivo } from '../lib/backup';
import { textos } from '../lib/textos';

type EstadoImportacao =
  | { fase: 'inicio' }
  | { fase: 'erro' }
  | { fase: 'confirmando'; backup: BackupExportado };

type BackupPanelProps = {
  onFechar: () => void;
  onExportar: () => void;
  onImportar: (tarefas: Tarefa[], categorias: CategoriaDef[]) => void;
};

export function BackupPanel({ onFechar, onExportar, onImportar }: BackupPanelProps) {
  const [estadoImportacao, setEstadoImportacao] = useState<EstadoImportacao>({ fase: 'inicio' });
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  async function handleArquivoSelecionado(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;

    const resultado = await lerBackupDeArquivo(arquivo);
    setEstadoImportacao(
      resultado.sucesso ? { fase: 'confirmando', backup: resultado.backup } : { fase: 'erro' },
    );
  }

  function handleConfirmarImportacao() {
    if (estadoImportacao.fase !== 'confirmando') return;
    onImportar(estadoImportacao.backup.tarefas, estadoImportacao.backup.categorias);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-panel-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 p-md backdrop-blur-sm"
    >
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-outline-variant bg-surface p-md">
        <div className="mb-md flex items-center justify-between">
          <h2 id="backup-panel-titulo" className="text-display-md-mobile text-on-surface">
            {textos.tituloBackup}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label={textos.botaoFechar}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-lg">
          <section className="flex flex-col gap-sm">
            <p className="text-body-md text-on-surface-variant">{textos.textoExportar}</p>
            <button
              type="button"
              onClick={onExportar}
              className="flex items-center justify-center gap-sm rounded-lg bg-primary px-md py-sm text-label-md text-on-primary hover:opacity-90"
            >
              <Download size={16} />
              {textos.botaoExportar}
            </button>
          </section>

          <section className="flex flex-col gap-sm border-t border-outline-variant pt-lg">
            {estadoImportacao.fase === 'confirmando' ? (
              <>
                <p role="alert" className="text-body-md text-on-surface">
                  {textos.avisoConfirmarImportacaoPrefixo}{' '}
                  <strong>
                    {estadoImportacao.backup.tarefas.length} tarefa(s) e{' '}
                    {estadoImportacao.backup.categorias.length} categoria(s)
                  </strong>
                  . {textos.avisoConfirmarImportacaoSufixo}
                </p>
                <div className="flex justify-end gap-sm">
                  <button
                    type="button"
                    onClick={() => setEstadoImportacao({ fase: 'inicio' })}
                    className="rounded px-md py-xs text-label-md text-on-surface-variant hover:bg-surface-container-high"
                  >
                    {textos.botaoCancelarImportar}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmarImportacao}
                    className="rounded bg-error px-md py-xs text-label-md text-on-error hover:opacity-90"
                  >
                    {textos.botaoConfirmarImportar}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-body-md text-on-surface-variant">{textos.textoImportar}</p>
                {estadoImportacao.fase === 'erro' && (
                  <p role="alert" className="text-body-md text-error">
                    {textos.erroImportarArquivoInvalido}
                  </p>
                )}
                <input
                  ref={inputArquivoRef}
                  type="file"
                  accept="application/json"
                  onChange={handleArquivoSelecionado}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => inputArquivoRef.current?.click()}
                  className="flex items-center justify-center gap-sm rounded-lg border border-outline-variant px-md py-sm text-label-md text-on-surface hover:bg-surface-container-high"
                >
                  <Upload size={16} />
                  {textos.botaoSelecionarArquivo}
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
