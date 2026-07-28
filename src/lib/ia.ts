// Chamada direta do navegador para a API da Groq: isso expõe a chave no
// bundle do cliente. Aceitável apenas em uso local (ver SPEC.md "Segurança
// da chave"); para produção, essa chamada precisaria passar por um proxy que
// injete a chave no servidor.
import { z } from 'zod';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODELO = 'llama-3.3-70b-versatile';
const TIMEOUT_MS = 10_000;

const respostaIaSchema = z.object({
  titulo: z.string().min(1),
  nota: z.string().nullable(),
  categoria: z.enum(['trabalho', 'casa', 'familia', 'compras']).nullable(),
  lembrete: z.string().nullable(),
  confianca: z.enum(['alta', 'media', 'baixa']),
});

export type TarefaInterpretada = z.infer<typeof respostaIaSchema>;

export type ResultadoInterpretacao =
  | { ok: true; tarefa: TarefaInterpretada }
  | { ok: false };

function montarPrompt(transcricao: string): string {
  const agora = new Date().toISOString();
  return `Você extrai tarefas de frases em português brasileiro.
Data e hora atual: ${agora} (timezone America/Sao_Paulo).

Retorne APENAS um objeto JSON, sem markdown, sem explicação, no formato:
{"titulo": string, "nota": string|null, "categoria": "trabalho"|"casa"|"familia"|"compras"|null, "lembrete": string|null, "confianca": "alta"|"media"|"baixa"}

Regras:
- "titulo": ação principal, imperativo curto, sem a parte temporal.
- "lembrete": ISO 8601 com offset, ou null se não houver referência de tempo.
- Resolva expressões relativas ("amanhã", "sexta que vem", "daqui a duas horas") com base na data atual informada.
- Se houver data sem hora, use 09:00.
- "categoria": infira pelo conteúdo. Use null quando não estiver claro; não force.
- "confianca": "baixa" se a frase for ambígua.

Frase: "${transcricao}"`;
}

function removerCercasMarkdown(texto: string): string {
  return texto
    .trim()
    .replace(/^```(json)?/i, '')
    .replace(/```$/, '')
    .trim();
}

async function chamarIA(chave: string, prompt: string): Promise<string> {
  const controlador = new AbortController();
  const timeout = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  try {
    const resposta = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${chave}`,
      },
      body: JSON.stringify({
        model: MODELO,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controlador.signal,
    });

    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const dados: unknown = await resposta.json();
    const conteudo = extrairConteudo(dados);
    if (conteudo === null) throw new Error('Resposta sem conteúdo');
    return conteudo;
  } finally {
    clearTimeout(timeout);
  }
}

function extrairConteudo(dados: unknown): string | null {
  if (typeof dados !== 'object' || dados === null || !('choices' in dados)) return null;
  const choices = (dados as { choices: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const conteudo: unknown = choices[0]?.message?.content;
  return typeof conteudo === 'string' ? conteudo : null;
}

export async function interpretarTarefa(transcricao: string): Promise<ResultadoInterpretacao> {
  const chave = import.meta.env.VITE_AI_API_KEY;
  if (!chave) return { ok: false };

  const prompt = montarPrompt(transcricao);

  let bruto: string;
  try {
    bruto = await chamarIA(chave, prompt);
  } catch {
    try {
      bruto = await chamarIA(chave, prompt); // uma tentativa de retry em caso de erro de rede
    } catch {
      return { ok: false };
    }
  }

  try {
    const json: unknown = JSON.parse(removerCercasMarkdown(bruto));
    const resultado = respostaIaSchema.safeParse(json);
    return resultado.success ? { ok: true, tarefa: resultado.data } : { ok: false };
  } catch {
    return { ok: false };
  }
}
