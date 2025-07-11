import React from 'react'
import { SearchBar } from './components/index/SearchBar'
import { Categories } from './components/index/Categories'
import { ServiceCard } from './components/index/ServiceCard'

export default function Home() {
  const providers = [
    {
      name: 'Laura M.',
      rating: 4.8,
      location: 'Olivos',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      description: 'Profesora de matemáticas con 5 años de experiencia',
    },
    {
      name: 'Carlos G.',
      rating: 4.9,
      location: 'Flores',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      description: 'Plomero profesional, servicios de emergencia 24/7',
    },
    {
      name: 'María S.',
      rating: 4.7,
      location: 'Recoleta',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      description: 'Diseñadora gráfica especializada en branding',
    },
  ]

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider, index) => (
                <ServiceCard key={index} provider={provider} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
