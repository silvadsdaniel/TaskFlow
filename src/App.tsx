import { useState } from 'react';
import { useTarefas } from './hooks/useTarefas';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { textos } from './lib/textos';

export default function App() {
  const { tarefas, dispatch, corrompido } = useTarefas();
  const [anuncio, setAnuncio] = useState('');

  const pendentes = tarefas.filter((tarefa) => !tarefa.concluida);
  const concluidas = tarefas.filter((tarefa) => tarefa.concluida);

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

        <TaskList
          tarefas={[...pendentes, ...concluidas]}
          onConcluir={(id) => {
            dispatch({ tipo: 'concluir', id });
            setAnuncio('Tarefa concluída');
          }}
          onExcluir={(id) => {
            dispatch({ tipo: 'excluir', id });
            setAnuncio('Tarefa excluída');
          }}
        />
      </main>

      <TaskForm
        onAdicionar={(titulo) => {
          dispatch({ tipo: 'adicionar', titulo });
          setAnuncio('Tarefa criada');
        }}
      />
    </div>
  );
}
