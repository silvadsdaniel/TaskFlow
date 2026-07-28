import type { Tarefa } from '../types/tarefa';

const CHAVE_JA_PERGUNTOU = 'notificacoes:perguntado';

export function suportado(): boolean {
  return 'Notification' in window;
}

export function permissaoAtual(): NotificationPermission | 'indisponivel' {
  return suportado() ? Notification.permission : 'indisponivel';
}

export async function solicitarPermissao(): Promise<NotificationPermission> {
  return Notification.requestPermission();
}

export function jaPerguntou(): boolean {
  return localStorage.getItem(CHAVE_JA_PERGUNTOU) === 'true';
}

export function marcarPerguntado(): void {
  localStorage.setItem(CHAVE_JA_PERGUNTOU, 'true');
}

export function dispararNotificacao(tarefa: Tarefa, aoClicar: () => void): void {
  if (!suportado() || Notification.permission !== 'granted') return;

  const notificacao = new Notification(tarefa.titulo, {
    tag: tarefa.id,
    body: tarefa.nota ?? undefined,
  });
  notificacao.onclick = () => {
    window.focus();
    aoClicar();
    notificacao.close();
  };
}
