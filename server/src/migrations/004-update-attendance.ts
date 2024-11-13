import { PostgresClient } from '@openlab/deconf-api-toolkit'

export default {
  id: 'add-attendance-notified',
  async run(client: PostgresClient) {
    await client.sql`
      ALTER TABLE "attendance"
        ADD COLUMN "notified" TIMESTAMP DEFAULT NULL
    `
  },
}
