# FROM node:18
# FROM --platform=linux/amd64 node:21.4-alpine

# WORKDIR /app

# COPY . .

# RUN npm ci
# RUN npm run build

# CMD ["npm", "run", "start:dev"]


# Этап 1: Сборка приложения
FROM --platform=linux/amd64 node:21.4-alpine as builder

WORKDIR /app

# Копируем файлы package.json и package-lock.json сначала, чтобы воспользоваться кешированием слоев Docker
COPY package.json package-lock.json ./

# Установка зависимостей
RUN npm ci

# Копирование остальных файлов проекта
COPY . .

# Сборка приложения
RUN npm run build

# Этап 2: Запуск приложения
FROM --platform=linux/amd64 node:21.4-alpine

WORKDIR /app

# Копирование собранного приложения из этапа builder
COPY --from=builder /app/dist ./dist

# Копирование package.json для запуска скриптов npm и зависимостей, если они необходимы во время выполнения
COPY --from=builder /app/package.json ./

# Установка только production зависимостей
RUN npm i --only=production

# Запуск приложения
CMD ["node", "dist/main"]
