'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DashboardStats {
  totalOrders: number
  totalRevenue: string
  avgOrderValue: string
  overdueCounts: number
  ordersByStatus: Array<{ status: string; count: number }>
  topMechanics: Array<{ name: string; count: number }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to load dashboard stats')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
  }

  if (!stats) {
    return <div className="text-center py-8">No data available</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to AutoOps. Here's your workshop overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-2">${parseFloat(stats.totalRevenue).toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Avg Order Value</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">${parseFloat(stats.avgOrderValue).toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Overdue Orders</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdueCounts}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {stats.ordersByStatus.map((item) => (
              <div key={item.status} className="flex justify-between items-center">
                <span className="text-gray-700 capitalize">{item.status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / stats.totalOrders) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-gray-900 font-semibold w-12 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Mechanics</h2>
          <div className="space-y-3">
            {stats.topMechanics.map((mechanic) => (
              <div key={mechanic.name} className="flex justify-between items-center">
                <span className="text-gray-700">{mechanic.name}</span>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {mechanic.count} orders
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/orders/new"
            className="block p-4 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-center font-medium"
          >
            + Create New Order
          </Link>
          <Link
            href="/clients/new"
            className="block p-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition text-center font-medium"
          >
            + Add New Client
          </Link>
        </div>
      </div>
    </div>
  )
}
