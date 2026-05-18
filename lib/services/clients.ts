import { db } from '@/db'
import { clients, vehicles } from '@/db/schema'
import { eq, desc, and, like, SQL, count } from 'drizzle-orm'

const PAGE_SIZE = 20

export interface CreateClientInput {
  name: string
  phone?: string
  email?: string
  notes?: string
}

export interface CreateVehicleInput {
  clientId: number
  make: string
  model: string
  year?: number
  licensePlate?: string
  vin?: string
  notes?: string
}

export async function getClients(
  filters: {
    search?: string
    page?: number
  } = {}
) {
  const { search, page = 1 } = filters
  const offset = (page - 1) * PAGE_SIZE

  const whereConditions: SQL[] = []

  if (search) {
    whereConditions.push(like(clients.name, `%${search}%`))
  }

  const data = await db.query.clients.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    with: {
      vehicles: true,
    },
    orderBy: [desc(clients.createdAt)],
    limit: PAGE_SIZE,
    offset,
  })

  const countResult = await db
    .select({ value: count() })
    .from(clients)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)

  const totalCount = countResult[0]?.value || 0

  return {
    data,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: totalCount,
      pages: Math.ceil(totalCount / PAGE_SIZE),
    },
  }
}

export async function getClientById(id: number) {
  return db.query.clients.findFirst({
    where: eq(clients.id, id),
    with: {
      vehicles: true,
      orders: {
        with: {
          parts: true,
          services: true,
        },
      },
    },
  })
}

export async function createClient(input: CreateClientInput) {
  const newClient = await db
    .insert(clients)
    .values(input)
    .returning()

  return newClient[0]
}

export async function updateClient(id: number, input: Partial<CreateClientInput>) {
  const updated = await db
    .update(clients)
    .set(input)
    .where(eq(clients.id, id))
    .returning()

  return updated[0]
}

export async function deleteClient(id: number) {
  await db.delete(clients).where(eq(clients.id, id))
}

export async function getVehiclesByClient(clientId: number) {
  return db.query.vehicles.findMany({
    where: eq(vehicles.clientId, clientId),
  })
}

export async function getVehicleById(id: number) {
  return db.query.vehicles.findFirst({
    where: eq(vehicles.id, id),
    with: {
      client: true,
    },
  })
}

export async function createVehicle(input: CreateVehicleInput) {
  const newVehicle = await db
    .insert(vehicles)
    .values(input)
    .returning()

  return newVehicle[0]
}

export async function updateVehicle(id: number, input: Partial<Omit<CreateVehicleInput, 'clientId'>>) {
  const updated = await db
    .update(vehicles)
    .set(input)
    .where(eq(vehicles.id, id))
    .returning()

  return updated[0]
}

export async function deleteVehicle(id: number) {
  await db.delete(vehicles).where(eq(vehicles.id, id))
}
