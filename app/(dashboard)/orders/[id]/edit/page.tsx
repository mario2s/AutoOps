'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface OrderData {
  id: string
  status: string
  deadline: string
  notes: string
  vehicleId: string
  mechanicId: string
}

interface Part {
  id: string
  partName: string
  quantity: number
  unitPrice: string
}

interface Service {
  id: string
  description: string
  costType: 'hourly' | 'fixed'
  hours?: string
  hourlyRate?: string
  fixedCost?: string
}

const statuses = ['pending', 'in_progress', 'completed', 'on_hold']

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [newPart, setNewPart] = useState({ partName: '', quantity: 1, unitPrice: '' })
  const [newService, setNewService] = useState<{ description: string; costType: 'hourly' | 'fixed'; hours: string; hourlyRate: string; fixedCost: string }>({ description: '', costType: 'fixed', hours: '1', hourlyRate: '50', fixedCost: '' })

  useEffect(() => {
    fetchOrderData()
  }, [orderId])

  const fetchOrderData = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) throw new Error('Failed to load order')
      const data = await response.json()
      setOrder(data)
      setParts(data.parts || [])
      setServices(data.services || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handleOrderUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: order.status,
          deadline: order.deadline,
          notes: order.notes,
        }),
      })

      if (!response.ok) throw new Error('Failed to update order')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  const handleAddPart = async () => {
    if (!newPart.partName || !newPart.unitPrice) {
      setError('Please fill in part name and price')
      return
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPart),
      })

      if (!response.ok) throw new Error('Failed to add part')
      const addedPart = await response.json()
      setParts([...parts, addedPart])
      setNewPart({ partName: '', quantity: 1, unitPrice: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add part')
    }
  }

  const handleDeletePart = async (partId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/parts/${partId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete part')
      setParts(parts.filter(p => p.id !== partId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete part')
    }
  }

  const handleAddService = async () => {
    if (!newService.description) {
      setError('Please fill in service description')
      return
    }

    try {
      const payload = {
        description: newService.description,
        costType: newService.costType,
        hours: newService.costType === 'hourly' ? newService.hours : null,
        hourlyRate: newService.costType === 'hourly' ? newService.hourlyRate : null,
        fixedCost: newService.costType === 'fixed' ? newService.fixedCost : null,
      }

      const response = await fetch(`/api/orders/${orderId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to add service')
      const addedService = await response.json()
      setServices([...services, addedService])
      setNewService({ description: '', costType: 'fixed', hours: '1', hourlyRate: '50', fixedCost: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add service')
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete service')
      setServices(services.filter(s => s.id !== serviceId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!order) {
    return <div className="text-center py-8 text-red-600">Order not found</div>
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900">Edit Order #{orderId}</h1>
      <p className="text-gray-600 mt-2">Update order details, deadline, status, and manage parts/services</p>

      <form onSubmit={handleOrderUpdate} className="mt-6 bg-white rounded-lg shadow p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={order.status}
              onChange={e => setOrder({ ...order, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline
            </label>
            <input
              type="datetime-local"
              value={order.deadline.slice(0, 16)}
              onChange={e => setOrder({ ...order, deadline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={order.notes}
            onChange={e => setOrder({ ...order, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Order notes"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Parts</h3>
        </div>

        {parts.length > 0 && (
          <div className="mb-4 border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">Part Name</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Unit Price</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {parts.map(part => (
                  <tr key={part.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{part.partName}</td>
                    <td className="px-4 py-2 text-right">{part.quantity}</td>
                    <td className="px-4 py-2 text-right">${parseFloat(part.unitPrice).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">
                      ${(parseFloat(part.unitPrice) * part.quantity).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeletePart(part.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Part name"
              value={newPart.partName}
              onChange={e => setNewPart({ ...newPart, partName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Qty"
                value={newPart.quantity}
                onChange={e => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Price"
                value={newPart.unitPrice}
                onChange={e => setNewPart({ ...newPart, unitPrice: e.target.value })}
                step="0.01"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                type="button"
                onClick={handleAddPart}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Part
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Services</h3>
        </div>

        {services.length > 0 && (
          <div className="mb-4 space-y-2 border rounded-lg p-4 bg-gray-50">
            {services.map(service => (
              <div key={service.id} className="flex justify-between items-center p-3 border rounded bg-white">
                <div>
                  <p className="font-medium text-gray-900">{service.description}</p>
                  <p className="text-sm text-gray-600">
                    {service.costType === 'hourly'
                      ? `${service.hours}h × $${service.hourlyRate}/h = $${(parseFloat(service.hours || '0') * parseFloat(service.hourlyRate || '0')).toFixed(2)}`
                      : `Fixed: $${parseFloat(service.fixedCost || '0').toFixed(2)}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteService(service.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Service description"
              value={newService.description}
              onChange={e => setNewService({ ...newService, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="flex gap-2 mb-2">
              <select
                value={newService.costType}
                onChange={e => setNewService({ ...newService, costType: e.target.value as 'fixed' | 'hourly' })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="fixed">Fixed</option>
                <option value="hourly">Hourly</option>
              </select>
              {newService.costType === 'hourly' ? (
                <>
                  <input
                    type="number"
                    placeholder="Hours"
                    value={newService.hours}
                    onChange={e => setNewService({ ...newService, hours: e.target.value })}
                    step="0.5"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={newService.hourlyRate}
                    onChange={e => setNewService({ ...newService, hourlyRate: e.target.value })}
                    step="0.01"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </>
              ) : (
                <input
                  type="number"
                  placeholder="Fixed cost"
                  value={newService.fixedCost}
                  onChange={e => setNewService({ ...newService, fixedCost: e.target.value })}
                  step="0.01"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              )}
              <button
                type="button"
                onClick={handleAddService}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={() => router.push(`/orders/${orderId}`)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
        >
          Back to Order
        </button>
      </div>
    </div>
  )
}
