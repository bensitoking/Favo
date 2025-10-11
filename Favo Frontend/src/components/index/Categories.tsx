import React, { useState, useEffect } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = "http://localhost:8000";

type CategoryItem = {
  id: number;
  name: string;
  count: string;
  color: string;
}

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/categorias`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const enrichedCategories: CategoryItem[] = (data || []).map((category: any) => ({
          id: category.id_categoria,
          name: category.nombre,
          count: `${category.count} pedidos`,
          color: getCategoryColor(category.id_categoria)
        }));
        
        setCategories(enrichedCategories);
      } catch (err: unknown) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryColor = (id: number) => {
    const colors = [
      'bg-blue-50 hover:bg-blue-100',
      'bg-orange-50 hover:bg-orange-100',
      'bg-purple-50 hover:bg-purple-100',
      'bg-green-50 hover:bg-green-100',
      'bg-red-50 hover:bg-red-100',
      'bg-yellow-50 hover:bg-yellow-100'
    ];
    return colors[id % colors.length];
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center text-red-500">
          Error al cargar las categorías: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Categorías populares
          </h2>
          <Link to="/categorias" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors">
            Ver todas <ChevronRightIcon size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id}
              className={`${category.color} rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
            >
              <div className="flex flex-col items-center text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <span className="text-sm text-gray-500">{category.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};