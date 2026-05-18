import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/dal'
import { getUsers, getPendingUsers } from '@/lib/services/users'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const pending = searchParams.get('pending') === 'true'

    const users = pending ? await getPendingUsers() : await getUsers()

    return Response.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    return Response.json({ error: 'Admin access required' }, { status: 403 })
  }
}
