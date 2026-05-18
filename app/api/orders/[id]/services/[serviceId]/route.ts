import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { updateService, deleteService } from '@/lib/services/orders'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  try {
    await requireAuth()

    const { serviceId } = await params
    const body = await request.json()

    const service = await updateService(parseInt(serviceId, 10), body)

    return Response.json(service)
  } catch (error) {
    console.error('Update service error:', error)
    return Response.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  try {
    await requireAuth()

    const { serviceId } = await params
    await deleteService(parseInt(serviceId, 10))

    return Response.json({ message: 'Service deleted' })
  } catch (error) {
    console.error('Delete service error:', error)
    return Response.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
