
STUDYMASTER FULLSTACK

Estructura:

frontend/  -> Tu app React/Vite
server/    -> Backend Node + Express + Prisma
docker-compose.yml -> API + Postgres

Pasos:

1) Crear .env en raíz:

GEMINI_API_KEY=TU_API_KEY

2) Levantar backend:

docker compose up -d --build

3) Migrar DB:

docker compose exec api npx prisma migrate deploy

4) Probar:

http://TU_SERVIDOR:8088/api/health
