import { Schema } from '@gravito/atlas'

export default class CreateUsers {
  async up() {
    await Schema.create('users', (table) => {
      table.id()
      table.string('name')
      table.string('email').unique()
      table.string('password')
      table.boolean('is_active').default(true)
      table.timestamps()
    })
  }

  async down() {
    await Schema.dropIfExists('users')
  }
}