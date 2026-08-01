import type { Recorrencia } from '../types/tarefa';

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

// input[type=datetime-local] retorna "AAAA-MM-DDTHH:mm", sem timezone.
// Assumimos que o relógio do navegador está em America/Sao_Paulo (mesma
// premissa de OFFSET_SAO_PAULO_MS usada no resto deste módulo).
export function valorDatetimeLocalParaIso(valor: string): string {
  return `${valor}:00-03:00`;
}

// input[type=datetime-local] usa o horário local do sistema operacional
// (getHours/getMinutes), não UTC — por isso não usamos toISOString aqui.
export function valorMinimoDatetimeLocal(): string {
  const agora = new Date(Date.now() + 60_000);
  const preencher = (numero: number) => String(numero).padStart(2, '0');
  return (
    `${agora.getFullYear()}-${preencher(agora.getMonth() + 1)}-${preencher(agora.getDate())}` +
    `T${preencher(agora.getHours())}:${preencher(agora.getMinutes())}`
  );
}

// Inverso de valorDatetimeLocalParaIso, para pré-preencher o input ao editar
// uma tarefa existente — mesma premissa de fuso do navegador documentada ali.
export function isoParaValorDatetimeLocal(iso: string): string {
  const data = new Date(iso);
  const preencher = (numero: number) => String(numero).padStart(2, '0');
  return (
    `${data.getFullYear()}-${preencher(data.getMonth() + 1)}-${preencher(data.getDate())}` +
    `T${preencher(data.getHours())}:${preencher(data.getMinutes())}`
  );
}

// Mesma regra usada na interpretação por IA: data sem hora vira 09:00.
export function diaEmIso09h(dia: Date): string {
  const preencher = (numero: number) => String(numero).padStart(2, '0');
  return `${dia.getFullYear()}-${preencher(dia.getMonth() + 1)}-${preencher(dia.getDate())}T09:00:00-03:00`;
}

type CamposSaoPaulo = { ano: number; mes: number; dia: number; hora: number; minuto: number };

// Diferente de diaEmIso09h/valorMinimoDatetimeLocal, esta função não parte de
// um input do usuário (que só existe no fuso do sistema operacional) — parte
// de um ISO já gravado. Por isso pode e deve ser imune ao fuso do navegador:
// desloca o instante pelo offset fixo e lê os campos em UTC, igual
// agoraEmSaoPaulo/inicioDoDia fazem.
function paraCamposSaoPaulo(instante: Date): CamposSaoPaulo {
  const deslocado = new Date(instante.getTime() + OFFSET_SAO_PAULO_MS);
  return {
    ano: deslocado.getUTCFullYear(),
    mes: deslocado.getUTCMonth(),
    dia: deslocado.getUTCDate(),
    hora: deslocado.getUTCHours(),
    minuto: deslocado.getUTCMinutes(),
  };
}

function camposSaoPauloParaIso(campos: CamposSaoPaulo): string {
  const preencher = (numero: number) => String(numero).padStart(2, '0');
  return (
    `${campos.ano}-${preencher(campos.mes + 1)}-${preencher(campos.dia)}` +
    `T${preencher(campos.hora)}:${preencher(campos.minuto)}:00-03:00`
  );
}

// 0 = domingo … 6 = sábado. Calculado em UTC "puro" (sem aplicar offset de
// novo, os campos já representam o dia certo em São Paulo).
function diaDaSemanaDeCampos(campos: CamposSaoPaulo): number {
  return new Date(Date.UTC(campos.ano, campos.mes, campos.dia)).getUTCDay();
}

function somarDias(campos: CamposSaoPaulo, quantidade: number): CamposSaoPaulo {
  const data = new Date(Date.UTC(campos.ano, campos.mes, campos.dia + quantidade, campos.hora, campos.minuto));
  return {
    ano: data.getUTCFullYear(),
    mes: data.getUTCMonth(),
    dia: data.getUTCDate(),
    hora: data.getUTCHours(),
    minuto: data.getUTCMinutes(),
  };
}

function somarMeses(campos: CamposSaoPaulo, quantidade: number): CamposSaoPaulo {
  const totalMeses = campos.mes + quantidade;
  const ano = campos.ano + Math.floor(totalMeses / 12);
  const mes = ((totalMeses % 12) + 12) % 12;
  // Clampa no último dia do mês alvo (ex: 31/jan + 1 mês vira 28 ou 29/fev,
  // nunca 3/mar), igual ao comportamento esperado de "todo mês".
  const ultimoDiaDoMesAlvo = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  return { ano, mes, dia: Math.min(campos.dia, ultimoDiaDoMesAlvo), hora: campos.hora, minuto: campos.minuto };
}

export function proximaOcorrencia(lembreteEm: string, recorrencia: Recorrencia): string {
  const atual = paraCamposSaoPaulo(new Date(lembreteEm));

  if (recorrencia.tipo === 'diaria') return camposSaoPauloParaIso(somarDias(atual, 1));
  if (recorrencia.tipo === 'semanal') return camposSaoPauloParaIso(somarDias(atual, 7));
  if (recorrencia.tipo === 'mensal') return camposSaoPauloParaIso(somarMeses(atual, 1));

  // diasDaSemana: primeiro dia a partir de amanhã cujo dia da semana está marcado.
  for (let deslocamento = 1; deslocamento <= 7; deslocamento++) {
    const candidato = somarDias(atual, deslocamento);
    if (recorrencia.dias.includes(diaDaSemanaDeCampos(candidato))) {
      return camposSaoPauloParaIso(candidato);
    }
  }
  // Inalcançável: dias sempre tem ao menos um elemento (validado no reducer/UI).
  return camposSaoPauloParaIso(somarDias(atual, 7));
}
