import { PostgresClient } from '@openlab/deconf-api-toolkit'

export default {
  id: 'add-attendee-oauth2',
  async run(client: PostgresClient) {
    await client.sql`
      CREATE TABLE "attendee_oauth2" (
        "id" serial PRIMARY KEY,
        "created" timestamp DEFAULT CURRENT_TIMESTAMP,
        "attendee" integer REFERENCES attendees(id) ON DELETE CASCADE,
        "kind" varchar(50) NOT NULL,
        "scope" varchar(255) NOT NULL,
        "accessToken" varchar(255) NOT NULL,
        "refreshToken" varchar(255) DEFAULT NULL,
        "expiry" timestamp DEFAULT NULL
    );
    `
  },
}
