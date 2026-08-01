import { z } from 'zod';
import type { CategoriaDef } from '../types/categoria';
import { CATEGORIAS_PADRAO } from './categorias';

const CHAVE = 'categorias:v1';

export const categoriaDefSchema = z.object({
  id: z.string(),
  nome: z.string().min(1).max(40),
  cor: z.string(),
});

export function carregarCategorias(): CategoriaDef[] {
  const bruto = localStorage.getItem(CHAVE);
  if (bruto === null) return CATEGORIAS_PADRAO;

  try {
    const resultado = z.array(categoriaDefSchema).safeParse(JSON.parse(bruto));
    return resultado.success && resultado.data.length > 0 ? resultado.data : CATEGORIAS_PADRAO;
  } catch {
    return CATEGORIAS_PADRAO;
  }
}

export function salvarCategorias(categorias: CategoriaDef[]): void {
  localStorage.setItem(CHAVE, JSON.stringify(categorias));
}
