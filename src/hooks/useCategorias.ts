import { useEffect, useState } from 'react';
import type { CategoriaDef } from '../types/categoria';
import { carregarCategorias, salvarCategorias } from '../lib/categoriasStorage';

export function useCategorias() {
  const [categorias, setCategorias] = useState<CategoriaDef[]>(carregarCategorias);

  useEffect(() => {
    salvarCategorias(categorias);
  }, [categorias]);

  function criar(nome: string, cor: string): string {
    const nova: CategoriaDef = { id: crypto.randomUUID(), nome: nome.trim(), cor };
    setCategorias((atuais) => [...atuais, nova]);
    return nova.id;
  }

  function editar(id: string, nome: string, cor: string): void {
    const nomeLimpo = nome.trim();
    if (nomeLimpo === '') return;
    setCategorias((atuais) =>
      atuais.map((categoria) => (categoria.id === id ? { ...categoria, nome: nomeLimpo, cor } : categoria)),
    );
  }

  return { categorias, criar, editar };
}
