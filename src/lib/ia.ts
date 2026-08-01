// Chamada direta do navegador para a API da Groq: isso expõe a chave no
// bundle do cliente. Aceitável apenas em uso local (ver SPEC.md "Segurança
// da chave"); para produção, essa chamada precisaria passar por um proxy que
// injete a chave no servidor.
import { z } from 'zod';
import type { CategoriaDef } from '../types/categoria';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODELO = 'llama-3.3-70b-versatile';
const TIMEOUT_MS = 10_000;

// A IA não conhece os ids das categorias do usuário, só devolve o nome —
// resolvemos para o id correspondente depois da resposta (ver resolverCategoria).
const respostaIaSchema = z.object({
  titulo: z.string().min(1),
  nota: z.string().nullable(),
  categoria: z.string().nullable(),
  lembrete: z.string().nullable(),
  confianca: z.enum(['alta', 'media', 'baixa']),
});

export type TarefaInterpretada = {
  titulo: string;
  nota: string | null;
  categoria: string | null;
  lembrete: string | null;
  confianca: 'alta' | 'media' | 'baixa';
};

export type ResultadoInterpretacao =
  | { ok: true; tarefa: TarefaInterpretada }
  | { ok: false };

function montarPrompt(transcricao: string, categorias: CategoriaDef[]): string {
  const agora = new Date().toISOString();
  const nomesCategorias = categorias.map((categoria) => categoria.nome);
  const opcoesCategoria =
    nomesCategorias.length > 0
      ? nomesCategorias.map((nome) => `"${nome}"`).join('|') + '|null'
      : 'null';

  return `Você extrai tarefas de frases em português brasileiro.
Data e hora atual: ${agora} (timezone America/Sao_Paulo).

Retorne APENAS um objeto JSON, sem markdown, sem explicação, no formato:
{"titulo": string, "nota": string|null, "categoria": ${opcoesCategoria}, "lembrete": string|null, "confianca": "alta"|"media"|"baixa"}

Regras:
- "titulo": ação principal, imperativo curto, sem a parte temporal.
- "lembrete": ISO 8601 com offset, ou null se não houver referência de tempo.
- Resolva expressões relativas ("amanhã", "sexta que vem", "daqui a duas horas") com base na data atual informada.
- Se houver data sem hora, use 09:00.
- "categoria": escolha exatamente um destes nomes se fizer sentido: ${nomesCategorias.join(', ') || '(nenhuma categoria cadastrada)'}. Use null quando não estiver claro ou nenhuma se encaixar; nunca invente uma categoria nova.
- "confianca": "baixa" se a frase for ambígua.

Frase: "${transcricao}"`;
}

function resolverCategoria(nome: string | null, categorias: CategoriaDef[]): string | null {
  if (nome === null) return null;
  const encontrada = categorias.find(
    (categoria) => categoria.nome.toLowerCase() === nome.toLowerCase(),
  );
  return encontrada?.id ?? null;
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

export async function interpretarTarefa(
  transcricao: string,
  categorias: CategoriaDef[],
): Promise<ResultadoInterpretacao> {
  const chave = import.meta.env.VITE_AI_API_KEY;
  if (!chave) return { ok: false };

  const prompt = montarPrompt(transcricao, categorias);

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
    if (!resultado.success) return { ok: false };

    return {
      ok: true,
      tarefa: {
        ...resultado.data,
        categoria: resolverCategoria(resultado.data.categoria, categorias),
      },
    };
  } catch {
    return { ok: false };
  }
}
