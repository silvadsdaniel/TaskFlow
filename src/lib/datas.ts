// Brasil não observa horário de verão desde 2019: America/Sao_Paulo é UTC-3 fixo,
// o que permite calcular limites de dia sem depender de uma lib de timezone.
const OFFSET_SAO_PAULO_MS = -3 * 60 * 60 * 1000;

function agoraEmSaoPaulo(): Date {
  return new Date(Date.now() + OFFSET_SAO_PAULO_MS);
}

function inicioDoDia(dataSaoPaulo: Date): Date {
  const meiaNoiteLocal = Date.UTC(
    dataSaoPaulo.getUTCFullYear(),
    dataSaoPaulo.getUTCMonth(),
    dataSaoPaulo.getUTCDate(),
  );
  return new Date(meiaNoiteLocal - OFFSET_SAO_PAULO_MS);
}

export function limitesDoDiaAtual(): { inicio: Date; fim: Date } {
  const inicio = inicioDoDia(agoraEmSaoPaulo());
  const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { inicio, fim };
}

export function limitesDosProximosDias(quantidade: number): { inicio: Date; fim: Date }[] {
  const { inicio: inicioHoje } = limitesDoDiaAtual();
  return Array.from({ length: quantidade }, (_, indice) => {
    const inicio = new Date(inicioHoje.getTime() + indice * 24 * 60 * 60 * 1000);
    const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000 - 1);
    return { inicio, fim };
  });
}

export function estaAtrasada(lembreteEm: string | null): boolean {
  if (lembreteEm === null) return false;
  return new Date(lembreteEm).getTime() < Date.now();
}
