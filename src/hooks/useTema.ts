import { useCallback, useEffect, useState } from 'react';
import { aplicarTema, carregarTema, prefereEscuroNoSistema, salvarTema, type Tema } from '../lib/tema';

const ORDEM: Tema[] = ['sistema', 'claro', 'escuro'];

export function useTema() {
  const [tema, setTema] = useState<Tema>(carregarTema);

  useEffect(() => {
    aplicarTema(tema);
    salvarTema(tema);

    if (tema !== 'sistema') return;
    const consulta = window.matchMedia('(prefers-color-scheme: dark)');
    const aoMudar = () => aplicarTema('sistema');
    consulta.addEventListener('change', aoMudar);
    return () => consulta.removeEventListener('change', aoMudar);
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((atual) => ORDEM[(ORDEM.indexOf(atual) + 1) % ORDEM.length]);
  }, []);

  return { tema, alternarTema, escuroResolvido: tema === 'escuro' || (tema === 'sistema' && prefereEscuroNoSistema()) };
}
