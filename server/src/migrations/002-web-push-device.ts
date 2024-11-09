import { PostgresClient } from '@openlab/deconf-api-toolkit'

export default {
  id: 'add-web-push-device',
  async run(client: PostgresClient) {
    await client.sql`
      CREATE TABLE "web_push_devices" (
        "id" serial PRIMARY KEY,
        "created" timestamp DEFAULT CURRENT_TIMESTAMP,
        "attendee" integer REFERENCES attendees(id) ON DELETE CASCADE,
        "endpoint" varchar(255) NOT NULL,
        "expirationTime" timestamp DEFAULT NULL,
        "keys" JSONB NOT NULL,
        "categories" JSONB NOT NULL
      );
    `
  },
}
