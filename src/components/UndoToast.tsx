import { textos } from '../lib/textos';

type UndoToastProps = {
  mensagem: string;
  onDesfazer: () => void;
};

export function UndoToast({ mensagem, onDesfazer }: UndoToastProps) {
  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-md rounded-full bg-inverse-surface px-lg py-sm text-inverse-on-surface shadow-xl"
    >
      <span className="text-body-md">{mensagem}</span>
      <button type="button" onClick={onDesfazer} className="text-label-md font-bold underline">
        {textos.botaoDesfazer}
      </button>
    </div>
  );
}
