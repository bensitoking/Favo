import React, { useEffect, useState } from 'react'
import { MapPinIcon } from 'lucide-react'

export const RecentRequests = ({ apiUrl }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${apiUrl}/recent-requests`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setRequests(data)
      } catch (err) {
        console.error('Error fetching recent requests:', err)
        setError('Error al cargar solicitudes recientes')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [apiUrl])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => (
        <div
          key={r.id}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="ml-3">
              <div className="font-semibold text-gray-800">{r.name}</div>
              <div className="text-xs text-gray-500 flex items-center">
                <MapPinIcon size={12} className="mr-1" />
                {r.location}
              </div>
            </div>
            <span className="ml-auto text-xs px-3 py-1 rounded-full bg-green-100 text-green-800">
              {r.status}
            </span>
          </div>
          <h3 className="font-medium text-gray-800 mb-2">{r.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{r.description}</p>
          <div className="flex justify-end">
            <button className="bg-[#1a365d] text-white px-4 py-2 rounded-md hover:bg-[#234781] transition-colors text-sm">
              Contactar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}