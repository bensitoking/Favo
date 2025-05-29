import React from 'react';
import { LaptopIcon, WrenchIcon, GraduationCapIcon, HeartIcon } from 'lucide-react';
export const Categories = () => {
  const categories = [{
    icon: <LaptopIcon size={32} className="text-[#1a365d]" />,
    name: 'Tecnología',
    count: '234 servicios',
    color: 'bg-blue-50'
  }, {
    icon: <WrenchIcon size={32} className="text-orange-500" />,
    name: 'Hogar',
    count: '186 servicios',
    color: 'bg-orange-50'
  }, {
    icon: <GraduationCapIcon size={32} className="text-[#1a365d]" />,
    name: 'Educación',
    count: '158 servicios',
    color: 'bg-blue-50'
  }, {
    icon: <HeartIcon size={32} className="text-orange-500" />,
    name: 'Salud',
    count: '142 servicios',
    color: 'bg-orange-50'
  }];
  return <section className="py-12 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-[#1a365d] mb-8">
          Categorías populares
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => <div key={index} className={`${category.color} rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{category.icon}</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {category.name}
                </h3>
                <span className="text-sm text-gray-500">{category.count}</span>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};