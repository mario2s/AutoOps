import { db } from '@/db'
import { users } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function getUsers() {
  return db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  })
}

export async function getPendingUsers() {
  return db.query.users.findMany({
    where: eq(users.status, 'pending'),
    orderBy: [desc(users.createdAt)],
  })
}

export async function getUserById(id: number) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  })
}

export async function approveUser(id: number) {
  const updated = await db
    .update(users)
    .set({ status: 'active' })
    .where(eq(users.id, id))
    .returning()

  return updated[0]
}

export async function rejectUser(id: number) {
  const updated = await db
    .update(users)
    .set({ status: 'rejected' })
    .where(eq(users.id, id))
    .returning()

  return updated[0]
}

export async function updateUserRole(id: number, role: 'admin' | 'mechanic') {
  const updated = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, id))
    .returning()

  return updated[0]
}

export async function deleteUser(id: number) {
  await db.delete(users).where(eq(users.id, id))
}
