import { AppContext } from '../lib/module.js'

type Context = Pick<AppContext, 'postgres'>

export const MAX_WEB_PUSH_RETRIES = 3

export interface WebPushDeviceRecord {
  id: number
  created: Date
  attendee: number
  name: string
  endpoint: string
  expiration: Date | null
  keys: Record<string, string>
  categories: string[]
}

export interface WebPushDeviceInit {
  name: string
  attendee: number
  endpoint: string
  expiration: Date | null
  keys: Record<string, string>
  categories: string[]
}

export interface WebPushDeviceUpdate {
  name: string
  categories: string[]
}

export interface WebPushMessageRecord {
  id: number
  created: Date
  device: number
  message: unknown
  retries: number
  state: string
}

export class NotificationsRepository {
  #context: Context
  constructor(context: Context) {
    this.#context = context
  }

  async getAttendeeWebPushDevice(
    id: number | string
  ): Promise<WebPushDeviceRecord | null> {
    const [record = null] = await this.#context.postgres.run(
      (client) =>
        client.sql<WebPushDeviceRecord>`
          SELECT id, created, attendee, name, endpoint, expiration, keys, categories
          FROM web_push_devices
          WHERE id = ${parseInt(id.toString())}
      `
    )
    return record
  }

  listAttendeeWebPushDevices(attendee: number): Promise<WebPushDeviceRecord[]> {
    return this.#context.postgres.run(
      (client) =>
        client.sql<WebPushDeviceRecord>`
          SELECT id, created, attendee, name, endpoint, expiration, keys, categories
          FROM web_push_devices
          WHERE attendee = ${attendee}
      `
    )
  }

  async createWebPushDevices(
    init: WebPushDeviceInit
  ): Promise<WebPushDeviceRecord> {
    const keys = JSON.stringify(init.keys)
    const categories = JSON.stringify(init.categories)

    const [record] = await this.#context.postgres.run(
      (client) =>
        client.sql<WebPushDeviceRecord>`
          INSERT INTO web_push_devices (attendee, name, endpoint, expiration, keys, categories)
          VALUES (${init.attendee}, ${init.name}, ${init.endpoint}, ${init.expiration}, ${keys}, ${categories})
          RETURNING (id, created, attendee, name, endpoint, expiration, keys, categories)
      `
    )
    return record
  }

  async updateWebPushDevices(
    id: number,
    update: WebPushDeviceUpdate
  ): Promise<WebPushDeviceRecord | null> {
    const categories = JSON.stringify(update.categories)

    const [record = null] = await this.#context.postgres.run(
      (client) =>
        client.sql<WebPushDeviceRecord>`
          UPDATE web_push_devices
          SET name=${update.name}, categories=${categories}
          WHERE id = ${id}
          RETURNING (id, created, attendee, name, endpoint, expiration, keys, categories)
      `
    )
    return record
  }

  async deleteWebPushDevice(id: number): Promise<void> {
    await this.#context.postgres.run(
      (client) => client.sql`
        DELETE FROM web_push_devices
        WHERE id = ${id}
      `
    )
  }

  listPendingWebPushMessages(): Promise<WebPushMessageRecord[]> {
    return this.#context.postgres.run(
      (client) => client.sql`
        SELECT id, created, device, message, retries, state
        FROM web_push_messages
        WHERE state = 'pending'
          AND retries < ${MAX_WEB_PUSH_RETRIES}
      `
    )
  }

  updateWebPushMessage(
    message: WebPushMessageRecord,
    state: 'sent' | 'failed'
  ) {
    return this.#context.postgres.run(async (client) => {
      if (state === 'sent') {
        await client.sql`
          UPDATE web_push_messages
          SET updated = NOW(), state = 'sent'
          WHERE id = ${message.id}
        `
      }
      if (state === 'failed') {
        const state =
          message.retries <= MAX_WEB_PUSH_RETRIES ? 'pending' : 'failed'

        const retries = message.retries + 1

        await client.sql`
          UPDATE web_push_messages
          SET updated = NOW(), state = ${state}, retries = ${retries}
          WHERE id = ${message}
        `
      }
    })
  }

  async createWebPushMessage(device: number, message: unknown) {
    await this.#context.postgres.run(
      (client) => client.sql`
        INSERT INTO web_push_messages (device, message)
        VALUES (${device}, ${message})
      `
    )
  }
}
