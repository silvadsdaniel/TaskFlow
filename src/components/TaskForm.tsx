import { useState } from 'react';
import { Plus } from 'lucide-react';
import { textos } from '../lib/textos';
import { CATEGORIAS } from '../lib/categorias';
import type { Categoria } from '../types/tarefa';
import { CategoryChip } from './CategoryChip';

type TaskFormProps = {
  onAdicionar: (titulo: string, categoria: Categoria | null) => void;
};

export function TaskForm({ onAdicionar }: TaskFormProps) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    onAdicionar(titulo, categoria);
    setTitulo('');
    setCategoria(null);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 flex w-full flex-col items-center gap-sm p-md"
    >
      {titulo.length > 0 && (
        <div className="no-scrollbar flex w-full max-w-[640px] gap-sm overflow-x-auto">
          {CATEGORIAS.map((opcao) => (
            <CategoryChip
              key={opcao}
              categoria={opcao}
              ativo={categoria === opcao}
              onClick={() => setCategoria((atual) => (atual === opcao ? null : opcao))}
            />
          ))}
        </div>
      )}
      <div className="flex w-full max-w-[640px] items-center gap-xs rounded-full border border-outline-variant bg-surface p-xs shadow-xl">
        <input
          value={titulo}
          onChange={(evento) => setTitulo(evento.target.value)}
          placeholder={textos.placeholderNovaTarefa}
          maxLength={200}
          className="flex-grow bg-transparent px-sm text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none"
        />
        <button
          type="submit"
          aria-label={textos.botaoAdicionar}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>
    </form>
  );
}
