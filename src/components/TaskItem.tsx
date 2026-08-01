import { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import { Bell, Check, CheckCircle2, ChevronDown, ChevronUp, Pencil, Plus, Repeat, Star, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Tarefa } from '../types/tarefa';
import type { CategoriaDef } from '../types/categoria';
import type { AcaoTarefas } from '../lib/tarefasReducer';
import { textos } from '../lib/textos';
import { encontrarCategoria } from '../lib/categorias';
import { estaAtrasada } from '../lib/datas';
import { formatarRecorrencia } from '../lib/recorrencia';

type TaskItemProps = {
  tarefa: Tarefa;
  categorias: CategoriaDef[];
  destacada: boolean;
  onConcluir: (id: string) => void;
  onExcluir: (id: string) => void;
  onEditar: (tarefa: Tarefa) => void;
  dispatch: Dispatch<AcaoTarefas>;
  somenteExibirConclusao?: boolean;
};

export function TaskItem({
  tarefa,
  categorias,
  destacada,
  onConcluir,
  onExcluir,
  onEditar,
  dispatch,
  somenteExibirConclusao = false,
}: TaskItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const categoria = encontrarCategoria(categorias, tarefa.categoria);
  const [checklistAberto, setChecklistAberto] = useState(false);
  const [novoItem, setNovoItem] = useState('');
  const [subtarefaEditandoId, setSubtarefaEditandoId] = useState<string | null>(null);
  const [textoEdicaoSubtarefa, setTextoEdicaoSubtarefa] = useState('');

  useEffect(() => {
    if (destacada) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [destacada]);

  const atrasada = !tarefa.concluida && estaAtrasada(tarefa.lembreteEm);
  const subtarefasConcluidas = tarefa.subtarefas.filter((subtarefa) => subtarefa.concluida).length;

  function handleAdicionarItem(evento: React.FormEvent) {
    evento.preventDefault();
    if (novoItem.trim() === '') return;
    dispatch({ tipo: 'adicionarSubtarefa', id: tarefa.id, texto: novoItem });
    setNovoItem('');
  }

  function iniciarEdicaoSubtarefa(subtarefaId: string, textoAtual: string) {
    setSubtarefaEditandoId(subtarefaId);
    setTextoEdicaoSubtarefa(textoAtual);
  }

  function salvarEdicaoSubtarefa(evento: React.FormEvent) {
    evento.preventDefault();
    if (subtarefaEditandoId === null || textoEdicaoSubtarefa.trim() === '') return;
    dispatch({ tipo: 'editarSubtarefa', id: tarefa.id, subtarefaId: subtarefaEditandoId, texto: textoEdicaoSubtarefa });
    setSubtarefaEditandoId(null);
  }

  return (
    <div
      ref={ref}
      className={`group relative flex flex-col gap-sm overflow-hidden rounded-lg border bg-surface p-md transition-colors duration-300 ${
        destacada ? 'border-primary bg-primary-container/10' : 'border-outline-variant'
      }`}
    >
      {categoria && (
        <div className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: categoria.cor }} />
      )}
      <div className="flex items-center gap-md">
        <input
          type="checkbox"
          checked={tarefa.concluida}
          disabled={somenteExibirConclusao}
          onChange={() => onConcluir(tarefa.id)}
          aria-label={tarefa.titulo}
          className="h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-[4px] border-2 border-outline-variant checked:border-primary checked:bg-primary disabled:cursor-default"
        />
        <div className="flex flex-grow flex-col gap-xs">
          <div className="flex items-center gap-xs">
            {tarefa.prioridade === 'importante' && (
              <Star size={14} className="shrink-0 text-tertiary" fill="currentColor" aria-hidden="true" />
            )}
            <span
              className={`text-body-lg text-on-surface ${
                tarefa.concluida ? 'text-on-surface-variant line-through' : ''
              }`}
            >
              {tarefa.titulo}
            </span>
            {tarefa.prioridade === 'importante' && <span className="sr-only">{textos.badgeImportante}</span>}
          </div>
          {tarefa.nota && <p className="text-body-md text-on-surface-variant">{tarefa.nota}</p>}
          <div className="flex flex-wrap items-center gap-sm">
            {categoria && (
              <span className="flex items-center gap-xs text-label-sm text-on-surface-variant">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: categoria.cor }} />
                {categoria.nome}
              </span>
            )}
            {tarefa.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-surface-container-high px-sm py-0.5 text-label-sm text-on-surface-variant">
                #{tag}
              </span>
            ))}
            {somenteExibirConclusao && tarefa.concluidaEm ? (
              <span className="flex items-center gap-xs text-label-sm text-on-surface-variant">
                <CheckCircle2 size={12} />
                {format(new Date(tarefa.concluidaEm), "d 'de' MMM, HH:mm", { locale: ptBR })}
              </span>
            ) : (
              tarefa.lembreteEm && (
                <span
                  className={`flex items-center gap-xs text-label-sm ${
                    atrasada ? 'text-error' : 'text-on-surface-variant'
                  }`}
                >
                  <Bell size={12} />
                  {format(new Date(tarefa.lembreteEm), "d 'de' MMM, HH:mm", { locale: ptBR })}
                  {tarefa.recorrencia !== null && (
                    <span className="flex items-center gap-xs">
                      <Repeat size={12} aria-hidden="true" />
                      {formatarRecorrencia(tarefa.recorrencia)}
                    </span>
                  )}
                </span>
              )
            )}
            {!somenteExibirConclusao && (
              <button
                type="button"
                onClick={() => setChecklistAberto((atual) => !atual)}
                aria-expanded={checklistAberto}
                aria-label={textos.botaoExpandirSubtarefas}
                className="flex items-center gap-xs text-label-sm text-on-surface-variant hover:text-primary"
              >
                {tarefa.subtarefas.length > 0 && `${subtarefasConcluidas}/${tarefa.subtarefas.length}`}
                {checklistAberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>
        {!somenteExibirConclusao && (
          <button
            type="button"
            onClick={() => onEditar(tarefa)}
            aria-label={textos.botaoEditarTarefa}
            className="text-on-surface-variant opacity-0 transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Pencil size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onExcluir(tarefa.id)}
          aria-label={textos.botaoExcluir}
          className="text-on-surface-variant opacity-0 transition-opacity hover:text-error focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {checklistAberto && !somenteExibirConclusao && (
        <div className="ml-9 flex flex-col gap-xs">
          {tarefa.subtarefas.map((subtarefa) =>
            subtarefaEditandoId === subtarefa.id ? (
              <form key={subtarefa.id} onSubmit={salvarEdicaoSubtarefa} className="flex items-center gap-sm">
                <input
                  value={textoEdicaoSubtarefa}
                  onChange={(evento) => setTextoEdicaoSubtarefa(evento.target.value)}
                  onBlur={salvarEdicaoSubtarefa}
                  maxLength={200}
                  autoFocus
                  className="flex-grow rounded border border-primary bg-transparent px-sm py-xs text-body-md text-on-surface focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={textoEdicaoSubtarefa.trim() === ''}
                  aria-label={textos.botaoSalvarSubtarefa}
                  className="text-on-surface-variant hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Check size={14} />
                </button>
              </form>
            ) : (
              <div key={subtarefa.id} className="group/item flex items-center gap-sm">
                <input
                  type="checkbox"
                  checked={subtarefa.concluida}
                  onChange={() => dispatch({ tipo: 'alternarSubtarefa', id: tarefa.id, subtarefaId: subtarefa.id })}
                  aria-label={subtarefa.texto}
                  className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[3px] border-2 border-outline-variant checked:border-primary checked:bg-primary"
                />
                <button
                  type="button"
                  onClick={() => iniciarEdicaoSubtarefa(subtarefa.id, subtarefa.texto)}
                  className={`flex-grow text-left text-body-md text-on-surface ${
                    subtarefa.concluida ? 'text-on-surface-variant line-through' : ''
                  }`}
                >
                  {subtarefa.texto}
                </button>
                <button
                  type="button"
                  onClick={() => iniciarEdicaoSubtarefa(subtarefa.id, subtarefa.texto)}
                  aria-label={`${textos.botaoEditarSubtarefa}: ${subtarefa.texto}`}
                  className="text-on-surface-variant opacity-0 transition-opacity hover:text-primary focus-visible:opacity-100 group-hover/item:opacity-100"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ tipo: 'removerSubtarefa', id: tarefa.id, subtarefaId: subtarefa.id })}
                  aria-label={`${textos.botaoRemoverSubtarefa}: ${subtarefa.texto}`}
                  className="text-on-surface-variant hover:text-error"
                >
                  <X size={14} />
                </button>
              </div>
            ),
          )}
          <form onSubmit={handleAdicionarItem} className="flex items-center gap-sm">
            <input
              value={novoItem}
              onChange={(evento) => setNovoItem(evento.target.value)}
              placeholder={textos.placeholderNovaSubtarefa}
              maxLength={200}
              className="flex-grow rounded border border-outline-variant bg-transparent px-sm py-xs text-body-md text-on-surface focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={novoItem.trim() === ''}
              aria-label={textos.botaoAdicionarSubtarefa}
              className="text-on-surface-variant hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
