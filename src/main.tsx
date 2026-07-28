import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Caminho relativo à base do app: em produção sob um subcaminho
    // (ex.: github.io/TaskFlow/), "/sw.js" apontaria pra raiz errada do domínio.
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  });
}
