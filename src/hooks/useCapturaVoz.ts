import { useCallback, useRef, useState } from 'react';
import { iniciarReconhecimento, type ControleReconhecimento, type ErroReconhecimentoVoz } from '../lib/voz';
import { interpretarTarefa, type ResultadoInterpretacao } from '../lib/ia';
import { textos } from '../lib/textos';
import type { SugestaoTarefa } from '../components/VoiceConfirmCard';

export type EstadoCapturaVoz =
  | { fase: 'ociosa' }
  | { fase: 'capturando'; parcial: string }
  | { fase: 'processando' }
  | { fase: 'erro'; erro: ErroReconhecimentoVoz }
  | { fase: 'confirmando'; sugestao: SugestaoTarefa };

function construirSugestao(textoFinal: string, resultado: ResultadoInterpretacao): SugestaoTarefa {
  if (!resultado.ok) {
    return { titulo: textoFinal, nota: null, categoria: null, lembreteEm: null, tituloFocado: true };
  }

  const tarefa = resultado.tarefa;
  let lembreteEm = tarefa.lembrete;
  let avisoData: string | undefined;
  if (lembreteEm !== null && new Date(lembreteEm).getTime() < Date.now()) {
    avisoData = textos.avisoDataNoPassado;
    lembreteEm = null;
  }

  return {
    titulo: tarefa.titulo,
    nota: tarefa.nota,
    categoria: tarefa.categoria,
    lembreteEm,
    tituloFocado: tarefa.confianca === 'baixa',
    avisoData,
  };
}

export function useCapturaVoz() {
  const [estado, setEstado] = useState<EstadoCapturaVoz>({ fase: 'ociosa' });
  const controleRef = useRef<ControleReconhecimento | null>(null);

  const processarTranscricao = useCallback((textoFinal: string) => {
    setEstado((atual) => (atual.fase === 'capturando' ? { fase: 'processando' } : atual));

    if (textoFinal === '') {
      setEstado((atual) => (atual.fase === 'processando' ? { fase: 'ociosa' } : atual));
      return;
    }

    interpretarTarefa(textoFinal).then((resultado) => {
      setEstado((atual) =>
        atual.fase === 'processando'
          ? { fase: 'confirmando', sugestao: construirSugestao(textoFinal, resultado) }
          : atual,
      );
    });
  }, []);

  const iniciar = useCallback(() => {
    setEstado({ fase: 'capturando', parcial: '' });
    controleRef.current = iniciarReconhecimento({
      aoAtualizarParcial: (parcial) =>
        setEstado((atual) => (atual.fase === 'capturando' ? { fase: 'capturando', parcial } : atual)),
      aoFinalizar: processarTranscricao,
      aoErro: (erro) => setEstado({ fase: 'erro', erro }),
    });
  }, [processarTranscricao]);

  const parar = useCallback(() => {
    controleRef.current?.pararEProcessar();
  }, []);

  const cancelar = useCallback(() => {
    controleRef.current?.cancelar();
    setEstado({ fase: 'ociosa' });
  }, []);

  const resetar = useCallback(() => {
    setEstado({ fase: 'ociosa' });
  }, []);

  return { estado, iniciar, parar, cancelar, resetar };
}
