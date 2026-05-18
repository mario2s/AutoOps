'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Order {
  id: number
  status: string
  deadline: string | null
  notes: string | null
  vehicle: {
    make: string
    model: string
  }
  mechanic: {
    name: string
  }
  totals: {
    total: string
  }
}

interface OrdersResponse {
  data: Order[]
  pagination: {
    page: number
    pages: number
    total: number
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const url = new URL('/api/orders', window.location.origin)
        url.searchParams.set('page', page.toString())
        if (filter) url.searchParams.set('status', filter)

        const res = await fetch(url)
        const data: OrdersResponse = await res.json()

        setOrders(data.data)
        setPagination(data.pagination)
        setLoading(false)
      } catch (err) {
        setError('Failed to load orders')
        setLoading(false)
      }
    }

    fetchOrders()
  }, [page, filter])

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-red-100 text-red-800',
  }

  const isOverdue = (deadline: string | null) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage all repair orders</p>
        </div>
        <Link
          href="/orders/new"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          + New Order
        </Link>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded transition ${
                !filter ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {['pending', 'in_progress', 'completed', 'on_hold'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded transition capitalize ${
                  filter === status
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Mechanic</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {order.vehicle.make} {order.vehicle.model}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{order.mechanic.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.deadline ? (
                        <span className={isOverdue(order.deadline) ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                          {new Date(order.deadline).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">${parseFloat(order.totals.total).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <Link href={`/orders/${order.id}`} className="text-indigo-600 hover:underline text-sm font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => router.push(`?page=${p}`)}
                className={`px-3 py-2 rounded transition ${
                  p === page ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
