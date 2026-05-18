import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { addPart, deletePart, updatePart } from '@/lib/services/orders'
import { db } from '@/db'
import { orderParts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const { partName, quantity, unitPrice } = body

    if (!partName || !quantity || !unitPrice) {
      return Response.json(
        { error: 'Missing required fields: partName, quantity, unitPrice' },
        { status: 400 }
      )
    }

    const part = await addPart(parseInt(id, 10), {
      partName,
      quantity,
      unitPrice,
    })

    return Response.json(part, { status: 201 })
  } catch (error) {
    console.error('Add part error:', error)
    return Response.json({ error: 'Failed to add part' }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const parts = await db.query.orderParts.findMany({
      where: eq(orderParts.orderId, parseInt(id, 10)),
    })

    return Response.json(parts)
  } catch (error) {
    console.error('Get parts error:', error)
    return Response.json({ error: 'Failed to fetch parts' }, { status: 500 })
  }
}
