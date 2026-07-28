import { useEffect, useReducer, useState } from 'react';
import { carregarEstado, salvarEstado } from '../lib/storage';
import { tarefasReducer } from '../lib/tarefasReducer';

export function useTarefas() {
  const [{ estado: estadoInicial, corrompido }] = useState(carregarEstado);
  const [estado, dispatch] = useReducer(tarefasReducer, estadoInicial);

  useEffect(() => {
    salvarEstado(estado);
  }, [estado]);

  return { tarefas: estado.tarefas, dispatch, corrompido };
}
