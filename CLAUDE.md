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
com a app já rodando em `localhost:3000` (`npm run build && npm run start`):

```bash
docker run --rm --network host -v "$(pwd)":/work -w /work \
  mcr.microsoft.com/playwright:v1.63.0-noble \
  npx playwright test --update-snapshots
```

(troque a tag `v1.63.0` pela versão de `@playwright/test` no `package.json`
se ela mudar.)
