import { z } from 'zod';
import type { Tarefa } from '../types/tarefa';
import type { CategoriaDef } from '../types/categoria';
import { tarefaSchema } from './storage';
import { categoriaDefSchema } from './categoriasStorage';

export type BackupExportado = {
  versao: 1;
  exportadoEm: string;
  tarefas: Tarefa[];
  categorias: CategoriaDef[];
};

const backupSchema = z.object({
  versao: z.literal(1),
  exportadoEm: z.string(),
  tarefas: z.array(tarefaSchema),
  categorias: z.array(categoriaDefSchema),
});

export function exportarBackup(tarefas: Tarefa[], categorias: CategoriaDef[]): void {
  const backup: BackupExportado = {
    versao: 1,
    exportadoEm: new Date().toISOString(),
    tarefas,
    categorias,
  };

  const nomeArquivo = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();

  URL.revokeObjectURL(url);
}

export async function lerBackupDeArquivo(
  arquivo: File,
): Promise<{ sucesso: true; backup: BackupExportado } | { sucesso: false }> {
  const texto = await arquivo.text();

  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    return { sucesso: false };
  }

  const resultado = backupSchema.safeParse(bruto);
  if (!resultado.success) return { sucesso: false };

  return { sucesso: true, backup: resultado.data };
}
