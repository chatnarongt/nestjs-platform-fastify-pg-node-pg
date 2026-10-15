import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { AppModule } from './modules/app/index.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter())

  const configService = app.get(ConfigService)

  const port = configService.get<number>('PORT') ?? 3000

  await app.listen(port, '0.0.0.0')
}
await bootstrap()
