import { column, Model } from '@gravito/atlas'

export default class Log extends Model {
  static override connection = 'mongodb'
  static tableName = 'logs'
  static override primaryKey = '_id'

  @column({ isPrimary: true })
  declare _id: any

  @column()
  declare level: string

  @column()
  declare message: string

  @column()
  declare context?: any

  @column()
  declare created_at?: Date
}
