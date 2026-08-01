// Id de uma CategoriaDef (ver src/types/categoria.ts). Categorias hoje são
// definidas pelo usuário, então não há mais um conjunto fixo de valores.
export type Categoria = string;

export type Tarefa = {
  id: string;
  titulo: string;
  nota: string | null;
  categoria: Categoria | null;
  lembreteEm: string | null;
  concluida: boolean;
  criadaEm: string;
  concluidaEm: string | null;
  notificada: boolean;
  origem: 'texto' | 'voz';
};

export type EstadoPersistido = {
  versao: 1;
  tarefas: Tarefa[];
};
