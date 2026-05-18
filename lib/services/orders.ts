import { db } from '@/db'
import { orders, orderParts, orderServices, vehicles, clients } from '@/db/schema'
import { eq, desc, SQL, and, like } from 'drizzle-orm'
import Decimal from 'decimal.js'

const PAGE_SIZE = 20

export interface CreateOrderInput {
  vehicleId: number
  clientId: number
  mechanicId: number
  deadline?: Date
  notes?: string
}

export interface CreatePartInput {
  partName: string
  quantity: number
  unitPrice: string
}

export interface CreateServiceInput {
  description: string
  costType: 'hourly' | 'fixed'
  hours?: string
  hourlyRate?: string
  fixedCost?: string
}

export async function getOrders(
  filters: {
    status?: string
    mechanicId?: number
    search?: string
    page?: number
  } = {}
) {
  const { status, mechanicId, search, page = 1 } = filters
  const offset = (page - 1) * PAGE_SIZE

  const whereConditions: SQL[] = []

  if (status) {
    whereConditions.push(eq(orders.status, status))
  }

  if (mechanicId) {
    whereConditions.push(eq(orders.mechanicId, mechanicId))
  }

  if (search) {
    whereConditions.push(like(orders.notes, `%${search}%`))
  }

  const data = await db.query.orders.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    with: {
      vehicle: {
        with: {
          client: true,
        },
      },
      mechanic: true,
      parts: true,
      services: true,
    },
    orderBy: [desc(orders.createdAt)],
    limit: PAGE_SIZE,
    offset,
  })

  const totalCount = await db.$count(
    orders,
    whereConditions.length > 0 ? and(...whereConditions) : undefined
  )

  return {
    data: data.map((order) => ({
      ...order,
      totals: computeOrderTotals(order),
    })),
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: totalCount,
      pages: Math.ceil(totalCount / PAGE_SIZE),
    },
  }
}

export async function getOrderById(id: number) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      vehicle: {
        with: {
          client: true,
        },
      },
      mechanic: true,
      parts: true,
      services: true,
    },
  })

  if (!order) return null

  return {
    ...order,
    totals: computeOrderTotals(order),
  }
}

export async function createOrder(input: CreateOrderInput) {
  const newOrder = await db
    .insert(orders)
    .values({
      vehicleId: input.vehicleId,
      clientId: input.clientId,
      mechanicId: input.mechanicId,
      deadline: input.deadline,
      notes: input.notes,
      status: 'pending',
    })
    .returning()

  return newOrder[0]
}

export async function updateOrder(
  id: number,
  data: {
    status?: string
    deadline?: Date
    notes?: string
  }
) {
  const updated = await db
    .update(orders)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
    .returning()

  return updated[0]
}

export async function deleteOrder(id: number) {
  await db.delete(orders).where(eq(orders.id, id))
}

export async function addPart(orderId: number, input: CreatePartInput) {
  const newPart = await db
    .insert(orderParts)
    .values({
      orderId,
      partName: input.partName,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
    })
    .returning()

  return newPart[0]
}

export async function updatePart(id: number, input: Partial<CreatePartInput>) {
  const updated = await db
    .update(orderParts)
    .set(input)
    .where(eq(orderParts.id, id))
    .returning()

  return updated[0]
}

export async function deletePart(id: number) {
  await db.delete(orderParts).where(eq(orderParts.id, id))
}

export async function addService(orderId: number, input: CreateServiceInput) {
  const newService = await db
    .insert(orderServices)
    .values({
      orderId,
      description: input.description,
      costType: input.costType,
      hours: input.hours,
      hourlyRate: input.hourlyRate,
      fixedCost: input.fixedCost,
    })
    .returning()

  return newService[0]
}

export async function updateService(id: number, input: Partial<CreateServiceInput>) {
  const updated = await db
    .update(orderServices)
    .set(input)
    .where(eq(orderServices.id, id))
    .returning()

  return updated[0]
}

export async function deleteService(id: number) {
  await db.delete(orderServices).where(eq(orderServices.id, id))
}

export function computeOrderTotals(order: {
  parts: Array<{ quantity: number; unitPrice: string }>
  services: Array<{
    costType: string
    hours: string | null
    hourlyRate: string | null
    fixedCost: string | null
  }>
}) {
  let partTotal = new Decimal(0)
  let serviceTotal = new Decimal(0)

  order.parts.forEach((part) => {
    partTotal = partTotal.plus(new Decimal(part.quantity).times(new Decimal(part.unitPrice)))
  })

  order.services.forEach((service) => {
    if (service.costType === 'hourly' && service.hours && service.hourlyRate) {
      serviceTotal = serviceTotal.plus(new Decimal(service.hours).times(new Decimal(service.hourlyRate)))
    } else if (service.costType === 'fixed' && service.fixedCost) {
      serviceTotal = serviceTotal.plus(new Decimal(service.fixedCost))
    }
  })

  const total = partTotal.plus(serviceTotal)

  return {
    partTotal: partTotal.toString(),
    serviceTotal: serviceTotal.toString(),
    total: total.toString(),
  }
}
