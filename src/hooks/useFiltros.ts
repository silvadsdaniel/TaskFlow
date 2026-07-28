import { useEffect, useState } from 'react';
import type { Categoria } from '../types/tarefa';
import { carregarFiltros, salvarFiltros } from '../lib/filtros';

export function useFiltros() {
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<Categoria[]>(carregarFiltros);

  useEffect(() => {
    salvarFiltros(categoriasSelecionadas);
  }, [categoriasSelecionadas]);

  function alternarCategoria(categoria: Categoria) {
    setCategoriasSelecionadas((atuais) =>
      atuais.includes(categoria)
        ? atuais.filter((c) => c !== categoria)
        : [...atuais, categoria],
    );
  }

  function limparFiltros() {
    setCategoriasSelecionadas([]);
  }

  return { categoriasSelecionadas, alternarCategoria, limparFiltros };
}
