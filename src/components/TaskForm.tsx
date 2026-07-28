import { useState } from 'react';
import { Plus } from 'lucide-react';
import { textos } from '../lib/textos';

type TaskFormProps = {
  onAdicionar: (titulo: string) => void;
};

export function TaskForm({ onAdicionar }: TaskFormProps) {
  const [titulo, setTitulo] = useState('');

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    onAdicionar(titulo);
    setTitulo('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 flex w-full justify-center p-md"
    >
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
