import React, { useState } from 'react';
import { OrderTabs } from './OrderTabs';
import { OrderCard } from './OrderCard';
import { PlusCircleIcon } from 'lucide-react';
const MOCK_ORDERS = {
  active: [{
    id: 1,
    service: 'Diseño Web',
    provider: 'Laura M.',
    status: 'en_proceso',
    date: '2023-12-10',
    description: 'Diseño de landing page para startup',
    location: 'Palermo, Buenos Aires'
  }, {
    id: 2,
    service: 'Reparación de AC',
    provider: 'Carlos G.',
    status: 'pendiente',
    date: '2023-12-12',
    description: 'No enfría correctamente, necesita revisión',
    location: 'Belgrano, Buenos Aires'
  }],
  completed: [{
    id: 3,
    service: 'Clases de Inglés',
    provider: 'María S.',
    status: 'completado',
    date: '2023-12-01',
    description: 'Clase de conversación nivel intermedio',
    rating: 5,
    location: 'Virtual'
  }, {
    id: 4,
    service: 'Soporte Técnico',
    provider: 'Juan P.',
    status: 'completado',
    date: '2023-11-28',
    description: 'Configuración de red empresarial',
    rating: 4,
    location: 'Recoleta, Buenos Aires'
  }]
};
export function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  return <div className="min-h-screen bg-gray-50 w-full">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Mis Pedidos</h1>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <PlusCircleIcon size={20} />
            <span>Nuevo Pedido</span>
          </button>
        </div>
        <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="space-y-4 mt-6">
          {MOCK_ORDERS[activeTab].map(order => <OrderCard key={order.id} order={order} />)}
        </div>
        {MOCK_ORDERS[activeTab].length === 0 && <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No tienes pedidos{' '}
              {activeTab === 'active' ? 'activos' : 'completados'} en este
              momento
            </p>
          </div>}
      </main>
    </div>;
}