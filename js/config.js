/**
 * config.js
 * Única fonte de constantes de configuração da plataforma. Nenhum outro
 * módulo deve ter "números mágicos" soltos — se um valor pode mudar por
 * decisão de produto (não de lógica), ele mora aqui.
 */

/** Prefixo de todas as chaves gravadas no localStorage (storage.js). */
export const STORAGE_NAMESPACE = "codelab-edu";

/** XP necessário para completar um nível. Curva simples e linear por
 *  enquanto — o Sprint 5 pode substituir por uma curva progressiva. */
export const XP_PER_LEVEL = 100;

/**
 * Linguagens suportadas e seu estado. Decisão do Sprint 1: C/C++ é a
 * prioridade do MVP, compilada via API externa. As demais entram
 * progressivamente (ver spec "FUTURAS LINGUAGENS").
 */
export const LANGUAGES = {
  cpp: { label: "C++", enabled: true, engine: "external-api" },
  c: { label: "C", enabled: true, engine: "external-api" },
  python: { label: "Python", enabled: false, engine: "pyodide" },
  csharp: { label: "C#", enabled: false, engine: "external-api" },
  java: { label: "Java", enabled: false, engine: "external-api" },
  javascript: { label: "JavaScript", enabled: false, engine: "native" },
  php: { label: "PHP", enabled: false, engine: "external-api" },
  sql: { label: "SQL", enabled: false, engine: "external-api" },
};

/**
 * Configuração da API de compilação (Sprint 3).
 *
 * Decisão confirmada com o professor: Judge0 CE via RapidAPI.
 *
 * IMPORTANTE — trade-off de segurança aceito conscientemente neste sprint:
 * o ideal (documentado em docs/api.md) é nunca expor a chave de API no
 * front-end, usando um proxy serverless. Como este projeto ainda não tem
 * um backend hospedado, a chave é fornecida pelo PRÓPRIO PROFESSOR através
 * do painel de Configurações e fica salva só no localStorage do
 * navegador dele — nunca commitada no repositório, nunca hardcoded aqui.
 * Isso é aceitável para uso de um único professor testando/demonstrando
 * a plataforma, mas NÃO é seguro para destravar em produção com a chave
 * de um aluno-administrador só — antes de distribuir pra várias turmas,
 * construir o proxy vira prioridade (ver docs/api.md).
 */
export const JUDGE0 = {
  host: "judge0-ce.p.rapidapi.com",
  baseUrl: "https://judge0-ce.p.rapidapi.com",
  // IDs de linguagem do Judge0 CE (GET /languages) — GCC 9.2.0.
  languageIds: {
    c: 50,
    cpp: 54,
  },
  timeoutMs: 15000,
};

/**
 * Configuração do Monaco Editor (Sprint 2). `cdnVersion` precisa ficar em
 * sincronia com a tag <script> do loader em index.html — se atualizar
 * uma, atualize a outra.
 */
export const EDITOR_DEFAULTS = {
  cdnVersion: "0.55.1",
  defaultLanguage: "cpp",
  fontSize: 14,
  minFontSize: 10,
  maxFontSize: 24,
  minimapEnabled: true,
};

/** Versões do xterm.js via CDN (Sprint 3) — manter em sincronia com as
 *  tags <script>/<link> em index.html. Pacote migrado para o escopo
 *  @xterm/* (o pacote antigo "xterm" está descontinuado). */
export const TERMINAL_DEFAULTS = {
  xtermVersion: "6.0.0",
  fitAddonVersion: "0.11.0",
};
