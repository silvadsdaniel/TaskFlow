import { useEffect, useState } from 'react';
import type { Categoria } from '../types/tarefa';
import { carregarFiltros, carregarFiltrosTags, salvarFiltros, salvarFiltrosTags } from '../lib/filtros';

export function useFiltros() {
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<Categoria[]>(carregarFiltros);
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>(carregarFiltrosTags);

  useEffect(() => {
    salvarFiltros(categoriasSelecionadas);
  }, [categoriasSelecionadas]);

  useEffect(() => {
    salvarFiltrosTags(tagsSelecionadas);
  }, [tagsSelecionadas]);

  function alternarCategoria(categoria: Categoria) {
    setCategoriasSelecionadas((atuais) =>
      atuais.includes(categoria)
        ? atuais.filter((c) => c !== categoria)
        : [...atuais, categoria],
    );
  }

  function alternarTag(tag: string) {
    setTagsSelecionadas((atuais) =>
      atuais.includes(tag) ? atuais.filter((t) => t !== tag) : [...atuais, tag],
    );
  }

  function limparFiltros() {
    setCategoriasSelecionadas([]);
    setTagsSelecionadas([]);
  }

  return {
    categoriasSelecionadas,
    tagsSelecionadas,
    alternarCategoria,
    alternarTag,
    limparFiltros,
  };
}
