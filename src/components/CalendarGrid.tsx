import { format, isSameDay, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Tarefa } from '../types/tarefa';
import type { CategoriaDef } from '../types/categoria';
import { encontrarCategoria } from '../lib/categorias';
import { diasDaGrade, mesAnterior, proximoMes, tarefasComLembreteNoDia } from '../lib/calendario';
import { capitalizarPrimeiraLetra } from '../lib/formatacao';
import { textos } from '../lib/textos';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MAX_PONTOS_POR_DIA = 3;

type CalendarGridProps = {
  mesVisualizado: Date;
  tarefas: Tarefa[];
  categorias: CategoriaDef[];
  diaSelecionado: Date | null;
  onMudarMes: (mes: Date) => void;
  onSelecionarDia: (dia: Date) => void;
};

export function CalendarGrid({
  mesVisualizado,
  tarefas,
  categorias,
  diaSelecionado,
  onMudarMes,
  onSelecionarDia,
}: CalendarGridProps) {
  const dias = diasDaGrade(mesVisualizado);
  const hoje = new Date();

  return (
    <div>
      <div className="mb-md flex items-center justify-between">
        <h2 className="text-display-md-mobile text-on-surface">
          {capitalizarPrimeiraLetra(format(mesVisualizado, 'MMMM yyyy', { locale: ptBR }))}
        </h2>
        <div className="flex gap-xs">
          <button
            type="button"
            onClick={() => onMudarMes(mesAnterior(mesVisualizado))}
            aria-label={textos.botaoMesAnterior}
            className="rounded p-xs text-on-surface-variant hover:bg-surface-container-high"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => onMudarMes(proximoMes(mesVisualizado))}
            aria-label={textos.botaoProximoMes}
            className="rounded p-xs text-on-surface-variant hover:bg-surface-container-high"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-outline-variant pb-xs">
        {DIAS_SEMANA.map((dia) => (
          <span key={dia} className="text-center text-label-sm uppercase text-on-surface-variant">
            {dia}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 border-l border-outline-variant">
        {dias.map((dia) => {
          const noMes = isSameMonth(dia, mesVisualizado);
          const ehHoje = isSameDay(dia, hoje);
          const selecionado = diaSelecionado !== null && isSameDay(dia, diaSelecionado);
          const tarefasDoDia = tarefasComLembreteNoDia(tarefas, dia);
          const pontos = tarefasDoDia.slice(0, MAX_PONTOS_POR_DIA);
          const extra = tarefasDoDia.length - MAX_PONTOS_POR_DIA;

          return (
            <button
              key={dia.toISOString()}
              type="button"
              onClick={() => onSelecionarDia(dia)}
              aria-label={format(dia, "d 'de' MMMM", { locale: ptBR })}
              aria-pressed={selecionado}
              className={`flex min-h-16 flex-col items-start gap-xs border-b border-r border-outline-variant p-xs text-left transition-colors hover:bg-surface-container-high ${
                noMes ? 'bg-surface' : 'bg-surface-container-low opacity-50'
              } ${selecionado ? 'ring-2 ring-inset ring-primary' : ''}`}
            >
              <span className={`text-label-md ${ehHoje ? 'font-bold text-primary' : 'text-on-surface'}`}>
                {format(dia, 'd')}
              </span>
              {pontos.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pontos.map((tarefa) => {
                    const categoria = encontrarCategoria(categorias, tarefa.categoria);
                    return (
                      <span
                        key={tarefa.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: categoria?.cor ?? 'rgb(var(--color-outline))' }}
                      />
                    );
                  })}
                </div>
              )}
              {extra > 0 && <span className="text-label-sm text-on-surface-variant">+{extra}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
