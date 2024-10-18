import { DeconfBaseContext } from '@openlab/deconf-api-toolkit'

export interface Oauth2Record {
  id: number
  created: Date
  attendee: number
  kind: string
  scope: string
  accessToken: string
  refreshToken: string | null
  expiry: Date | null
}

type Context = Pick<DeconfBaseContext, 'postgres'>

export class Oauth2Repository {
  #context: Context
  constructor(context: Context) {
    this.#context = context
  }

  async store(
    attendee: number,
    kind: string,
    scope: string,
    access: string,
    refresh: string | null,
    expiry: Date | null
  ) {
    await this.#context.postgres.run(async (client) => {
      await client.sql`
        INSERT INTO attendee_oauth2 (attendee, kind, scope, "accessToken", "refreshToken", expiry)
        VALUES (${attendee}, ${kind}, ${scope}, ${access}, ${refresh}, ${expiry})
      `
    })
  }

  getTokens(attendee: number) {
    return this.#context.postgres.run(async (client) => {
      const records = await client.sql<Oauth2Record>`
        SELECT id, created, attendee, kind, scope, "accessToken", "refreshToken", expiry
        FROM "attendee_oauth2"
        WHERE attendee = ${attendee}
          AND (expiry > NOW() OR "refreshToken" IS NOT NULL)
      `
      return records
    })
  }
}
