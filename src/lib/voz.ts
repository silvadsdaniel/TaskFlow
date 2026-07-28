export type ErroReconhecimentoVoz = 'not-allowed' | 'no-speech' | 'network' | 'aborted' | 'outro';

const TIMEOUT_CAPTURA_MS = 15_000;

const MAPA_ERROS: Record<string, ErroReconhecimentoVoz> = {
  'not-allowed': 'not-allowed',
  'no-speech': 'no-speech',
  network: 'network',
  aborted: 'aborted',
};

export function suportadoReconhecimentoVoz(): boolean {
  return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}

type CallbacksReconhecimento = {
  aoAtualizarParcial: (textoParcial: string) => void;
  aoFinalizar: (textoFinal: string) => void;
  aoErro: (erro: ErroReconhecimentoVoz) => void;
};

export type ControleReconhecimento = {
  // Encerra a captura e deixa o resultado ser processado normalmente
  // (usado quando o usuário aperta "parar" para confirmar antes da fala acabar sozinha).
  pararEProcessar: () => void;
  // Encerra a captura e descarta qualquer resultado (usado no cancelamento).
  cancelar: () => void;
};

export function iniciarReconhecimento(callbacks: CallbacksReconhecimento): ControleReconhecimento {
  const Construtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Construtor) throw new Error('Reconhecimento de voz não suportado neste navegador');

  const reconhecimento = new Construtor();
  reconhecimento.lang = 'pt-BR';
  reconhecimento.interimResults = true;
  reconhecimento.continuous = false;

  let textoFinal = '';
  let cancelado = false;

  const timeout = setTimeout(() => reconhecimento.stop(), TIMEOUT_CAPTURA_MS);

  reconhecimento.onresult = (evento) => {
    let parcial = '';
    for (let indice = evento.resultIndex; indice < evento.results.length; indice++) {
      const resultado = evento.results[indice];
      if (resultado.isFinal) {
        textoFinal += resultado[0].transcript;
      } else {
        parcial += resultado[0].transcript;
      }
    }
    callbacks.aoAtualizarParcial((textoFinal + parcial).trim());
  };

  reconhecimento.onerror = (evento) => {
    clearTimeout(timeout);
    if (!cancelado) callbacks.aoErro(MAPA_ERROS[evento.error] ?? 'outro');
  };

  reconhecimento.onend = () => {
    clearTimeout(timeout);
    if (!cancelado) callbacks.aoFinalizar(textoFinal.trim());
  };

  reconhecimento.start();

  return {
    pararEProcessar: () => reconhecimento.stop(),
    cancelar: () => {
      cancelado = true;
      clearTimeout(timeout);
      reconhecimento.stop();
    },
  };
}
