import { db } from '@/db'
import { orders, orderParts, orderServices } from '@/db/schema'
import { eq, count, sql } from 'drizzle-orm'
import Decimal from 'decimal.js'

export async function getDashboardStats() {
  const countResult = await db
    .select({ value: count() })
    .from(orders)

  const totalOrders = countResult[0]?.value || 0

  const ordersByStatus = await db
    .select({
      status: orders.status,
      count: count(),
    })
    .from(orders)
    .groupBy(orders.status)

  const allOrders = await db.query.orders.findMany({
    with: {
      parts: true,
      services: true,
      mechanic: true,
    },
  })

  let totalRevenue = new Decimal(0)

  allOrders.forEach((order) => {
    order.parts.forEach((part) => {
      totalRevenue = totalRevenue.plus(new Decimal(part.quantity).times(new Decimal(part.unitPrice)))
    })
    order.services.forEach((service) => {
      if (service.costType === 'hourly' && service.hours && service.hourlyRate) {
        totalRevenue = totalRevenue.plus(new Decimal(service.hours).times(new Decimal(service.hourlyRate)))
      } else if (service.costType === 'fixed' && service.fixedCost) {
        totalRevenue = totalRevenue.plus(new Decimal(service.fixedCost))
      }
    })
  })

  const avgOrderValue = totalOrders > 0
    ? new Decimal(totalRevenue).dividedBy(new Decimal(totalOrders)).toString()
    : '0'

  const overdueCounts = allOrders.filter((o) => {
    if (!o.deadline) return false
    return new Date(o.deadline) < new Date() && o.status !== 'completed'
  }).length

  const topMechanicsMap = new Map<number, { count: number; name: string }>()
  allOrders.forEach((order) => {
    const existing = topMechanicsMap.get(order.mechanicId) || { count: 0, name: order.mechanic.name }
    topMechanicsMap.set(order.mechanicId, {
      count: existing.count + 1,
      name: existing.name,
    })
  })

  const topMechanics = Array.from(topMechanicsMap.entries())
    .map(([_, value]) => value)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalOrders,
    totalRevenue: totalRevenue.toString(),
    avgOrderValue,
    overdueCounts,
    ordersByStatus: ordersByStatus.map((item) => ({
      status: item.status,
      count: item.count,
    })),
    topMechanics,
  }
}

export async function getRevenueTimeSeries(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const allOrders = await db.query.orders.findMany({
    where: sql`${orders.createdAt} >= ${startDate}`,
    with: {
      parts: true,
      services: true,
    },
  })

  const revenueByDay = new Map<string, Decimal>()

  allOrders.forEach((order) => {
    const dateKey = new Date(order.createdAt).toISOString().split('T')[0]
    let dayRevenue = revenueByDay.get(dateKey) || new Decimal(0)

    order.parts.forEach((part) => {
      dayRevenue = dayRevenue.plus(new Decimal(part.quantity).times(new Decimal(part.unitPrice)))
    })

    order.services.forEach((service) => {
      if (service.costType === 'hourly' && service.hours && service.hourlyRate) {
        dayRevenue = dayRevenue.plus(new Decimal(service.hours).times(new Decimal(service.hourlyRate)))
      } else if (service.costType === 'fixed' && service.fixedCost) {
        dayRevenue = dayRevenue.plus(new Decimal(service.fixedCost))
      }
    })

    revenueByDay.set(dateKey, dayRevenue)
  })

  return Array.from(revenueByDay.entries())
    .map(([date, revenue]) => ({
      date,
      revenue: revenue.toString(),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
