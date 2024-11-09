import { PostgresClient } from '@openlab/deconf-api-toolkit'

export default {
  id: 'add-web-push-device',
  async run(client: PostgresClient) {
    await client.sql`
      CREATE TABLE "web_push_devices" (
        "id" serial PRIMARY KEY,
        "created" timestamp DEFAULT CURRENT_TIMESTAMP,
        "attendee" integer REFERENCES attendees(id) ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "endpoint" varchar(255) NOT NULL,
        "expiration" timestamp DEFAULT NULL,
        "keys" JSONB NOT NULL,
        "categories" JSONB NOT NULL
      );
    `
  },
}
