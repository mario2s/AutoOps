'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then(async ({ id }) => {
      setId(id)
      try {
        const res = await fetch(`/api/orders/${id}`)
        const data = await res.json()
        setOrder(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })
  }, [params])

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!order) return <div className="text-center py-8">Order not found</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="text-gray-600 mt-1">
            {order.vehicle.make} {order.vehicle.model}
          </p>
        </div>
        <Link href={`/orders/${id}/edit`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Client</p>
          <p className="text-lg font-semibold text-gray-900">{order.client.name}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Mechanic</p>
          <p className="text-lg font-semibold text-gray-900">{order.mechanic.name}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Status</p>
          <p className="text-lg font-semibold text-indigo-600 capitalize">{order.status.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Parts</h2>
          {order.parts.length === 0 ? (
            <p className="text-gray-600">No parts added</p>
          ) : (
            <div className="space-y-3">
              {order.parts.map((part: any) => (
                <div key={part.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{part.partName}</span>
                  <span className="text-gray-600">
                    {part.quantity} x ${parseFloat(part.unitPrice).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t font-semibold">Parts Total: ${parseFloat(order.totals.partTotal).toFixed(2)}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
          {order.services.length === 0 ? (
            <p className="text-gray-600">No services added</p>
          ) : (
            <div className="space-y-3">
              {order.services.map((service: any) => (
                <div key={service.id} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">{service.description}</p>
                  <p className="text-sm text-gray-600">
                    {service.costType === 'hourly'
                      ? `${service.hours}h @ $${parseFloat(service.hourlyRate).toFixed(2)}/h`
                      : `$${parseFloat(service.fixedCost).toFixed(2)}`}
                  </p>
                </div>
              ))}
              <div className="pt-3 border-t font-semibold">Services Total: ${parseFloat(order.totals.serviceTotal).toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">Grand Total</p>
            <p className="text-4xl font-bold text-indigo-600">${parseFloat(order.totals.total).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Deadline: {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Not set'}</p>
            {order.notes && <p className="text-gray-700 mt-2">Notes: {order.notes}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
