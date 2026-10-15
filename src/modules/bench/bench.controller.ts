import { Controller, Get, NotFoundException, Query, Res } from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { DatabaseService } from '../database/database.service.js'
import { int, ints, pgIntArray, records } from './bench.parse.js'

type Q = string | string[] | undefined

@Controller('bench')
export class BenchController {
  constructor(private readonly db: DatabaseService) {}

  @Get('plaintext')
  plaintext(@Res() res: FastifyReply) {
    res.send('Hello, World!')
  }

  @Get('json')
  json(@Res() res: FastifyReply) {
    res.send({ message: 'Hello, World!' })
  }

  @Get('read-one')
  async readOne(@Query('id') id: Q) {
    const result = await this.db.query(
      'SELECT id, random_number AS "randomNumber" FROM world WHERE id = $1',
      [int(id, 'id')],
    )
    if (!result.rows[0]) throw new NotFoundException()
    return result.rows[0]
  }

  @Get('read-many')
  readMany(@Query('limit') limit: Q, @Query('afterId') afterId: Q) {
    const n = limit === undefined ? 20 : int(limit, 'limit')
    return this.db
      .query(
        'SELECT id, random_number AS "randomNumber" FROM world WHERE id > $1 ORDER BY id LIMIT $2',
        [afterId === undefined ? 0 : int(afterId, 'afterId'), Math.min(Math.max(n, 1), 100)],
      )
      .then((result) => result.rows)
  }

  @Get('create-one')
  async createOne(@Query('randomNumber') randomNumber: Q) {
    const result = await this.db.query(
      'INSERT INTO world (random_number) VALUES ($1) RETURNING id, random_number AS "randomNumber"',
      [int(randomNumber, 'randomNumber')],
    )
    return result.rows[0]
  }

  @Get('create-many')
  async createMany(@Query('randomNumber') randomNumber: Q) {
    const result = await this.db.query(
      `INSERT INTO world (random_number)
       SELECT unnest($1::int[])
       RETURNING id, random_number AS "randomNumber"`,
      [pgIntArray(ints(randomNumber, 'randomNumber'))],
    )
    return result.rows
  }

  @Get('update-one')
  async updateOne(@Query('record') record: Q) {
    const [r] = records(record)
    const result = await this.db.query(
      'UPDATE world SET random_number = $1 WHERE id = $2 RETURNING id, random_number AS "randomNumber"',
      [r.randomNumber, r.id],
    )
    if (!result.rows[0]) throw new NotFoundException()
    return result.rows[0]
  }

  @Get('update-many')
  async updateMany(@Query('record') record: Q) {
    const rs = records(record)
    const result = await this.db.query(
      `UPDATE world w SET random_number = v.r
       FROM unnest($1::int[], $2::int[]) AS v(id, r)
       WHERE w.id = v.id
       RETURNING w.id, w.random_number AS "randomNumber"`,
      [pgIntArray(rs.map((r) => r.id)), pgIntArray(rs.map((r) => r.randomNumber))],
    )
    return result.rows
  }

  @Get('delete-one')
  async deleteOne(@Query('id') id: Q) {
    await this.db.query('DELETE FROM world WHERE id = $1', [int(id, 'id')])
  }

  @Get('delete-many')
  async deleteMany(@Query('id') id: Q) {
    await this.db.query('DELETE FROM world WHERE id = ANY($1::int[])', [pgIntArray(ints(id, 'id'))])
  }
}
