import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { MapPinIcon } from 'lucide-react'

export const RecentRequests = () => {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    const fetchServices = async () => {
  const { data, error } = await supabase
    .from('Servicio')
    .select(`
      id_servicios,
      titulo,
      descripcion,
      Usuario (
        nombre,
        Ubicacion (
          barrio_zona
        )
      )
    `)
    .limit(10)

  if (error) {
    console.error('Error al obtener servicios:', error.message || error.details)
    return
  }

  console.log('Datos recibidos de Supabase:', data) 

  const formatted = data.map((s) => ({
    id:           s.id_servicios,
    name:         s.Usuario?.nombre || 'Desconocido',
    location:     s.Usuario?.Ubicacion?.barrio_zona || 'Sin ubicación',
    title:        s.titulo,
    description:  s.descripcion,
    status:       'Disponible',
  }))

  setRequests(formatted)
}

    fetchServices()
  }, [])

  return (
    <div className="space-y-4">
      {requests.map((r) => (
        <div
          key={r.id}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
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
          <p className="text-gray-600 mb-4">{r.description}</p>
          <div className="flex justify-end">
            <button className="bg-[#1a365d] text-white px-4 py-2 rounded-md hover:bg-[#234781] transition-colors">
              Contactar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
