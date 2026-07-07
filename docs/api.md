# API de Compilação — Judge0 CE (implementado no Sprint 3)

## Decisão final

**Judge0 CE via RapidAPI**, `language_id 54` (C++ GCC 9.2.0) e `50` (C GCC
9.2.0). Endpoint: `https://judge0-ce.p.rapidapi.com/submissions`.

## Trade-off de segurança assumido conscientemente

O ideal — descrito na primeira versão deste documento — era nunca expor a
chave de API no front-end, usando um proxy serverless próprio. Esse proxy
**ainda não existe** (não há backend hospedado neste projeto ainda), então
o Sprint 3 tomou uma decisão pragmática:

- A chave de API é fornecida pelo **próprio professor**, colada no painel
  de Configurações (ícone de engrenagem na activity bar).
- Ela fica salva **só no `localStorage` do navegador dele**, nunca é
  commitada no repositório, nunca aparece hardcoded em nenhum arquivo.
- Isso é seguro o suficiente para **um professor testando/demonstrando a
  plataforma sozinho**, mas **não é adequado** para distribuir a mesma
  chave entre várias turmas/Chromebooks — qualquer aluno com acesso ao
  DevTools do navegador consegue ler a chave salva ali.

**Antes de destravar isso para uso real com turmas**, construir o proxy
serverless (escondendo a chave no servidor) precisa virar prioridade. Até
lá, o uso pretendido é: o professor usa sua própria chave gratuita,
sabendo da limitação.

## Contrato de `compileAndRun` (estável desde o Sprint 1)

```js
compileAndRun(code: string, stdin?: string, language?: "c"|"cpp") => Promise<{
  stdout: string,
  stderr: string,
  compileOutput: string,
  exitCode: number,       // 0 = sucesso (Judge0 status.id === 3, "Accepted")
  statusDescription?: string,
}>
```

Este contrato não mudou desde o stub do Sprint 1 — só a implementação por
dentro, que agora faz uma chamada HTTP real.

## Fluxo implementado

1. Aluno/professor clica em "Executar".
2. `ui.js` lê o código do Monaco (`editor.js`) e chama `compiler.js`.
3. `compiler.js` lê a chave salva em `storage.js` (`state.settings.judge0ApiKey`).
   - Se não houver chave: retorna erro amigável pedindo para configurar,
     sem fazer nenhuma chamada de rede.
4. Envia `source_code`/`stdin` codificados em base64 para o Judge0
   (`base64_encoded=true&wait=true`), com headers `X-RapidAPI-Key` e
   `X-RapidAPI-Host`.
5. Judge0 compila e executa em sandbox, devolve `stdout`/`stderr`/
   `compile_output` (também em base64) e um `status` com `id`/`description`.
6. `compiler.js` decodifica tudo e devolve no formato do contrato acima.
7. `terminal.js` (xterm.js) imprime o resultado com cores ANSI (verde =
   sucesso, vermelho = erro).

## Tratamento de erros já implementado

| Situação | Comportamento |
|---|---|
| Sem chave configurada | Mensagem pedindo para configurar, sem chamar a API |
| Chave inválida/expirada (HTTP 401/403) | Mensagem específica sugerindo checar a chave |
| Limite de requisições atingido (HTTP 429) | Mensagem avisando para tentar mais tarde |
| Timeout (`JUDGE0.timeoutMs`, 15s) | Mensagem de timeout, sugerindo checar internet |
| Sem internet / serviço fora do ar | Mensagem genérica de falha de conexão |

## Riscos que continuam de pé

- **Sem internet no laboratório = sem execução de código**, mesmo com o
  PWA (Sprint 6) instalado — a compilação em si nunca é cacheável.
- **Limite do plano gratuito do Judge0/RapidAPI** pode ser atingido
  rápido com uma turma inteira testando ao mesmo tempo. Vale monitorar o
  uso e considerar um plano pago ou self-host se isso acontecer com
  frequência.
- **Chave de API única por professor**: se dois professores usarem a
  mesma chave em turmas diferentes, o limite é compartilhado entre eles.
