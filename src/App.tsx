import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTarefas } from './hooks/useTarefas';
import { useFiltros } from './hooks/useFiltros';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { FilterBar } from './components/FilterBar';
import { ViewTabs, type Visao } from './components/ViewTabs';
import { textos } from './lib/textos';
import { agruparHoje, agruparSemana } from './lib/visoes';

export default function App() {
  const { tarefas, dispatch, corrompido } = useTarefas();
  const { categoriasSelecionadas, alternarCategoria, limparFiltros } = useFiltros();
  const [visao, setVisao] = useState<Visao>('hoje');
  const [anuncio, setAnuncio] = useState('');

  const tarefasFiltradas = tarefas.filter(
    (tarefa) =>
      categoriasSelecionadas.length === 0 ||
      (tarefa.categoria !== null && categoriasSelecionadas.includes(tarefa.categoria)),
  );

  function handleConcluir(id: string) {
    dispatch({ tipo: 'concluir', id });
    setAnuncio('Tarefa concluída');
  }

  function handleExcluir(id: string) {
    dispatch({ tipo: 'excluir', id });
    setAnuncio('Tarefa excluída');
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="mx-auto w-full max-w-[640px] px-margin-mobile pb-32 pt-lg">
        <header className="mb-lg">
          <h1 className="text-display-md-mobile text-on-surface">{textos.tituloApp}</h1>
          <p className="text-body-md text-on-surface-variant">{textos.subtituloApp}</p>
        </header>

        {corrompido && (
          <p role="alert" className="mb-md rounded-lg border border-error bg-error-container p-md text-body-md text-on-error-container">
            {textos.avisoDadosCorrompidos}
          </p>
        )}

        <div aria-live="polite" className="sr-only">
          {anuncio}
        </div>

        <ViewTabs visao={visao} onMudar={setVisao} />
        <div className="mb-md">
          <FilterBar
            categoriasSelecionadas={categoriasSelecionadas}
            onAlternar={alternarCategoria}
            onLimpar={limparFiltros}
          />
        </div>

        {visao === 'hoje' ? (
          <VisaoHoje tarefas={tarefasFiltradas} onConcluir={handleConcluir} onExcluir={handleExcluir} />
        ) : (
          <VisaoSemana tarefas={tarefasFiltradas} onConcluir={handleConcluir} onExcluir={handleExcluir} />
        )}
      </main>

      <TaskForm
        onAdicionar={(titulo, categoria) => {
          dispatch({ tipo: 'adicionar', titulo, categoria });
          setAnuncio('Tarefa criada');
        }}
      />
    </div>
  );
}

type VisaoProps = {
  tarefas: ReturnType<typeof useTarefas>['tarefas'];
  onConcluir: (id: string) => void;
  onExcluir: (id: string) => void;
};

function VisaoHoje({ tarefas, onConcluir, onExcluir }: VisaoProps) {
  const { comData, semData } = agruparHoje(tarefas);

  if (comData.length === 0 && semData.length === 0) {
    return (
      <p className="mt-lg text-center text-body-md text-on-surface-variant">{textos.listaVazia}</p>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      {comData.length > 0 && (
        <TaskList tarefas={comData} onConcluir={onConcluir} onExcluir={onExcluir} />
      )}
      {semData.length > 0 && (
        <div>
          <h2 className="mb-sm text-label-md text-on-surface-variant">{textos.secaoSemData}</h2>
          <TaskList tarefas={semData} onConcluir={onConcluir} onExcluir={onExcluir} />
        </div>
      )}
    </div>
  );
}

function capitalizarPrimeiraLetra(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function VisaoSemana({ tarefas, onConcluir, onExcluir }: VisaoProps) {
  const dias = agruparSemana(tarefas);

  return (
    <div className="flex flex-col gap-sm">
      {dias.map((dia) => (
        <div key={dia.inicio.toISOString()}>
          <h2 className="mb-sm text-label-md text-on-surface-variant">
            {capitalizarPrimeiraLetra(format(dia.inicio, "EEEE, d 'de' MMMM", { locale: ptBR }))}
          </h2>
          {dia.tarefas.length === 0 ? (
            <p className="rounded-lg border border-outline-variant px-md py-sm text-body-md text-on-surface-variant">
              {textos.semanaSemTarefas}
            </p>
          ) : (
            <TaskList tarefas={dia.tarefas} onConcluir={onConcluir} onExcluir={onExcluir} />
          )}
        </div>
      ))}
    </div>
  );
}
