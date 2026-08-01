import type { CategoriaDef } from '../types/categoria';

// Ids fixos para bater com tarefas já salvas antes de categorias virarem
// editáveis pelo usuário (essas 4 eram os únicos valores possíveis).
export const CATEGORIAS_PADRAO: CategoriaDef[] = [
  { id: 'trabalho', nome: 'Trabalho', cor: '#0070f3' },
  { id: 'casa', nome: 'Casa', cor: '#10b981' },
  { id: 'familia', nome: 'Família', cor: '#7c3aed' },
  { id: 'compras', nome: 'Compras', cor: '#f59e0b' },
];

// Paleta curada pra criação/edição de categoria — cores com saturação e
// contraste que funcionam tanto no tema claro quanto no escuro.
export const PALETA_CORES: string[] = [
  '#0070f3',
  '#10b981',
  '#7c3aed',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#6366f1',
  '#84cc16',
  '#78716c',
];

export function encontrarCategoria(
  categorias: CategoriaDef[],
  id: string | null,
): CategoriaDef | null {
  if (id === null) return null;
  return categorias.find((categoria) => categoria.id === id) ?? null;
}
