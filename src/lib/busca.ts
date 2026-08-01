import type { Tarefa } from '../types/tarefa';

function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function tarefaCorrespondeABusca(tarefa: Tarefa, termo: string): boolean {
  const termoNormalizado = normalizarTexto(termo.trim());
  if (termoNormalizado === '') return true;

  return (
    normalizarTexto(tarefa.titulo).includes(termoNormalizado) ||
    (tarefa.nota !== null && normalizarTexto(tarefa.nota).includes(termoNormalizado))
  );
}
