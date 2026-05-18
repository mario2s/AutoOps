import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { getOrders, createOrder } from '@/lib/services/orders'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const status = searchParams.get('status') || undefined
    const mechanicId = searchParams.get('mechanicId')
      ? parseInt(searchParams.get('mechanicId')!, 10)
      : undefined
    const search = searchParams.get('search') || undefined

    const result = await getOrders({
      page,
      status,
      mechanicId,
      search,
    })

    return Response.json(result)
  } catch (error) {
    console.error('Get orders error:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    const body = await request.json()
    const { vehicleId, clientId, deadline, notes } = body

    if (!vehicleId || !clientId) {
      return Response.json(
        { error: 'Missing required fields: vehicleId, clientId' },
        { status: 400 }
      )
    }

    const order = await createOrder({
      vehicleId,
      clientId,
      mechanicId: session.id,
      deadline: deadline ? new Date(deadline) : undefined,
      notes,
    })

    return Response.json(order, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
