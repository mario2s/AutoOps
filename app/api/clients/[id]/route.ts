import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { getClientById, updateClient, deleteClient } from '@/lib/services/clients'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const client = await getClientById(parseInt(id, 10))

    if (!client) {
      return Response.json({ error: 'Client not found' }, { status: 404 })
    }

    return Response.json(client)
  } catch (error) {
    console.error('Get client error:', error)
    return Response.json({ error: 'Failed to fetch client' }, { status: 500 })
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

    const client = await updateClient(parseInt(id, 10), body)

    return Response.json(client)
  } catch (error) {
    console.error('Update client error:', error)
    return Response.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    await deleteClient(parseInt(id, 10))

    return Response.json({ message: 'Client deleted' })
  } catch (error) {
    console.error('Delete client error:', error)
    return Response.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
