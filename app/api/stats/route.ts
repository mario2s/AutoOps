import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/dal'
import { getDashboardStats, getRevenueTimeSeries } from '@/lib/services/stats'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'dashboard'

    if (type === 'revenue') {
      const days = parseInt(searchParams.get('days') || '30', 10)
      const data = await getRevenueTimeSeries(days)
      return Response.json(data)
    }

    const stats = await getDashboardStats()
    return Response.json(stats)
  } catch (error) {
    console.error('Get stats error:', error)
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
