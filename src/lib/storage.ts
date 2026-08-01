import { z } from 'zod';
import type { EstadoPersistido } from '../types/tarefa';

const CHAVE = 'tarefas:v1';
const CHAVE_BACKUP = 'tarefas:v1:backup';
const DEBOUNCE_MS = 300;

const subtarefaSchema = z.object({
  id: z.string(),
  texto: z.string().min(1).max(200),
  concluida: z.boolean(),
});

export const tarefaSchema = z.object({
  id: z.string(),
  titulo: z.string().min(1).max(200),
  nota: z.string().nullable(),
  // Id de uma categoria definida pelo usuário (ver categorias:v1) — não é
  // mais um enum fixo, então só validamos que é string ou null.
  categoria: z.string().nullable(),
  // .default() abaixo permite ler tanto o formato antigo (sem estes campos,
  // versão 1 do estado persistido) quanto o atual — ver migração em
  // carregarEstado.
  tags: z.array(z.string()).default([]),
  lembreteEm: z.string().nullable(),
  recorrencia: z.enum(['diaria', 'semanal', 'mensal']).nullable().default(null),
  prioridade: z.enum(['normal', 'importante']).default('normal'),
  subtarefas: z.array(subtarefaSchema).default([]),
  concluida: z.boolean(),
  criadaEm: z.string(),
  concluidaEm: z.string().nullable(),
  notificada: z.boolean(),
  origem: z.enum(['texto', 'voz']),
});

const estadoPersistidoSchema = z.object({
  // Aceita a chave gravada tanto na versão 1 (sem tags/recorrência/prioridade/
  // subtarefas) quanto na versão 2 — o schema de tarefa acima já preenche os
  // campos novos com o padrão quando ausentes.
  versao: z.union([z.literal(1), z.literal(2)]),
  tarefas: z.array(tarefaSchema),
});

export const ESTADO_VAZIO: EstadoPersistido = { versao: 2, tarefas: [] };

export function carregarEstado(): { estado: EstadoPersistido; corrompido: boolean } {
  const bruto = localStorage.getItem(CHAVE);
  if (bruto === null) {
    return { estado: ESTADO_VAZIO, corrompido: false };
  }

  const resultado = estadoPersistidoSchema.safeParse(parseJsonOrNull(bruto));
  if (resultado.success) {
    return { estado: { versao: 2, tarefas: resultado.data.tarefas }, corrompido: false };
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
