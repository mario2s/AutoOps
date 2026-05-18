import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { addService } from '@/lib/services/orders'
import { db } from '@/db'
import { orderServices } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const { description, costType, hours, hourlyRate, fixedCost } = body

    if (!description || !costType) {
      return Response.json(
        { error: 'Missing required fields: description, costType' },
        { status: 400 }
      )
    }

    const service = await addService(parseInt(id, 10), {
      description,
      costType,
      hours,
      hourlyRate,
      fixedCost,
    })

    return Response.json(service, { status: 201 })
  } catch (error) {
    console.error('Add service error:', error)
    return Response.json({ error: 'Failed to add service' }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const services = await db.query.orderServices.findMany({
      where: eq(orderServices.orderId, parseInt(id, 10)),
    })

    return Response.json(services)
  } catch (error) {
    console.error('Get services error:', error)
    return Response.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}
