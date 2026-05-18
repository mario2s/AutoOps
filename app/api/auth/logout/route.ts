import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' })

  response.cookies.set({
    name: 'session',
    value: '',
    httpOnly: true,
    maxAge: 0,
  })

  return response
}
