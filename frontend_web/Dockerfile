# ============================================
# frontend_web 用户端镜像（构建上下文为本目录）
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_* 变量在构建期固化，必须通过 build arg 传入
ARG NEXT_PUBLIC_BASE_URL=http://localhost:7869
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --------------------------------------------

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    TZ=Asia/Shanghai

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000

CMD ["npm", "run", "start"]