@AGENTS.md

## Testes visuais (Playwright)

Existe uma suíte de regressão visual em `e2e/visual.spec.ts`, cobrindo as 6
páginas de listagem (cases/customers/partners/contractors/payments/users) e
a sidebar em 3 resoluções (1280x720, 1366x768, 1920x1080), via fixtures em
`src/app/qa-fixtures/*` — sem precisar de login/backend real. Roda no CI a
cada PR (`.github/workflows/ci.yml`, job `visual-regression`).

**Ao desenvolver/alterar** qualquer uma das 6 páginas de listagem, a
sidebar, `(authenticated)/layout.tsx` ou `common/list-page-layout.tsx`:
rode `npm run test:visual` localmente antes de abrir PR. Se a mudança
visual for intencional, atualize as baselines com `npm run test:visual:update`
e commite as novas imagens em `e2e/visual.spec.ts-snapshots/`.

**Baselines devem ser geradas com o mesmo Chromium que o CI usa** (o binário
baixado pelo próprio Playwright via `npx playwright install chromium`), nunca
com o Chromium do sistema (`/usr/bin/chromium-browser` ou similar) — builds
diferentes produzem anti-aliasing de fonte ligeiramente diferente, o que
falsamente reprova ~toda a suíte no CI mesmo sem nenhuma mudança real de
layout (foi exatamente o que aconteceu no PR #143). Se o ambiente local não
tiver as libs de sistema que o Chromium do Playwright precisa (ex:
`libnspr4.so` faltando, `sudo apt-get`/`playwright install --with-deps`
indisponível), gere as baselines dentro do container oficial em vez disso,
servindo a app de dentro dele:

```bash
npm run build   # no host, para o container não gastar o timeout de 180s buildando

docker run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp \
  -v "$(pwd)":/work -w /work \
  mcr.microsoft.com/playwright:v1.63.0-noble bash -c '
QA_FIXTURES_ENABLED=true npx next start -p 3100 > /tmp/next.log 2>&1 &
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/qa-fixtures/cases || true)
  [ "$code" = "200" ] && break
  sleep 2
done
npx playwright test --update-snapshots
'
```

(troque a tag `v1.63.0` pela versão de `@playwright/test` no `package.json`
se ela mudar.)

Rodar em porta diferente da 3000 exige apontar `baseURL` e `webServer.url` do
`playwright.config.ts` para ela durante a execução — reverta o arquivo depois,
as baselines é que são o artefato.

**O servidor precisa subir dentro do container.** `--network host` não alcança
`localhost` do host em Docker Desktop no WSL2 (o daemon roda em outra VM), então
o container não enxerga um `npm run start` da máquina e o `webServer` do
Playwright estoura `Timed out waiting 180000ms`. Servir de dentro também evita
depender da porta 3000, que costuma já estar ocupada pelo `next dev` local.

**Não omita o `--user`.** Sem ele o container roda como root e tudo que ele
escreve no bind mount (`.next/`, `test-results/`, as baselines novas) fica com
dono `root`. O próximo `npm run build` local então falha com
`EACCES: permission denied, unlink '.../.next/build/package.json'`, e limpar
exige `sudo` — que não funciona em sessão sem terminal interativo. Se isso já
tiver acontecido, o mesmo container resolve:

```bash
docker run --rm -v "$(pwd)":/work -w /work \
  mcr.microsoft.com/playwright:v1.63.0-noble rm -rf .next
```
