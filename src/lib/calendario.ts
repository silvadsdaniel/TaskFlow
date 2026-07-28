import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import type { Tarefa } from '../types/tarefa';

export function diasDaGrade(mesVisualizado: Date): Date[] {
  const inicio = startOfWeek(startOfMonth(mesVisualizado), { weekStartsOn: 0 });
  const fim = endOfWeek(endOfMonth(mesVisualizado), { weekStartsOn: 0 });
  return eachDayOfInterval({ start: inicio, end: fim });
}

export function mesAnterior(mesVisualizado: Date): Date {
  return subMonths(mesVisualizado, 1);
}

export function proximoMes(mesVisualizado: Date): Date {
  return addMonths(mesVisualizado, 1);
}

export function tarefasComLembreteNoDia(tarefas: Tarefa[], dia: Date): Tarefa[] {
  return tarefas.filter(
    (tarefa) =>
      !tarefa.concluida && tarefa.lembreteEm !== null && isSameDay(new Date(tarefa.lembreteEm), dia),
  );
}
