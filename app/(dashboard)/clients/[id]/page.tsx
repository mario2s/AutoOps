'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then(async ({ id }) => {
      setId(id)
      try {
        const res = await fetch(`/api/clients/${id}`)
        const data = await res.json()
        setClient(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })
  }, [params])

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!client) return <div className="text-center py-8">Client not found</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-gray-600 mt-1">{client.email || '-'} | {client.phone || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicles</h2>
          {(!client.vehicles || client.vehicles.length === 0) ? (
            <p className="text-gray-600">No vehicles</p>
          ) : (
            <ul className="space-y-2">
              {client.vehicles.map((vehicle: any) => (
                <li key={vehicle.id} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                  <p className="text-sm text-gray-600">{vehicle.licensePlate || '-'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {(!client.orders || client.orders.length === 0) ? (
            <p className="text-gray-600">No orders</p>
          ) : (
            <ul className="space-y-2">
              {client.orders.slice(0, 5).map((order: any) => (
                <li key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <Link href={`/orders/${order.id}`} className="text-indigo-600 hover:underline">
                    Order #{order.id}
                  </Link>
                  <span className="text-sm text-gray-600">{order.status.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
