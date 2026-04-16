FROM node:20.11-alpine AS deps
# libc6-compat é necessário para algumas dependências nativas do Next.js (como o SWC compiler) rodarem no Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia apenas os arquivos de dependência para aproveitar o cache do Docker
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20.11-alpine AS builder
WORKDIR /app

# Copia as dependências da Fase 1 e o resto do código fonte
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desativa a telemetria do Next.js durante o build (opcional, mas recomendado)
ENV NEXT_TELEMETRY_DISABLED=1

# Executa o build (isso vai gerar a pasta .next/standalone graças ao next.config.js)
RUN npm run build

FROM node:20.11-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criação de um usuário não-root por questões de segurança
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Copia a pasta public (imagens, ícones, etc)
COPY --from=builder /app/public ./public

# Cria a pasta estática e ajusta as permissões
RUN mkdir .next && chown nextjs:nodejs .next

# Copia os arquivos essenciais gerados pelo modo standalone
# O Next.js já resolve os node_modules mínimos necessários aqui dentro
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Muda para o usuário sem privilégios root
USER nextjs

# Expõe a porta que a aplicação vai escutar
EXPOSE 3000

ENV PORT=3000
# Necessário caso o Next.js não consiga resolver o hostname automaticamente no container
ENV HOSTNAME="0.0.0.0"

# O modo standalone gera um server.js próprio, mais otimizado que o "npm start"
CMD ["node", "server.js"]
