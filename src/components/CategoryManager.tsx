import { useState } from 'react';
import { Check, Pencil, Plus, X } from 'lucide-react';
import type { CategoriaDef } from '../types/categoria';
import { PALETA_CORES } from '../lib/categorias';
import { textos } from '../lib/textos';

type CategoryManagerProps = {
  categorias: CategoriaDef[];
  onFechar: () => void;
  onCriar: (nome: string, cor: string) => void;
  onEditar: (id: string, nome: string, cor: string) => void;
};

type ModoEdicao = { tipo: 'nova' } | { tipo: 'existente'; id: string } | null;

export function CategoryManager({ categorias, onFechar, onCriar, onEditar }: CategoryManagerProps) {
  const [modo, setModo] = useState<ModoEdicao>(null);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(PALETA_CORES[0]);

  function iniciarNova() {
    setModo({ tipo: 'nova' });
    setNome('');
    setCor(PALETA_CORES[0]);
  }

  function iniciarEdicao(categoria: CategoriaDef) {
    setModo({ tipo: 'existente', id: categoria.id });
    setNome(categoria.nome);
    setCor(categoria.cor);
  }

  function salvar() {
    const nomeLimpo = nome.trim();
    if (nomeLimpo === '' || modo === null) return;
    if (modo.tipo === 'nova') onCriar(nomeLimpo, cor);
    else onEditar(modo.id, nomeLimpo, cor);
    setModo(null);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-manager-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/30 p-md backdrop-blur-sm"
    >
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-outline-variant bg-surface p-md">
        <div className="mb-md flex items-center justify-between">
          <h2 id="category-manager-titulo" className="text-display-md-mobile text-on-surface">
            {textos.tituloGerenciarCategorias}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label={textos.botaoFechar}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-sm">
          {categorias.map((categoria) =>
            modo?.tipo === 'existente' && modo.id === categoria.id ? (
              <FormularioCategoria
                key={categoria.id}
                nome={nome}
                cor={cor}
                onNome={setNome}
                onCor={setCor}
                onSalvar={salvar}
                onCancelar={() => setModo(null)}
              />
            ) : (
              <button
                key={categoria.id}
                type="button"
                onClick={() => iniciarEdicao(categoria)}
                aria-label={`${textos.botaoEditarCategoria}: ${categoria.nome}`}
                className="flex w-full items-center gap-sm rounded-lg border border-outline-variant px-md py-sm hover:bg-surface-container-high"
              >
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: categoria.cor }} />
                <span className="flex-grow text-left text-body-md text-on-surface">{categoria.nome}</span>
                <Pencil size={16} className="shrink-0 text-on-surface-variant" />
              </button>
            ),
          )}

          {modo?.tipo === 'nova' ? (
            <FormularioCategoria
              nome={nome}
              cor={cor}
              onNome={setNome}
              onCor={setCor}
              onSalvar={salvar}
              onCancelar={() => setModo(null)}
            />
          ) : (
            <button
              type="button"
              onClick={iniciarNova}
              className="flex items-center justify-center gap-sm rounded-lg border border-dashed border-outline-variant px-md py-sm text-label-md text-primary hover:bg-surface-container-high"
            >
              <Plus size={16} />
              {textos.botaoNovaCategoria}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type FormularioCategoriaProps = {
  nome: string;
  cor: string;
  onNome: (nome: string) => void;
  onCor: (cor: string) => void;
  onSalvar: () => void;
  onCancelar: () => void;
};

function FormularioCategoria({
  nome,
  cor,
  onNome,
  onCor,
  onSalvar,
  onCancelar,
}: FormularioCategoriaProps) {
  return (
    <div className="flex flex-col gap-sm rounded-lg border border-primary p-md">
      <input
        value={nome}
        onChange={(evento) => onNome(evento.target.value)}
        placeholder={textos.placeholderNomeCategoria}
        maxLength={40}
        autoFocus
        className="w-full rounded border border-outline-variant bg-transparent px-sm py-xs text-body-md text-on-surface focus:border-primary focus:outline-none"
      />
      <div className="flex flex-wrap gap-xs">
        {PALETA_CORES.map((opcao) => (
          <button
            key={opcao}
            type="button"
            onClick={() => onCor(opcao)}
            aria-label={opcao}
            aria-pressed={cor === opcao}
            className={`h-7 w-7 shrink-0 rounded-full transition-transform ${
              cor === opcao ? 'scale-110 ring-2 ring-on-surface ring-offset-2 ring-offset-surface' : ''
            }`}
            style={{ backgroundColor: opcao }}
          />
        ))}
      </div>
      <div className="flex justify-end gap-sm">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded px-md py-xs text-label-md text-on-surface-variant hover:bg-surface-container-high"
        >
          {textos.botaoCancelarCategoria}
        </button>
        <button
          type="button"
          onClick={onSalvar}
          disabled={nome.trim() === ''}
          className="flex items-center gap-xs rounded bg-primary px-md py-xs text-label-md text-on-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Check size={16} />
          {textos.botaoSalvarCategoria}
        </button>
      </div>
    </div>
  );
}
