import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyToken, type TokenPayload } from './auth'

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  return verifyToken(token)
}

export async function requireAuth(): Promise<TokenPayload> {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function requireAdmin(): Promise<TokenPayload> {
  const session = await requireAuth()
  if (session.role !== 'admin') {
    throw new Error('Admin access required')
  }
  return session
}

export async function getUser(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  return user
}

export async function getCurrentUser(): Promise<(typeof users.$inferSelect) | null> {
  const session = await getSession()
  if (!session) return null

  return (await getUser(session.id)) ?? null
}
