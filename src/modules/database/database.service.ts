import { Injectable, type OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pool, type PoolConfig } from 'pg'

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool

  constructor(configService: ConfigService) {
    const host = configService.get<string>('DATABASE_HOST')
    if (!host) {
      throw new Error('DATABASE_HOST is not defined')
    }

    const dbConfig: PoolConfig = {
      host,
      port: +(configService.get<string>('DATABASE_PORT') || '5432'),
      user: configService.get<string>('DATABASE_USER'),
      password: configService.get<string>('DATABASE_PASSWORD'),
      database: configService.get<string>('DATABASE_NAME'),
      min: +(configService.get<string>('DATABASE_MIN_POOL_SIZE') || '0'),
      max: +(configService.get<string>('DATABASE_MAX_POOL_SIZE') || '10'),
    }

    this.pool = new Pool(dbConfig)
  }

  async onModuleDestroy() {
    await this.pool.end()
  }

  query(text: string, values?: unknown[]) {
    return this.pool.query(text, values)
  }
}
