import { z } from 'zod';
import type { Categoria } from '../types/tarefa';

const CHAVE_CATEGORIAS = 'filtros:v1';
const CHAVE_TAGS = 'filtrosTags:v1';

// Antes de categorias editáveis pelo usuário, este schema validava um enum
// fixo ('trabalho' | 'casa' | 'familia' | 'compras'). Como categoria virou
// string livre (ver types/tarefa.ts), o filtro salvo por um usuário com
// categorias customizadas falhava a validação e voltava vazio a cada reload.
const filtrosSchema = z.array(z.string());

export function carregarFiltros(): Categoria[] {
  return carregarLista(CHAVE_CATEGORIAS);
}

export function salvarFiltros(categorias: Categoria[]): void {
  localStorage.setItem(CHAVE_CATEGORIAS, JSON.stringify(categorias));
}

export function carregarFiltrosTags(): string[] {
  return carregarLista(CHAVE_TAGS);
}

export function salvarFiltrosTags(tags: string[]): void {
  localStorage.setItem(CHAVE_TAGS, JSON.stringify(tags));
}

function carregarLista(chave: string): string[] {
  const bruto = localStorage.getItem(chave);
  if (bruto === null) return [];

  try {
    const resultado = filtrosSchema.safeParse(JSON.parse(bruto));
    return resultado.success ? resultado.data : [];
  } catch {
    return [];
  }
}
