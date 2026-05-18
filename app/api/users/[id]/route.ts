import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/dal'
import { getUserById, approveUser, rejectUser, updateUserRole, deleteUser } from '@/lib/services/users'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const user = await getUserById(parseInt(id, 10))

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return Response.json({ error: 'Admin access required' }, { status: 403 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = await request.json()
    const { status, role } = body

    const userId = parseInt(id, 10)

    if (status === 'active') {
      const user = await approveUser(userId)
      return Response.json(user)
    }

    if (status === 'rejected') {
      const user = await rejectUser(userId)
      return Response.json(user)
    }

    if (role) {
      const user = await updateUserRole(userId, role)
      return Response.json(user)
    }

    return Response.json({ error: 'No valid update provided' }, { status: 400 })
  } catch (error) {
    console.error('Update user error:', error)
    return Response.json({ error: 'Admin access required' }, { status: 403 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    await deleteUser(parseInt(id, 10))

    return Response.json({ message: 'User deleted' })
  } catch (error) {
    console.error('Delete user error:', error)
    return Response.json({ error: 'Admin access required' }, { status: 403 })
  }
}
