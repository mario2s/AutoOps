'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function InsightsPage() {
  const [stats, setStats] = useState<any>(null)
  const [revenue, setRevenue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then((r) => r.json()),
      fetch('/api/stats?type=revenue&days=30').then((r) => r.json()),
    ]).then(([statsData, revenueData]) => {
      setStats(statsData)
      setRevenue(revenueData)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Insights & Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.ordersByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Mechanics Performance</h2>
        <div className="space-y-3">
          {stats.topMechanics.map((mechanic: any) => (
            <div key={mechanic.name} className="flex justify-between items-center">
              <span className="font-medium">{mechanic.name}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: stats.topMechanics.length > 0 ? `${(mechanic.count / stats.topMechanics[0].count) * 100}%` : '0%' }} />
                </div>
                <span className="font-semibold w-12 text-right">{mechanic.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
