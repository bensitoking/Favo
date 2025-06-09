import React from 'react';
import { TrendingUpIcon, AwardIcon } from 'lucide-react';
const trending = [{
  id: 1,
  title: 'Diseño Web',
  providers: 124,
  growth: '+15%'
}, {
  id: 2,
  title: 'Clases de Inglés',
  providers: 89,
  growth: '+12%'
}, {
  id: 3,
  title: 'Reparación de AC',
  providers: 67,
  growth: '+8%'
}];
const topProviders = [{
  id: 1,
  name: 'Carlos M.',
  image: 'https://randomuser.me/api/portraits/men/92.jpg',
  service: 'Analista de bases de datos',
  rating: 4.9,
  reviews: 156
}, {
  id: 2,
  name: 'Laura S.',
  image: 'https://randomuser.me/api/portraits/women/55.jpg',
  service: 'Diseño Gráfico',
  rating: 4.8,
  reviews: 98
}];
export const TrendingColumn = () => {
  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center mb-4">
          <TrendingUpIcon className="text-blue-500 mr-2" size={20} />
          <h3 className="font-semibold text-gray-800">Servicios Tendencia</h3>
        </div>
        <div className="space-y-3">
          {trending.map(item => <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div>
                <div className="font-medium text-gray-700">{item.title}</div>
                <div className="text-xs text-gray-500">
                  {item.providers} proveedores
                </div>
              </div>
              <span className="text-green-500 text-sm">{item.growth}</span>
            </div>)}
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center mb-4">
          <AwardIcon className="text-blue-500 mr-2" size={20} />
          <h3 className="font-semibold text-gray-800">Top Proveedores</h3>
        </div>
        <div className="space-y-4">
          {topProviders.map(provider => <div key={provider.id} className="flex items-start space-x-3">
              <img src={provider.image} alt={provider.name} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-medium text-gray-800">{provider.name}</div>
                <div className="text-sm text-gray-500">{provider.service}</div>
                <div className="flex items-center text-sm">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-gray-700 ml-1">{provider.rating}</span>
                  <span className="text-gray-500 ml-1">
                    ({provider.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};