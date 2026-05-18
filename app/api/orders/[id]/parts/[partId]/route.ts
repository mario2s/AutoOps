import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { updatePart, deletePart } from '@/lib/services/orders'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; partId: string }> }
) {
  try {
    await requireAuth()

    const { partId } = await params
    const body = await request.json()

    const part = await updatePart(parseInt(partId, 10), body)

    return Response.json(part)
  } catch (error) {
    console.error('Update part error:', error)
    return Response.json({ error: 'Failed to update part' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; partId: string }> }
) {
  try {
    await requireAuth()

    const { partId } = await params
    await deletePart(parseInt(partId, 10))

    return Response.json({ message: 'Part deleted' })
  } catch (error) {
    console.error('Delete part error:', error)
    return Response.json({ error: 'Failed to delete part' }, { status: 500 })
  }
}
