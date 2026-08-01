import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTarefas } from './hooks/useTarefas';
import { useFiltros } from './hooks/useFiltros';
import { useAgendadorLembretes } from './hooks/useAgendadorLembretes';
import { useCapturaVoz, type EstadoCapturaVoz } from './hooks/useCapturaVoz';
import { useTema } from './hooks/useTema';
import { useDesfazer } from './hooks/useDesfazer';
import { useCategorias } from './hooks/useCategorias';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { FilterBar } from './components/FilterBar';
import { ViewTabs, type Visao } from './components/ViewTabs';
import { NotificationExplainer } from './components/NotificationExplainer';
import { PermissionDeniedNotice } from './components/PermissionDeniedNotice';
import { NotificationEnableNotice } from './components/NotificationEnableNotice';
import { MissedRemindersBanner } from './components/MissedRemindersBanner';
import { VoiceCaptureOverlay } from './components/VoiceCaptureOverlay';
import { VoiceConfirmCard } from './components/VoiceConfirmCard';
import { CalendarGrid } from './components/CalendarGrid';
import { DayDetailPanel } from './components/DayDetailPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { UndoToast } from './components/UndoToast';
import { CategoryManager } from './components/CategoryManager';
import { BackupPanel } from './components/BackupPanel';
import { BackupButton } from './components/BackupButton';
import { textos } from './lib/textos';
import { exportarBackup } from './lib/backup';
import { agruparHoje, agruparSemana, ordenarConcluidas } from './lib/visoes';
import { diaEmIso09h } from './lib/datas';
import { tarefasComLembreteNoDia } from './lib/calendario';
import { capitalizarPrimeiraLetra } from './lib/formatacao';
import {
  jaPerguntou,
  marcarPerguntado,
  permissaoAtual,
  solicitarPermissao,
  suportado,
} from './lib/notificacoes';
import type { Categoria, Tarefa } from './types/tarefa';
import type { CategoriaDef } from './types/categoria';

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
  const [mesVisualizado, setMesVisualizado] = useState(() => new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [gerenciarCategoriasAberto, setGerenciarCategoriasAberto] = useState(false);
  const [backupAberto, setBackupAberto] = useState(false);
  const {
    categorias,
    criar: criarCategoria,
    editar: editarCategoria,
    substituir: substituirCategorias,
  } = useCategorias();
  const {
    estado: estadoVoz,
    iniciar: iniciarVoz,
    parar: pararVoz,
    cancelar: cancelarVoz,
    resetar: resetarVoz,
  } = useCapturaVoz(categorias);
  const { tema, alternarTema } = useTema();
  const { idPendente, tipoPendente, agendar: agendarDesfazer, desfazer } = useDesfazer(dispatch);

  const filtroAtivo = categoriasSelecionadas.length > 0;
  const tarefasFiltradas = tarefas.filter(
    (tarefa) =>
      tarefa.id !== idPendente &&
      (!filtroAtivo ||
        (tarefa.categoria !== null && categoriasSelecionadas.includes(tarefa.categoria))),
  );
  const possuiLembretesPendentes = tarefas.some(
    (tarefa) => !tarefa.concluida && tarefa.lembreteEm !== null,
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

  function handleAdicionarNoDia(titulo: string) {
    if (diaSelecionado === null) return;
    const lembreteEm = diaEmIso09h(diaSelecionado);
    dispatch({ tipo: 'adicionar', titulo, categoria: null, lembreteEm, nota: null, origem: 'texto' });
    setAnuncio('Tarefa criada');
    avaliarPermissaoAoCriarLembrete(lembreteEm);
  }

  const fasesComPainelAberto: EstadoCapturaVoz['fase'][] = ['capturando', 'processando', 'erro', 'confirmando'];
  const painelVozAberto = fasesComPainelAberto.includes(estadoVoz.fase);
  const algumPainelAberto =
    painelVozAberto || diaSelecionado !== null || gerenciarCategoriasAberto || backupAberto;

  useEffect(() => {
    if (!algumPainelAberto) return;

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key !== 'Escape') return;
      if (painelVozAberto) cancelarVoz();
      else if (gerenciarCategoriasAberto) setGerenciarCategoriasAberto(false);
      else if (backupAberto) setBackupAberto(false);
      else setDiaSelecionado(null);
    }
    document.addEventListener('keydown', aoPressionarTecla);
    return () => document.removeEventListener('keydown', aoPressionarTecla);
  }, [algumPainelAberto, painelVozAberto, gerenciarCategoriasAberto, backupAberto, cancelarVoz]);

  async function handlePermitirNotificacoes() {
    const resultado = await solicitarPermissao();
    setPermissao(resultado);
    setExplicarNotificacoesAberto(false);
  }

  function handleConcluir(id: string) {
    agendarDesfazer({ id, tipo: 'concluir' });
    setAnuncio(textos.tarefaConcluida);
  }

  function handleExcluir(id: string) {
    agendarDesfazer({ id, tipo: 'excluir' });
    setAnuncio(textos.tarefaExcluida);
  }

  function handleExportarBackup() {
    exportarBackup(tarefas, categorias);
    setAnuncio(textos.dadosExportados);
  }

  function handleImportarBackup(tarefasImportadas: Tarefa[], categoriasImportadas: CategoriaDef[]) {
    dispatch({ tipo: 'substituirTudo', tarefas: tarefasImportadas });
    substituirCategorias(categoriasImportadas);
    setAnuncio(textos.dadosImportados);
    setBackupAberto(false);
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="mx-auto w-full max-w-[640px] px-margin-mobile pb-32 pt-lg">
        <header className="mb-lg flex items-start justify-between">
          <div>
            <h1 className="text-display-md-mobile text-on-surface">{textos.tituloApp}</h1>
            <p className="text-body-md text-on-surface-variant">{textos.subtituloApp}</p>
          </div>
          <div className="flex items-center gap-xs">
            <BackupButton onAbrir={() => setBackupAberto(true)} />
            <ThemeToggle tema={tema} onAlternar={alternarTema} />
          </div>
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
        {permissao === 'default' && suportado() && possuiLembretesPendentes && (
          <NotificationEnableNotice onAtivar={() => setExplicarNotificacoesAberto(true)} />
        )}

        <ViewTabs visao={visao} onMudar={setVisao} />
        <div className="mb-md">
          <FilterBar
            categorias={categorias}
            categoriasSelecionadas={categoriasSelecionadas}
            onAlternar={alternarCategoria}
            onLimpar={limparFiltros}
            onGerenciarCategorias={() => setGerenciarCategoriasAberto(true)}
          />
        </div>

        {visao === 'hoje' && (
          <VisaoHoje
            tarefas={tarefasFiltradas}
            categorias={categorias}
            tarefaDestacada={tarefaDestacada}
            onConcluir={handleConcluir}
            onExcluir={handleExcluir}
            mensagemVazia={filtroAtivo ? textos.listaVaziaFiltro : textos.listaVazia}
          />
        )}
        {visao === 'semana' && (
          <VisaoSemana
            tarefas={tarefasFiltradas}
            categorias={categorias}
            tarefaDestacada={tarefaDestacada}
            onConcluir={handleConcluir}
            onExcluir={handleExcluir}
          />
        )}
        {visao === 'calendario' && (
          <CalendarGrid
            mesVisualizado={mesVisualizado}
            tarefas={tarefasFiltradas}
            categorias={categorias}
            diaSelecionado={diaSelecionado}
            onMudarMes={setMesVisualizado}
            onSelecionarDia={setDiaSelecionado}
          />
        )}
        {visao === 'concluidas' && (
          <VisaoConcluidas
            tarefas={tarefasFiltradas}
            categorias={categorias}
            tarefaDestacada={tarefaDestacada}
            onConcluir={handleConcluir}
            onExcluir={handleExcluir}
          />
        )}
      </main>

      <TaskForm categorias={categorias} onAdicionar={handleAdicionar} onIniciarVoz={iniciarVoz} />

      {diaSelecionado && (
        <DayDetailPanel
          dia={diaSelecionado}
          tarefas={tarefasComLembreteNoDia(tarefasFiltradas, diaSelecionado)}
          categorias={categorias}
          tarefaDestacada={tarefaDestacada}
          onFechar={() => setDiaSelecionado(null)}
          onConcluir={handleConcluir}
          onExcluir={handleExcluir}
          onAdicionarNoDia={handleAdicionarNoDia}
        />
      )}

      {gerenciarCategoriasAberto && (
        <CategoryManager
          categorias={categorias}
          onFechar={() => setGerenciarCategoriasAberto(false)}
          onCriar={criarCategoria}
          onEditar={editarCategoria}
        />
      )}

      {backupAberto && (
        <BackupPanel
          onFechar={() => setBackupAberto(false)}
          onExportar={handleExportarBackup}
          onImportar={handleImportarBackup}
        />
      )}

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
          categorias={categorias}
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

      {idPendente && (
        <UndoToast
          mensagem={tipoPendente === 'concluir' ? textos.tarefaConcluida : textos.tarefaExcluida}
          onDesfazer={desfazer}
        />
      )}
    </div>
  );
}

