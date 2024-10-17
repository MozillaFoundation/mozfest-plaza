import { DeconfBaseContext } from '@openlab/deconf-api-toolkit'

export interface Oauth2Record {
  id: number
  created: Date
  attendee: number
  kind: string
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
    access: string,
    refresh: string | null,
    expiry: Date | null
  ) {
    await this.#context.postgres.run(async (client) => {
      await client.sql`
        INSERT INTO attendee_oauth2 (attendee, kind, "accessToken", "refreshToken", expiry)
        VALUES (${attendee}, ${kind}, ${access}, ${refresh}, ${expiry})
      `
    })
  }

  getTokens(attendee: number) {
    return this.#context.postgres.run(async (client) => {
      const records = await client.sql<Oauth2Record[]>`
        SELECT id, created, attendee, kind, "accessToken", "refreshToken", expiry
        FROM "attendee_oauth2"
        WHERE attendee = ${attendee}
      `
      return records
    })
  }
}
