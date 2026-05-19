import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type DB = ReturnType<typeof drizzle<typeof schema>>

let _db: DB | null = null

function getDb(): DB {
  if (_db) return _db
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  _db = drizzle(neon(databaseUrl), { schema })
  return _db
}

export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const target = getDb()
    const value = Reflect.get(target, prop, target)
    return typeof value === 'function' ? value.bind(target) : value
  },
})