type VisaoProps = {
  tarefas: ReturnType<typeof useTarefas>['tarefas'];
  categorias: CategoriaDef[];
  tarefaDestacada: string | null;
  onConcluir: (id: string) => void;
  onExcluir: (id: string) => void;
};

function VisaoHoje({
  tarefas,
  categorias,
  tarefaDestacada,
  onConcluir,
  onExcluir,
  mensagemVazia,
}: VisaoProps & { mensagemVazia: string }) {
  const { comData, semData } = agruparHoje(tarefas);

  if (comData.length === 0 && semData.length === 0) {
    return <p className="mt-lg text-center text-body-md text-on-surface-variant">{mensagemVazia}</p>;
  }

  return (
    <div className="flex flex-col gap-lg">
      {comData.length > 0 && (
        <TaskList
          tarefas={comData}
          categorias={categorias}
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
            categorias={categorias}
            tarefaDestacada={tarefaDestacada}
            onConcluir={onConcluir}
            onExcluir={onExcluir}
          />
        </div>
      )}
    </div>
  );
}

function VisaoSemana({ tarefas, categorias, tarefaDestacada, onConcluir, onExcluir }: VisaoProps) {
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
              categorias={categorias}
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

function VisaoConcluidas({ tarefas, categorias, tarefaDestacada, onConcluir, onExcluir }: VisaoProps) {
  const concluidas = ordenarConcluidas(tarefas);

  return (
    <TaskList
      tarefas={concluidas}
      categorias={categorias}
      tarefaDestacada={tarefaDestacada}
      onConcluir={onConcluir}
      onExcluir={onExcluir}
      mensagemVazia={textos.concluidasListaVazia}
      somenteExibirConclusao
    />
  );
}
