
FROM --platform=linux/amd64 node:21.4-alpine

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build

CMD ["npm", "run", "start:dev"]


# # Этап 1: Сборка приложения
# FROM --platform=linux/amd64 node:21.4-alpine as builder

# WORKDIR /app

# # Копируем файлы package.json и package-lock.json сначала, чтобы воспользоваться кешированием слоев Docker
# COPY package*.json ./

# # Установка зависимостей
# RUN npm ci

# # Копирование остальных файлов проекта
# COPY . .

# # Сборка приложения
# RUN npm run build \
#     # Удаление зависимостей разработки
#     && npm prune --production

# # Этап 2: Запуск приложения
# FROM --platform=linux/amd64 node:21.4-alpine

# WORKDIR /app

# # Копирование собранного приложения из этапа builder
# COPY --from=builder /app/dist ./dist

# # Копирование package.json и установленных production зависимостей
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/node_modules ./node_modules

# # Запуск приложения
# CMD ["node", "dist/main"]



