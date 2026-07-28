import { z } from 'zod';
import type { Categoria } from '../types/tarefa';

const CHAVE = 'filtros:v1';

const filtrosSchema = z.array(z.enum(['trabalho', 'casa', 'familia', 'compras']));

export function carregarFiltros(): Categoria[] {
  const bruto = localStorage.getItem(CHAVE);
  if (bruto === null) return [];

  try {
    const resultado = filtrosSchema.safeParse(JSON.parse(bruto));
    return resultado.success ? resultado.data : [];
  } catch {
    return [];
  }
}

export function salvarFiltros(categorias: Categoria[]): void {
  localStorage.setItem(CHAVE, JSON.stringify(categorias));
}
