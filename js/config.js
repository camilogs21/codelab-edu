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
 * Decisão final: JDoodle, não Judge0. Motivo da troca (documentado com
 * mais detalhe em docs/api.md): o plano gratuito do Judge0 no RapidAPI
 * exige cartão de crédito (política do RapidAPI para APIs "freemium",
 * mesmo no tier de $0,00). O JDoodle oferece 200 chamadas grátis por dia
 * só com um cadastro por e-mail, sem cartão.
 *
 * IMPORTANTE — trade-off de segurança aceito conscientemente neste
 * sprint: o ideal é nunca expor client secret no front-end, usando um
 * proxy serverless. Como este projeto ainda não tem um backend
 * hospedado, o Client ID/Secret são fornecidos pelo PRÓPRIO PROFESSOR
 * através do painel de Configurações e ficam salvos só no localStorage
 * dele — nunca commitados no repositório, nunca hardcoded aqui. Ver
 * docs/api.md para o plano de resolver isso quando houver backend.
 */
export const JDOODLE = {
  executeUrl: "https://api.jdoodle.com/v1/execute",
  // Códigos de linguagem/versão do JDoodle (ver "Supported languages &
  // versions" na doc oficial — tabela atualizada em 03/07/2026).
  languages: {
    c: { language: "c", versionIndex: "7" }, // GCC 15.2.1
    cpp: { language: "cpp", versionIndex: "7" }, // GCC 15.2.1
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
