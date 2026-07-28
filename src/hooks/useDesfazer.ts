import { useCallback, useRef, useState, type Dispatch } from 'react';
import type { AcaoTarefas } from '../lib/tarefasReducer';

const DURACAO_MS = 5000;

type TipoAcaoDesfazivel = 'concluir' | 'excluir';

type AcaoPendente = {
  id: string;
  tipo: TipoAcaoDesfazivel;
};

export function useDesfazer(dispatch: Dispatch<AcaoTarefas>) {
  const [pendente, setPendente] = useState<AcaoPendente | null>(null);
  const pendenteRef = useRef<AcaoPendente | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const confirmar = useCallback(
    (acao: AcaoPendente) => {
      dispatch({ tipo: acao.tipo, id: acao.id });
    },
    [dispatch],
  );

  const agendar = useCallback(
    (acao: AcaoPendente) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        // Já havia uma ação pendente (ex.: excluiu duas tarefas rápido):
        // confirma a anterior antes de começar a nova, só um toast por vez.
        if (pendenteRef.current) confirmar(pendenteRef.current);
      }

      pendenteRef.current = acao;
      setPendente(acao);
      timeoutRef.current = setTimeout(() => {
        confirmar(acao);
        pendenteRef.current = null;
        setPendente(null);
        timeoutRef.current = null;
      }, DURACAO_MS);
    },
    [confirmar],
  );

  const desfazer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    pendenteRef.current = null;
    setPendente(null);
  }, []);

  return {
    idPendente: pendente?.id ?? null,
    tipoPendente: pendente?.tipo ?? null,
    agendar,
    desfazer,
  };
}
