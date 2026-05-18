import { db } from '@/db'
import { users } from '@/db/schema'
import { hashPassword } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return Response.json(
        { error: 'Missing required fields: name, email, password' },
        { status: 400 }
      )
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      return Response.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: 'mechanic',
        status: 'pending',
      })
      .returning()

    return Response.json(
      {
        message: 'Registration successful. Please wait for admin approval.',
        user: {
          id: newUser[0].id,
          name: newUser[0].name,
          email: newUser[0].email,
          status: newUser[0].status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return Response.json({ error: 'Registration failed' }, { status: 500 })
  }
}
