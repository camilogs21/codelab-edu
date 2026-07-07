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

## Bloqueio de CORS — descoberto durante o teste real do Sprint 3

Depois de implementar a chamada direta do navegador pro JDoodle,
descobrimos na prática que ele **bloqueia isso por CORS**: a API é
desenhada para ser chamada de servidor pra servidor, e não devolve o
cabeçalho `Access-Control-Allow-Origin` que o navegador exige pra
liberar a resposta pra uma página web.

Solução adotada: `server.py` (na raiz do projeto) substitui o
`python3 -m http.server` simples. Ele serve os arquivos estáticos do
mesmo jeito, mas também responde em `POST /api/compile` — recebe a
chamada do navegador (mesma origem, sem problema de CORS), repassa pro
JDoodle *do lado do servidor* (onde CORS não existe, é uma regra só do
navegador) e devolve o resultado pro front-end.

**Isso não substitui o proxy serverless ideal descrito abaixo** — é um
proxy same-origin que roda localmente, só resolve o bloqueio técnico de
CORS. As credenciais continuam vindo do navegador do professor e
passando por esse servidor local a caminho do JDoodle. Quando este
projeto for publicado num hospedeiro estático (GitHub Pages, Sprint 6+),
`server.py` não vai rodar mais — nesse momento, uma função serverless de
verdade (Cloudflare Workers, Vercel Functions, etc.) precisa assumir
esse papel, escondendo as credenciais no servidor em vez de recebê-las
do navegador a cada chamada.

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
4. Envia `POST` para `/api/compile` (rota do `server.py`, mesma origem)
   com `{ clientId, clientSecret, script, stdin, language, versionIndex }`
   (linguagem/versão vêm de `config.js`, `JDOODLE.languages`).
5. `server.py` repassa essa chamada pro JDoodle de verdade
   (`https://api.jdoodle.com/v1/execute`) do lado do servidor, onde CORS
   não existe.
6. JDoodle compila e executa em sandbox, devolve `{ output, error,
   statusCode, isCompiled, isExecutionSuccess, ... }` pro `server.py`,
   que repassa isso pro navegador sem modificar.
7. `compiler.js` traduz essa resposta pro formato do contrato acima.
8. `terminal.js` (xterm.js) imprime o resultado com cores ANSI (verde =
   sucesso, vermelho = erro).

## Tratamento de erros já implementado

| Situação | Comportamento |
|---|---|
| Sem Client ID/Secret configurados | Mensagem pedindo para configurar, sem chamar a API |
| Rodando `http.server` em vez de `server.py` (rota /api/compile não existe) | Mensagem explicando qual comando usar |
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
