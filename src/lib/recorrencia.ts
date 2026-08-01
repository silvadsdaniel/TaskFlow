import type { Recorrencia } from '../types/tarefa';
import { textos } from './textos';

// 0 = domingo … 6 = sábado, mesma convenção de Date#getDay/getUTCDay.
export const DIAS_SEMANA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
export const DIAS_SEMANA_COMPLETO = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

// Uma recorrência de dias da semana sem nenhum dia marcado não tem sentido —
// usado no envio dos formulários para não persistir esse estado inválido.
export function recorrenciaValida(recorrencia: Recorrencia | null): Recorrencia | null {
  if (recorrencia !== null && recorrencia.tipo === 'diasDaSemana' && recorrencia.dias.length === 0) {
    return null;
  }
  return recorrencia;
}

export function formatarRecorrencia(recorrencia: Recorrencia): string {
  switch (recorrencia.tipo) {
    case 'diaria':
      return textos.recorrenciaDiaria;
    case 'semanal':
      return textos.recorrenciaSemanal;
    case 'mensal':
      return textos.recorrenciaMensal;
    case 'diasDaSemana':
      return recorrencia.dias
        .slice()
        .sort((a, b) => a - b)
        .map((dia) => DIAS_SEMANA_ABREV[dia])
        .join(', ');
  }
}
