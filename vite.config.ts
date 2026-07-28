import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Caminho relativo: funciona tanto na raiz do domínio (dev, domínio próprio)
  // quanto num subcaminho como github.com/<user>/TaskFlow, sem precisar
  // hardcodar o nome do repositório aqui.
  base: './',
  plugins: [react()],
});
