export type Categoria = 'trabalho' | 'casa' | 'familia' | 'compras';

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
