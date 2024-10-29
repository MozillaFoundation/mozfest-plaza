import { AppContext } from '../lib/module.js'

type Context = Pick<AppContext, 'postgres'>

export class CalendarRepository {
  #context: Context
  constructor(context: Context) {
    this.#context = context
  }

  async clearGoogleAttendee(attendee: number) {
    return this.#context.postgres.run(async (client) => {
      // Clear google tokens, which are only used for the calendar
      await client.sql`
        DELETE FROM attendee_oauth2
        WHERE attendee = ${attendee}
      `
      // Remove google attributes from the attendee
      await client.sql`
        UPDATE attendees
        SET "userData" = "userData" - 'googleCalendarId' - 'googleCalendarDate'
        WHERE id = ${attendee};
      `
    })
  }
}
