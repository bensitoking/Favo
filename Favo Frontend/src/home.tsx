import React, { useEffect, useState } from 'react'
import { SearchBar } from './components/index/SearchBar'
import { Categories } from './components/index/Categories'
import { ServiceCard } from './components/index/ServiceCard'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

const API_URL = "https://favo-iy6h.onrender.com"

type Professional = {
  id_usuario: number
  nombre: string
  descripcion: string
  foto_perfil: string
  verificado: boolean
  rating: number
  cantidad_ratings: number
}

export default function Home() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const res = await fetch(`${API_URL}/profesionales-destacados`)
        if (!res.ok) throw new Error(`Error: ${res.status}`)
        const data = await res.json()
        setProfessionals(data || [])
      } catch (err) {
        console.error('Error fetching professionals:', err)
        setProfessionals([])
      } finally {
        setLoading(false)
      }
    }

    fetchProfessionals()
  }, [])

  const displayedProfessionals = professionals.slice(carouselIndex, carouselIndex + 3)
  const hasNextPage = carouselIndex + 3 < professionals.length
  const hasPrevPage = carouselIndex > 0

  const handleNext = () => {
    if (hasNextPage) {
      setCarouselIndex(carouselIndex + 1)
    }
  }

  const handlePrev = () => {
    if (hasPrevPage) {
      setCarouselIndex(carouselIndex - 1)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="bg-[#1a365d] py-16 px-4">
          <div className="container mx-auto text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Encontrá el servicio que necesitás
            </h1>
            <p className="text-blue-100 mb-8">
              Miles de personas listas para ayudarte
            </p>
            <SearchBar />
          </div>
        </div>
        <Categories />
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-[#1a365d] mb-8">
              Profesionales destacados
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Cargando profesionales...</p>
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay profesionales disponibles</p>
              </div>
            ) : (
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedProfessionals.map((professional) => (
                    <ServiceCard
                      key={professional.id_usuario}
                      provider={{
                        id_usuario: professional.id_usuario,
                        name: professional.nombre,
                        rating: professional.rating,
                        location: professional.nombre,
                        image: professional.foto_perfil || 'https://randomuser.me/api/portraits/lego/1.jpg',
                        description: professional.descripcion || 'Profesional destacado',
                        skills: []
                      }}
                    />
                  ))}
                </div>

                {professionals.length > 3 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={handlePrev}
                      disabled={!hasPrevPage}
                      className={`p-2 rounded-full transition-colors ${
                        hasPrevPage
                          ? 'bg-blue-900 text-white hover:bg-blue-800'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeftIcon size={24} />
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: Math.ceil(professionals.length / 1) }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-2 rounded-full transition-colors ${
                            idx >= carouselIndex && idx < carouselIndex + 3
                              ? 'bg-blue-900 w-8'
                              : 'bg-gray-300 w-2'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNext}
                      disabled={!hasNextPage}
                      className={`p-2 rounded-full transition-colors ${
                        hasNextPage
                          ? 'bg-blue-900 text-white hover:bg-blue-800'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ChevronRightIcon size={24} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
