import type { Categoria } from '../types/tarefa';

export const CATEGORIAS: Categoria[] = ['trabalho', 'casa', 'familia', 'compras'];

export const rotuloCategoria: Record<Categoria, string> = {
  trabalho: 'Trabalho',
  casa: 'Casa',
  familia: 'Família',
  compras: 'Compras',
};

export const corCategoria: Record<Categoria, string> = {
  trabalho: 'bg-category-trabalho',
  casa: 'bg-category-casa',
  familia: 'bg-category-familia',
  compras: 'bg-category-compras',
};
