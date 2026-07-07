# API de Compilação — JDoodle (implementado no Sprint 3)

## Decisão final (e por que mudou de Judge0 pra JDoodle)

A primeira escolha do Sprint 3 foi **Judge0 CE via RapidAPI**. Na prática,
descobrimos que o Judge0 no RapidAPI é uma API "freemium" (tem planos
PRO/ULTRA/MEGA pagos ao lado do Basic) — e a política do próprio RapidAPI
pra esse tipo de API é **sempre exigir cartão de crédito**, mesmo no
plano de $0,00 (é uma proteção deles contra excesso de uso, não uma
cobrança real, mas o professor preferiu não colocar cartão nisso).

Trocamos para **JDoodle**, que dá **200 execuções grátis por dia** com
só um cadastro por e-mail, sem pedir cartão no plano gratuito.

## Trade-off de segurança assumido conscientemente

O ideal — sempre válido, independente do provedor — seria nunca expor
credenciais de API no front-end, usando um proxy serverless próprio.
Esse proxy **ainda não existe** (não há backend hospedado neste projeto
ainda), então o Sprint 3 tomou uma decisão pragmática:

- O **Client ID** e o **Client Secret** do JDoodle são fornecidos pelo
  **próprio professor**, colados no painel de Configurações (ícone de
  engrenagem na activity bar).
- Ficam salvos **só no `localStorage` do navegador dele**, nunca são
  commitados no repositório, nunca aparecem hardcoded em nenhum arquivo.
- Isso é seguro o suficiente para **um professor testando/demonstrando a
  plataforma sozinho**, mas **não é adequado** para distribuir as mesmas
  credenciais entre várias turmas/Chromebooks — qualquer aluno com
  acesso ao DevTools do navegador consegue lê-las.

**Antes de destravar isso para uso real com turmas**, construir o proxy
serverless (escondendo as credenciais no servidor) precisa virar
prioridade. Até lá, o uso pretendido é: o professor usa sua própria
conta gratuita, sabendo da limitação — e sabendo que 200 execuções/dia
são compartilhadas entre todas as turmas que usarem essa mesma conta.

## Contrato de `compileAndRun` (estável desde o Sprint 1)

```js
compileAndRun(code: string, stdin?: string, language?: "c"|"cpp") => Promise<{
  stdout: string,
  stderr: string,
  compileOutput: string,
  exitCode: number,       // 0 = sucesso
  statusDescription?: string,
}>
```

Este contrato não mudou desde o stub do Sprint 1 — só a implementação
por dentro, que agora faz uma chamada HTTP real pro JDoodle.

## Fluxo implementado

1. Aluno/professor clica em "Executar".
2. `ui.js` lê o código do Monaco (`editor.js`) e chama `compiler.js`.
3. `compiler.js` lê o Client ID/Secret salvos em `storage.js`
   (`state.settings.jdoodleClientId`/`jdoodleClientSecret`).
   - Se algum estiver ausente: retorna erro amigável pedindo para
     configurar, sem fazer nenhuma chamada de rede.
4. Envia `POST` para `https://api.jdoodle.com/v1/execute` com
   `{ clientId, clientSecret, script, stdin, language, versionIndex }`
   (linguagem/versão vêm de `config.js`, `JDOODLE.languages`).
5. JDoodle compila e executa em sandbox, devolve `{ output, error,
   statusCode, isCompiled, isExecutionSuccess, ... }`.
6. `compiler.js` traduz essa resposta pro formato do contrato acima.
7. `terminal.js` (xterm.js) imprime o resultado com cores ANSI (verde =
   sucesso, vermelho = erro).

## Tratamento de erros já implementado

| Situação | Comportamento |
|---|---|
| Sem Client ID/Secret configurados | Mensagem pedindo para configurar, sem chamar a API |
| Credenciais inválidas | Mensagem específica sugerindo checar em Configurações |
| Limite diário de 200 execuções atingido | Mensagem avisando para tentar amanhã |
| Timeout (`JDOODLE.timeoutMs`, 15s) | Mensagem de timeout, sugerindo checar internet |
| Sem internet / serviço fora do ar | Mensagem genérica de falha de conexão |

## Linguagem e versão usadas

Do arquivo oficial de linguagens do JDoodle (atualizado em 03/07/2026):
`language: "c"` e `language: "cpp"`, ambos com `versionIndex: "7"`
(GCC 15.2.1 — a versão mais recente disponível na tabela). Se o JDoodle
adicionar versões novas no futuro, `js/config.js` (`JDOODLE.languages`)
é o único lugar que precisa mudar.

## Riscos que continuam de pé

- **Sem internet no laboratório = sem execução de código**, mesmo com o
  PWA (Sprint 6) instalado — a compilação em si nunca é cacheável.
- **200 execuções/dia é pouco para uma turma inteira testando ao mesmo
  tempo** — se isso virar um problema recorrente, vale considerar o
  plano pago do JDoodle (a partir de US$10/mês, 1.000 chamadas/dia) ou
  revisitar a decisão de provedor.
- **Credenciais únicas por professor**: se duas turmas usarem a mesma
  conta, o limite diário é compartilhado entre elas.
