import { db } from '@/db'
import { users } from '@/db/schema'
import { comparePassword, signToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      )
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.status !== 'active') {
      return Response.json(
        { error: `Account is ${user.status}. Please wait for admin approval.` },
        { status: 403 }
      )
    }

    const passwordMatch = await comparePassword(password, user.passwordHash)

    if (!passwordMatch) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    })

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    )

    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
}
