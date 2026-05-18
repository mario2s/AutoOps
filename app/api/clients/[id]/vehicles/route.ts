import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { getVehiclesByClient, createVehicle } from '@/lib/services/clients'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const vehicles = await getVehiclesByClient(parseInt(id, 10))

    return Response.json(vehicles)
  } catch (error) {
    console.error('Get vehicles error:', error)
    return Response.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const { make, model, year, licensePlate, vin, notes } = body

    if (!make || !model) {
      return Response.json({ error: 'Missing required fields: make, model' }, { status: 400 })
    }

    const vehicle = await createVehicle({
      clientId: parseInt(id, 10),
      make,
      model,
      year,
      licensePlate,
      vin,
      notes,
    })

    return Response.json(vehicle, { status: 201 })
  } catch (error) {
    console.error('Create vehicle error:', error)
    return Response.json({ error: 'Failed to create vehicle' }, { status: 500 })
  }
}
