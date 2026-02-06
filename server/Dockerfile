FROM node:20-alpine

WORKDIR /app

# 1) instala dependencias (incluye devDependencies para compilar TS)
COPY package.json package-lock.json* ./
RUN npm install

# 2) copia el código
COPY . .

# 3) genera prisma client y compila TS -> dist/
RUN npx prisma generate
RUN npm run build

# 4) (opcional) reduce peso: quitar dev deps NO es imprescindible ahora
EXPOSE 8088
CMD ["npm", "run", "start"]
