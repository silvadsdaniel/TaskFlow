export type Tema = 'claro' | 'escuro' | 'sistema';

const CHAVE = 'tema:v1';

export function carregarTema(): Tema {
  const bruto = localStorage.getItem(CHAVE);
  return bruto === 'claro' || bruto === 'escuro' ? bruto : 'sistema';
}

export function salvarTema(tema: Tema): void {
  localStorage.setItem(CHAVE, tema);
}

export function prefereEscuroNoSistema(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function aplicarTema(tema: Tema): void {
  const escuro = tema === 'escuro' || (tema === 'sistema' && prefereEscuroNoSistema());
  document.documentElement.classList.toggle('dark', escuro);
}
