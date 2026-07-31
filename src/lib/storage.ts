import { z } from 'zod';
import type { EstadoPersistido } from '../types/tarefa';

const CHAVE = 'tarefas:v1';
const CHAVE_BACKUP = 'tarefas:v1:backup';
const DEBOUNCE_MS = 300;

const categoriaSchema = z.enum(['trabalho', 'casa', 'familia', 'compras']);

const tarefaSchema = z.object({
  id: z.string(),
  titulo: z.string().min(1).max(200),
  nota: z.string().nullable(),
  categoria: categoriaSchema.nullable(),
  lembreteEm: z.string().nullable(),
  concluida: z.boolean(),
  criadaEm: z.string(),
  concluidaEm: z.string().nullable(),
  notificada: z.boolean(),
  origem: z.enum(['texto', 'voz']),
});

const estadoPersistidoSchema = z.object({
  versao: z.literal(1),
  tarefas: z.array(tarefaSchema),
});

export const ESTADO_VAZIO: EstadoPersistido = { versao: 1, tarefas: [] };

export function carregarEstado(): { estado: EstadoPersistido; corrompido: boolean } {
  const bruto = localStorage.getItem(CHAVE);
  if (bruto === null) {
    return { estado: ESTADO_VAZIO, corrompido: false };
  }

  const resultado = estadoPersistidoSchema.safeParse(parseJsonOrNull(bruto));
  if (resultado.success) {
    return { estado: resultado.data, corrompido: false };
  }

  localStorage.setItem(CHAVE_BACKUP, bruto);
  return { estado: ESTADO_VAZIO, corrompido: true };
}

function parseJsonOrNull(bruto: string): unknown {
  try {
    return JSON.parse(bruto);
  } catch {
    return null;
  }
}

let temporizador: ReturnType<typeof setTimeout> | null = null;
let estadoPendente: EstadoPersistido | null = null;

function persistirPendente(): void {
  if (temporizador) {
    clearTimeout(temporizador);
    temporizador = null;
  }
  if (estadoPendente === null) return;
  localStorage.setItem(CHAVE, JSON.stringify(estadoPendente));
  estadoPendente = null;
}

// Sem isso, uma tarefa criada e seguida de reload/fechamento rápido da aba
// (antes dos 300ms do debounce) se perderia: o timer nunca chega a disparar.
// visibilitychange cobre tanto trocar de aba quanto fechar/recarregar.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persistirPendente();
  });
  window.addEventListener('pagehide', persistirPendente);
}

export function salvarEstado(estado: EstadoPersistido): void {
  estadoPendente = estado;
  if (temporizador) clearTimeout(temporizador);
  temporizador = setTimeout(persistirPendente, DEBOUNCE_MS);
}
