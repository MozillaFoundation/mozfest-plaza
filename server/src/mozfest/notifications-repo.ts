import { AppContext } from '../lib/module.js'

type Context = Pick<AppContext, 'postgres'>

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
}
