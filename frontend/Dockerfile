FROM node:20-alpine

WORKDIR /app

# Instalando dependências de build
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps --silent

# Copia o restante e faz o build
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npm run start"]
