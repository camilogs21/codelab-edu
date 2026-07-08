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
 * IMPORTANTE — o JDoodle bloqueia chamadas diretas do navegador (CORS):
 * a API dele foi feita para ser chamada de servidor pra servidor, não de
 * dentro de uma página web. Por isso `compiler.js` NÃO chama
 * `executeUrl` direto do front-end — ele chama `/api/compile`, uma rota
 * do servidor local (`server.py`, na raiz do projeto), que repassa a
 * chamada pro JDoodle do lado do servidor. `executeUrl` abaixo existe só
 * como referência/documentação de qual endpoint o `server.py` chama.
 *
 * Trade-off de segurança que continua de pé mesmo com o proxy local: as
 * credenciais ainda vêm do navegador do professor (localStorage) e
 * passam pelo `server.py` a caminho do JDoodle — ele resolve o bloqueio
 * técnico de CORS, mas não é, sozinho, "o proxy que esconde a chave"
 * ideal (ver docs/api.md). Quando este projeto for publicado num
 * hospedeiro estático (GitHub Pages, Sprint 6+), o `server.py` não roda
 * mais — vai ser preciso uma função serverless de verdade.
 */
export const JDOODLE = {
  executeUrl: "https://api.jdoodle.com/v1/execute", // chamado só por server.py
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
  xtermVersion: "5.5.0",
  fitAddonVersion: "0.10.0",
};
