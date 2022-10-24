import { PostgresService, RedisService } from '@openlab/deconf-api-toolkit'
import { createEnv, sha256Hash, TitoRecord } from '../lib/module.js'

interface EmailRecord {
  email: string
  name: string
}

export interface FakeTitoCommandOptions {}
export async function fakeTitoCommand(options: FakeTitoCommandOptions) {
  const env = createEnv()
  if (!env.REDIS_URL) throw new Error('REDIS_URL not set')
  const store = new RedisService(env.REDIS_URL)
  const postgres = new PostgresService({ env })
  const client = await postgres.getClient()

  try {
    const users = await client.sql<EmailRecord>`
      SELECT email, name FROM attendees where verified=true;
    `

    const records: TitoRecord[] = users.map((u) => ({
      name: u.name,
      emailHash: sha256Hash(u.email),
    }))

    await store.put<TitoRecord[]>('tito.emails', records)
  } finally {
    client.release()
    await postgres.close()
    await store.close()
  }
}
