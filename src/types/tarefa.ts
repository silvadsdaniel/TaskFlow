// Id de uma CategoriaDef (ver src/types/categoria.ts). Categorias hoje são
// definidas pelo usuário, então não há mais um conjunto fixo de valores.
export type Categoria = string;

export type Recorrencia =
  | { tipo: 'diaria' }
  | { tipo: 'semanal' }
  | { tipo: 'mensal' }
  // 0 = domingo … 6 = sábado. Sempre com ao menos um dia.
  | { tipo: 'diasDaSemana'; dias: number[] };

export type Prioridade = 'normal' | 'importante';

export type Subtarefa = {
  id: string;
  texto: string;
  concluida: boolean;
};

export type Tarefa = {
  id: string;
  titulo: string;
  nota: string | null;
  categoria: Categoria | null;
  tags: string[];
  lembreteEm: string | null;
  recorrencia: Recorrencia | null;
  prioridade: Prioridade;
  subtarefas: Subtarefa[];
  concluida: boolean;
  criadaEm: string;
  concluidaEm: string | null;
  notificada: boolean;
  origem: 'texto' | 'voz';
};

export type EstadoPersistido = {
  versao: 3;
  tarefas: Tarefa[];
};
