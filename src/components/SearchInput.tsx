import { Search, X } from 'lucide-react';
import { textos } from '../lib/textos';

type SearchInputProps = {
  valor: string;
  onMudar: (valor: string) => void;
};

export function SearchInput({ valor, onMudar }: SearchInputProps) {
  return (
    <div className="flex items-center gap-sm rounded-full border border-outline-variant bg-surface px-md py-sm">
      <Search size={16} className="shrink-0 text-on-surface-variant" />
      <input
        value={valor}
        onChange={(evento) => onMudar(evento.target.value)}
        placeholder={textos.placeholderBusca}
        maxLength={200}
        className="flex-grow bg-transparent text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none"
      />
      {valor !== '' && (
        <button
          type="button"
          onClick={() => onMudar('')}
          aria-label={textos.botaoLimparBusca}
          className="text-on-surface-variant hover:text-error"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
