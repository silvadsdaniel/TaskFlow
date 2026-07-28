import { useEffect, useRef, useState, type Dispatch } from 'react';
import type { Tarefa } from '../types/tarefa';
import type { AcaoTarefas } from '../lib/tarefasReducer';
import { INTERVALO_VERIFICACAO_MS, tarefasVencidas } from '../lib/agendador';
import { dispararNotificacao } from '../lib/notificacoes';

export function useAgendadorLembretes(tarefas: Tarefa[], dispatch: Dispatch<AcaoTarefas>) {
  const tarefasRef = useRef(tarefas);
  tarefasRef.current = tarefas;

  const primeiraVerificacao = useRef(true);
  // Guarda os ids já classificados (perdido ou notificado) nesta sessão do app.
  // Necessário porque o StrictMode do React invoca o efeito de montagem duas
  // vezes com o mesmo closure antes do re-render do dispatch chegar — sem essa
  // deduplicação, a segunda chamada veria a mesma tarefa como "vencida" de
  // novo e ou duplicaria o banner ou disparava uma notificação indevida.
  const idsProcessados = useRef(new Set<string>());
  const [lembretesPerdidos, setLembretesPerdidos] = useState<Tarefa[]>([]);
  const [tarefaDestacada, setTarefaDestacada] = useState<string | null>(null);

  useEffect(() => {
    function destacar(id: string) {
      setTarefaDestacada(id);
      setTimeout(() => {
        setTarefaDestacada((atual) => (atual === id ? null : atual));
      }, 2000);
    }

    function verificar() {
      const vencidas = tarefasVencidas(tarefasRef.current).filter(
        (tarefa) => !idsProcessados.current.has(tarefa.id),
      );
      const éPrimeiraVerificacao = primeiraVerificacao.current;
      primeiraVerificacao.current = false;

      if (vencidas.length === 0) return;

      vencidas.forEach((tarefa) => {
        idsProcessados.current.add(tarefa.id);
        dispatch({ tipo: 'marcarNotificada', id: tarefa.id });
      });

      if (éPrimeiraVerificacao) {
        // Vencidas na abertura do app não disparam notificação em rajada:
        // alimentam o banner de lembretes perdidos.
        setLembretesPerdidos((atuais) => [...atuais, ...vencidas]);
      } else {
        vencidas.forEach((tarefa) => dispararNotificacao(tarefa, () => destacar(tarefa.id)));
      }
    }

    verificar();
    const intervalo = setInterval(verificar, INTERVALO_VERIFICACAO_MS);

    function aoMudarVisibilidade() {
      if (document.visibilityState === 'visible') verificar();
    }
    document.addEventListener('visibilitychange', aoMudarVisibilidade);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
    };
  }, [dispatch]);

  return {
    lembretesPerdidos,
    tarefaDestacada,
    limparLembretesPerdidos: () => setLembretesPerdidos([]),
  };
}
