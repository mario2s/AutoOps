import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { getOrderById, updateOrder, deleteOrder } from '@/lib/services/orders'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const order = await getOrderById(parseInt(id, 10))

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    return Response.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    return Response.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()

    const order = await updateOrder(parseInt(id, 10), {
      status: body.status,
      deadline: body.deadline ? new Date(body.deadline) : undefined,
      notes: body.notes,
    })

    return Response.json(order)
  } catch (error) {
    console.error('Update order error:', error)
    return Response.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    await deleteOrder(parseInt(id, 10))

    return Response.json({ message: 'Order deleted' })
  } catch (error) {
    console.error('Delete order error:', error)
    return Response.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
