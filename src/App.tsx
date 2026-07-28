import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTarefas } from './hooks/useTarefas';
import { useFiltros } from './hooks/useFiltros';
import { useAgendadorLembretes } from './hooks/useAgendadorLembretes';
import { useCapturaVoz, type EstadoCapturaVoz } from './hooks/useCapturaVoz';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { FilterBar } from './components/FilterBar';
import { ViewTabs, type Visao } from './components/ViewTabs';
import { NotificationExplainer } from './components/NotificationExplainer';
import { PermissionDeniedNotice } from './components/PermissionDeniedNotice';
import { MissedRemindersBanner } from './components/MissedRemindersBanner';
import { VoiceCaptureOverlay } from './components/VoiceCaptureOverlay';
import { VoiceConfirmCard } from './components/VoiceConfirmCard';
import { textos } from './lib/textos';
import { agruparHoje, agruparSemana } from './lib/visoes';
import {
  jaPerguntou,
  marcarPerguntado,
  permissaoAtual,
  solicitarPermissao,
  suportado,
} from './lib/notificacoes';
import type { Categoria } from './types/tarefa';

export default function App() {
  const { tarefas, dispatch, corrompido } = useTarefas();
  const { categoriasSelecionadas, alternarCategoria, limparFiltros } = useFiltros();
  const { lembretesPerdidos, tarefaDestacada, limparLembretesPerdidos } = useAgendadorLembretes(
    tarefas,
    dispatch,
  );
  const [visao, setVisao] = useState<Visao>('hoje');
  const [anuncio, setAnuncio] = useState('');
  const [permissao, setPermissao] = useState(permissaoAtual);
  const [explicarNotificacoesAberto, setExplicarNotificacoesAberto] = useState(false);
  const {
    estado: estadoVoz,
    iniciar: iniciarVoz,
    parar: pararVoz,
    cancelar: cancelarVoz,
    resetar: resetarVoz,
  } = useCapturaVoz();

  const tarefasFiltradas = tarefas.filter(
    (tarefa) =>
      categoriasSelecionadas.length === 0 ||
      (tarefa.categoria !== null && categoriasSelecionadas.includes(tarefa.categoria)),
  );

  function avaliarPermissaoAoCriarLembrete(lembreteEm: string | null) {
    if (lembreteEm !== null && suportado() && permissaoAtual() === 'default' && !jaPerguntou()) {
      marcarPerguntado();
      setExplicarNotificacoesAberto(true);
    }
  }

  function handleAdicionar(titulo: string, categoria: Categoria | null, lembreteEm: string | null) {
    dispatch({ tipo: 'adicionar', titulo, categoria, lembreteEm, nota: null, origem: 'texto' });
    setAnuncio('Tarefa criada');
    avaliarPermissaoAoCriarLembrete(lembreteEm);
  }

  function handleConfirmarVoz(
    titulo: string,
    categoria: Categoria | null,
    lembreteEm: string | null,
    nota: string | null,
  ) {
    dispatch({ tipo: 'adicionar', titulo, categoria, lembreteEm, nota, origem: 'voz' });
    setAnuncio('Tarefa criada');
    avaliarPermissaoAoCriarLembrete(lembreteEm);
    resetarVoz();
  }

  const fasesComPainelAberto: EstadoCapturaVoz['fase'][] = ['capturando', 'processando', 'erro', 'confirmando'];
  const painelVozAberto = fasesComPainelAberto.includes(estadoVoz.fase);

  useEffect(() => {
    if (!painelVozAberto) return;

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') cancelarVoz();
    }
    document.addEventListener('keydown', aoPressionarTecla);
    return () => document.removeEventListener('keydown', aoPressionarTecla);
  }, [painelVozAberto, cancelarVoz]);

  async function handlePermitirNotificacoes() {
    const resultado = await solicitarPermissao();
    setPermissao(resultado);
    setExplicarNotificacoesAberto(false);
  }

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

        <MissedRemindersBanner tarefas={lembretesPerdidos} onFechar={limparLembretesPerdidos} />
        {permissao === 'denied' && <PermissionDeniedNotice />}

        <ViewTabs visao={visao} onMudar={setVisao} />
        <div className="mb-md">
          <FilterBar
            categoriasSelecionadas={categoriasSelecionadas}
            onAlternar={alternarCategoria}
            onLimpar={limparFiltros}
          />
        </div>

        {visao === 'hoje' ? (
          <VisaoHoje
            tarefas={tarefasFiltradas}
            tarefaDestacada={tarefaDestacada}
            onConcluir={handleConcluir}
            onExcluir={handleExcluir}
          />
        ) : (
          <VisaoSemana
            tarefas={tarefasFiltradas}
            tarefaDestacada={tarefaDestacada}
            onConcluir={handleConcluir}
            onExcluir={handleExcluir}
          />
        )}
      </main>

      <TaskForm onAdicionar={handleAdicionar} onIniciarVoz={iniciarVoz} />

      {estadoVoz.fase === 'capturando' && (
        <VoiceCaptureOverlay
          fase="capturando"
          parcial={estadoVoz.parcial}
          onParar={pararVoz}
          onCancelar={cancelarVoz}
        />
      )}
      {estadoVoz.fase === 'processando' && <VoiceCaptureOverlay fase="processando" />}
      {estadoVoz.fase === 'erro' && (
        <VoiceCaptureOverlay fase="erro" erro={estadoVoz.erro} onFechar={resetarVoz} />
      )}
      {estadoVoz.fase === 'confirmando' && (
        <VoiceConfirmCard
          sugestao={estadoVoz.sugestao}
          onConfirmar={handleConfirmarVoz}
          onDescartar={resetarVoz}
        />
      )}

      {explicarNotificacoesAberto && (
        <NotificationExplainer
          onPermitir={handlePermitirNotificacoes}
          onFechar={() => setExplicarNotificacoesAberto(false)}
        />
      )}
    </div>
  );
}

type VisaoProps = {
  tarefas: ReturnType<typeof useTarefas>['tarefas'];
  tarefaDestacada: string | null;
  onConcluir: (id: string) => void;
  onExcluir: (id: string) => void;
};

function VisaoHoje({ tarefas, tarefaDestacada, onConcluir, onExcluir }: VisaoProps) {
  const { comData, semData } = agruparHoje(tarefas);

  if (comData.length === 0 && semData.length === 0) {
    return (
      <p className="mt-lg text-center text-body-md text-on-surface-variant">{textos.listaVazia}</p>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      {comData.length > 0 && (
        <TaskList
          tarefas={comData}
          tarefaDestacada={tarefaDestacada}
          onConcluir={onConcluir}
          onExcluir={onExcluir}
        />
      )}
      {semData.length > 0 && (
        <div>
          <h2 className="mb-sm text-label-md text-on-surface-variant">{textos.secaoSemData}</h2>
          <TaskList
            tarefas={semData}
            tarefaDestacada={tarefaDestacada}
            onConcluir={onConcluir}
            onExcluir={onExcluir}
          />
        </div>
      )}
    </div>
  );
}

function capitalizarPrimeiraLetra(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function VisaoSemana({ tarefas, tarefaDestacada, onConcluir, onExcluir }: VisaoProps) {
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
            <TaskList
              tarefas={dia.tarefas}
              tarefaDestacada={tarefaDestacada}
              onConcluir={onConcluir}
              onExcluir={onExcluir}
            />
          )}
        </div>
      ))}
    </div>
  );
}
