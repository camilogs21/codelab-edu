# API de Compilação (planejado para o Sprint 3)

Este documento existe para não perder as decisões já tomadas quando o
Sprint 3 começar de fato.

## Decisão

C/C++ não roda no navegador — a compilação/execução acontece num serviço
externo (candidatos: Judge0 self-hosted ou via RapidAPI, ou JDoodle).
A escolha final e o custo por execução ficam para o começo do Sprint 3.

## Por que um proxy é obrigatório

A chave de API do provedor escolhido **nunca** pode aparecer no código
front-end (qualquer aluno consegue abrir o DevTools e lê-la). Por isso,
`compiler.js` não vai chamar o provedor diretamente — vai chamar um
endpoint próprio (função serverless), que guarda a chave no servidor e
repassa a requisição.

## Contrato de `compileAndRun` (já implementado como stub)

```js
compileAndRun(code: string, stdin?: string) => Promise<{
  stdout: string,
  stderr: string,
  exitCode: number,
}>
```

Este contrato não muda quando a implementação real entrar — apenas o
que acontece "por dentro" da função.

## Fluxo planejado (Sprint 3)

1. Aluno clica em "Executar".
2. `compiler.js` envia `{ language: "cpp", code, stdin }` para o proxy próprio.
3. Proxy chama o provedor externo com a chave guardada no servidor.
4. Proxy devolve `{ stdout, stderr, exitCode }` no formato acima.
5. `terminal.js` imprime o resultado.

## Riscos conhecidos

- **Sem internet no laboratório = sem execução de código.** Isso deve
  ficar visível na UI (estado de erro claro, não uma falha silenciosa).
- **Custo por execução**, se o provedor escolhido cobrar por chamada —
  relevante para estimar uso com várias turmas simultâneas.
- **Timeout**: já configurado em `config.js` (`COMPILER_API.timeoutMs`),
  para não deixar o aluno esperando indefinidamente em caso de falha do provedor.
