'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
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

export default function NewOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loadingClients, setLoadingClients] = useState(true)

  const [formData, setFormData] = useState({
    clientId: '',
    vehicleId: '',
    deadline: '',
    notes: '',
  })

  const [parts, setParts] = useState<Part[]>([
    { id: '1', partName: '', quantity: 1, unitPrice: '' },
  ])

  const [services, setServices] = useState<Service[]>([
    { id: '1', description: '', costType: 'fixed', fixedCost: '' },
  ])

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients?limit=1000')
      const data = await response.json()
      setClients(data.clients || [])
    } catch (err) {
      setError('Failed to load clients')
    } finally {
      setLoadingClients(false)
    }
  }

  const fetchVehicles = async (clientId: string) => {
    if (!clientId) {
      setVehicles([])
      return
    }
    try {
      const response = await fetch(`/api/clients/${clientId}/vehicles`)
      const data = await response.json()
      setVehicles(data.vehicles || [])
    } catch (err) {
      console.error('Failed to load vehicles')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'clientId') {
      fetchVehicles(value)
      setFormData(prev => ({ ...prev, clientId: value, vehicleId: '' }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const addPart = () => {
    const newId = (Math.max(...parts.map(p => parseInt(p.id)), 0) + 1).toString()
    setParts([...parts, { id: newId, partName: '', quantity: 1, unitPrice: '' }])
  }

  const removePart = (id: string) => {
    if (parts.length > 1) {
      setParts(parts.filter(p => p.id !== id))
    }
  }

  const updatePart = (id: string, field: string, value: string | number) => {
    setParts(parts.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const addService = () => {
    const newId = (Math.max(...services.map(s => parseInt(s.id)), 0) + 1).toString()
    setServices([...services, { id: newId, description: '', costType: 'fixed', fixedCost: '' }])
  }

  const removeService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter(s => s.id !== id))
    }
  }

  const updateService = (id: string, field: string, value: string) => {
    setServices(services.map(s => {
      if (s.id !== id) return s
      const updated = { ...s, [field]: value }
      if (field === 'costType') {
        if (value === 'hourly') {
          updated.hours = updated.hours || '1'
          updated.hourlyRate = updated.hourlyRate || '50'
          updated.fixedCost = undefined
        } else {
          updated.fixedCost = updated.fixedCost || '50'
          updated.hours = undefined
          updated.hourlyRate = undefined
        }
      }
      return updated
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.clientId || !formData.vehicleId || !formData.deadline) {
        throw new Error('Please fill in all required fields')
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          vehicleId: formData.vehicleId,
          deadline: formData.deadline,
          notes: formData.notes,
          status: 'pending',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create order')
      }

      const orderData = await response.json()
      const orderId = orderData.id

      for (const part of parts) {
        if (part.partName && part.unitPrice) {
          await fetch(`/api/orders/${orderId}/parts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              partName: part.partName,
              quantity: part.quantity,
              unitPrice: part.unitPrice,
            }),
          })
        }
      }

      for (const service of services) {
        if (service.description) {
          await fetch(`/api/orders/${orderId}/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              description: service.description,
              costType: service.costType,
              hours: service.costType === 'hourly' ? service.hours : null,
              hourlyRate: service.costType === 'hourly' ? service.hourlyRate : null,
              fixedCost: service.costType === 'fixed' ? service.fixedCost : null,
            }),
          })
        }
      }

      router.push(`/orders/${orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loadingClients) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
      <p className="text-gray-600 mt-2">Select client, vehicle, and add parts/services</p>

      <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-lg shadow p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client *
            </label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle *
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleInputChange}
              required
              disabled={!formData.clientId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select a vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deadline *
          </label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional notes"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Parts</h3>
            <button
              type="button"
              onClick={addPart}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Part
            </button>
          </div>
          <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
            {parts.map((part, idx) => (
              <div key={part.id} className="flex gap-2 items-end">
                <input
                  type="text"
                  placeholder="Part name"
                  value={part.partName}
                  onChange={e => updatePart(part.id, 'partName', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={part.quantity}
                  onChange={e => updatePart(part.id, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={part.unitPrice}
                  onChange={e => updatePart(part.id, 'unitPrice', e.target.value)}
                  step="0.01"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  type="button"
                  onClick={() => removePart(part.id)}
                  disabled={parts.length === 1}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Services</h3>
            <button
              type="button"
              onClick={addService}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Service
            </button>
          </div>
          <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
            {services.map((service, idx) => (
              <div key={service.id} className="border-b pb-2 last:border-b-0">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Service description"
                    value={service.description}
                    onChange={e => updateService(service.id, 'description', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <select
                    value={service.costType}
                    onChange={e => updateService(service.id, 'costType', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeService(service.id)}
                    disabled={services.length === 1}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex gap-2">
                  {service.costType === 'hourly' ? (
                    <>
                      <input
                        type="number"
                        placeholder="Hours"
                        value={service.hours || ''}
                        onChange={e => updateService(service.id, 'hours', e.target.value)}
                        step="0.5"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Hourly rate"
                        value={service.hourlyRate || ''}
                        onChange={e => updateService(service.id, 'hourlyRate', e.target.value)}
                        step="0.01"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </>
                  ) : (
                    <input
                      type="number"
                      placeholder="Fixed cost"
                      value={service.fixedCost || ''}
                      onChange={e => updateService(service.id, 'fixedCost', e.target.value)}
                      step="0.01"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Creating...' : 'Create Order'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/orders')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
