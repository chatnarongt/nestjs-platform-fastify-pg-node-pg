<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# nestjs-platform-fastify-pg-node

NestJS + Fastify (`@nestjs/platform-fastify`) + Postgres (`pg`) on Node.js. Implements the benchmark contract from `http-framework-benchmarks`.

```bash
npm install
docker compose up -d --wait   # Postgres, seeded from db/init-postgres.sql
npm run start:dev
```

Config comes from `.env` / environment (`PORT`, `DATABASE_*`). Checks: `npm run check`, `npm run build`, `npm test`, `npm run test:e2e`.
