import { PostgresClient } from '@openlab/deconf-api-toolkit'

export default {
  id: 'add-web-push-messages',
  async run(client: PostgresClient) {
    await client.sql`
      CREATE TABLE "web_push_messages" (
        "id" serial PRIMARY KEY,
        "created" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated" timestamp DEFAULT CURRENT_TIMESTAMP,
        "device" integer REFERENCES web_push_devices (id) ON DELETE CASCADE,
        "message" jsonb NOT NULL,
        "retries" integer DEFAULT 0,
        "state" varchar(32) DEFAULT 'pending'
      );
    `
  },
}
