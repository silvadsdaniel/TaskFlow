import { Repeat } from 'lucide-react';
import type { Recorrencia } from '../types/tarefa';
import { DIAS_SEMANA_ABREV, DIAS_SEMANA_COMPLETO } from '../lib/recorrencia';
import { textos } from '../lib/textos';

type ModoRecorrencia = '' | 'diaria' | 'semanal' | 'mensal' | 'diasDaSemana';

const OPCOES: { valor: ModoRecorrencia; rotulo: string }[] = [
  { valor: '', rotulo: textos.recorrenciaNenhuma },
  { valor: 'diaria', rotulo: textos.recorrenciaDiaria },
  { valor: 'semanal', rotulo: textos.recorrenciaSemanal },
  { valor: 'mensal', rotulo: textos.recorrenciaMensal },
  { valor: 'diasDaSemana', rotulo: textos.recorrenciaDiasDaSemana },
];

type RecurrenceFieldProps = {
  recorrencia: Recorrencia | null;
  onMudar: (recorrencia: Recorrencia | null) => void;
};

export function RecurrenceField({ recorrencia, onMudar }: RecurrenceFieldProps) {
  const modo: ModoRecorrencia = recorrencia?.tipo ?? '';
  const diasMarcados = recorrencia?.tipo === 'diasDaSemana' ? recorrencia.dias : [];

  function handleMudarModo(novoModo: ModoRecorrencia) {
    if (novoModo === '') onMudar(null);
    else if (novoModo === 'diasDaSemana') onMudar({ tipo: 'diasDaSemana', dias: diasMarcados });
    else onMudar({ tipo: novoModo });
  }

  function alternarDia(dia: number) {
    const novosDias = diasMarcados.includes(dia)
      ? diasMarcados.filter((d) => d !== dia)
      : [...diasMarcados, dia];
    onMudar({ tipo: 'diasDaSemana', dias: novosDias });
  }

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center gap-sm rounded-lg border border-outline-variant px-md py-sm">
        <Repeat size={16} className="shrink-0 text-on-surface-variant" />
        <select
          value={modo}
          onChange={(evento) => handleMudarModo(evento.target.value as ModoRecorrencia)}
          aria-label={textos.rotuloRecorrencia}
          className="flex-grow bg-transparent text-body-md text-on-surface focus:outline-none"
        >
          {OPCOES.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
      </div>

      {modo === 'diasDaSemana' && (
        <div className="flex flex-col gap-xs">
          <div className="flex flex-wrap gap-xs" role="group" aria-label={textos.rotuloRecorrencia}>
            {DIAS_SEMANA_ABREV.map((rotulo, dia) => (
              <button
                key={dia}
                type="button"
                onClick={() => alternarDia(dia)}
                aria-pressed={diasMarcados.includes(dia)}
                aria-label={DIAS_SEMANA_COMPLETO[dia]}
                className={`flex h-8 w-10 shrink-0 items-center justify-center rounded-full border text-label-sm transition-all ${
                  diasMarcados.includes(dia)
                    ? 'border-transparent bg-primary text-on-primary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>
          {diasMarcados.length === 0 && (
            <p className="text-label-sm text-error">{textos.avisoSelecioneUmDia}</p>
          )}
        </div>
      )}
    </div>
  );
}
