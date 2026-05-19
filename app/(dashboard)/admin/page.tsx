'use client'

import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/users?pending=true').then((r) => r.json()),
    ]).then(([usersData, pendingData]) => {
      setUsers(usersData)
      setPending(pendingData)
    }).catch(() => {
      // ignore load errors, show empty state
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  const approve = async (id: number) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    })
    if (res.ok) setPending(pending.filter((u) => u.id !== id))
  }

  const reject = async (id: number) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    })
    if (res.ok) setPending(pending.filter((u) => u.id !== id))
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Administration</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending User Approvals ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-gray-600">No pending approvals</p>
        ) : (
          <div className="space-y-3">
            {pending.map((user) => (
              <div key={user.id} className="flex justify-between items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(user.id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                    Approve
                  </button>
                  <button onClick={() => reject(user.id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 capitalize">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
