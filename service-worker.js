/**
 * service-worker.js
 * Stub do Sprint 1 — NÃO é registrado em app.js ainda.
 *
 * O cache offline completo (app shell + assets do Monaco/xterm baixados
 * localmente, conforme decidido no Sprint 1) é implementado no Sprint 6.
 * Registrar isto antes disso poderia travar arquivos antigos em cache
 * durante o desenvolvimento ativo dos Sprints 2-5.
 *
 * Contrato já pensado para o Sprint 6:
 *   - install:  pré-cacheia o app shell (html/css/js) via Cache API.
 *   - activate: limpa caches de versões antigas.
 *   - fetch:    "cache first" para assets estáticos, "network first"
 *               para a chamada de compilação (que não pode ser cacheada).
 */

const CACHE_VERSION = "codelab-edu-v0"; // Sprint 6 substitui pela versão real.

self.addEventListener("install", () => {
  // Sprint 6: self.skipWaiting() + cache.addAll([...app shell]).
});

self.addEventListener("activate", () => {
  // Sprint 6: limpeza de caches de versões anteriores a CACHE_VERSION.
});

self.addEventListener("fetch", () => {
  // Sprint 6: estratégia de cache real. Por enquanto, deixa o navegador
  // seguir o comportamento padrão (sem interceptar nada).
});
