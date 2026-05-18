import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { getClients, createClient } from '@/lib/services/clients'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const search = searchParams.get('search') || undefined

    const result = await getClients({
      page,
      search,
    })

    return Response.json(result)
  } catch (error) {
    console.error('Get clients error:', error)
    return Response.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const { name, phone, email, notes } = body

    if (!name) {
      return Response.json({ error: 'Missing required field: name' }, { status: 400 })
    }

    const client = await createClient({
      name,
      phone,
      email,
      notes,
    })

    return Response.json(client, { status: 201 })
  } catch (error) {
    console.error('Create client error:', error)
    return Response.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
