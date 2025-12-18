import parser from 'cron-parser'

export class CronParser {
  /**
   * Get the next execution date
   */
  static nextDate(expression: string, timezone = 'UTC', currentDate: Date = new Date()): Date {
    try {
      const interval = parser.parseExpression(expression, {
        currentDate,
        tz: timezone,
      })
      return interval.next().toDate()
    } catch (err) {
      throw new Error(`Invalid cron expression: ${expression}`)
    }
  }

  /**
   * Check if the cron expression is due to run at the current time
   */
  static isDue(expression: string, timezone = 'UTC', currentDate: Date = new Date()): boolean {
    try {
      // Check from 1 minute ago to see if the next scheduled time is "now"
      // This assumes the scheduler runs every minute
      const previousMinute = new Date(currentDate.getTime() - 60000)

      const interval = parser.parseExpression(expression, {
        currentDate: previousMinute,
        tz: timezone,
      })

      const nextRun = interval.next().toDate()

      // Compare down to the minute
      return this.minuteMatches(nextRun, currentDate)
    } catch (err) {
      return false
    }
  }

  private static minuteMatches(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate() &&
      date1.getHours() === date2.getHours() &&
      date1.getMinutes() === date2.getMinutes()
    )
  }
}
