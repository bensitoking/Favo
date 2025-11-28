import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ServiceCard } from './ServiceCard';
import { ProfileCard } from './ProfileCard';

const API_URL = 'https://favo-iy6h.onrender.com';

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const [servicios, setServicios] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [ratings, setRatings] = useState<{ [key: number]: { promedio: number; cantidad: number } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        // Si hay término de búsqueda, buscar tanto servicios como usuarios
        if (q.trim()) {
          const [servRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/servicios?q=${encodeURIComponent(q)}`),
            fetch(`${API_URL}/usuarios/buscar?q=${encodeURIComponent(q)}`)
          ]);

          if (servRes.ok) {
            const servData = await servRes.json();
            setServicios(Array.isArray(servData) ? servData : []);
          }

          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setUsuarios(Array.isArray(usersData) ? usersData : []);

            // Obtener ratings para cada usuario
            if (usersData && Array.isArray(usersData)) {
              const ratingsData: { [key: number]: { promedio: number; cantidad: number } } = {};
              for (const user of usersData) {
                try {
                  const ratingRes = await fetch(`${API_URL}/ratings/promedio/${user.id_usuario}`);
                  if (ratingRes.ok) {
                    const ratingInfo = await ratingRes.json();
                    ratingsData[user.id_usuario] = ratingInfo;
                  }
                } catch (e) {
                  // ignore
                }
              }
              setRatings(ratingsData);
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error al buscar');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Buscando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Resultados de búsqueda</h1>
      <p className="text-gray-600 mb-8">
        {q ? `Resultados para "${q}" (${usuarios.length + servicios.length} resultados)` : 'Por favor, ingresa un término de búsqueda'}
      </p>

      {/* Usuarios */}
      {usuarios.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">👤 Profesionales ({usuarios.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuarios.map((usuario) => (
              <ProfileCard 
                key={usuario.id_usuario} 
                usuario={usuario}
                rating={ratings[usuario.id_usuario]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Servicios */}
      {servicios.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">🔧 Servicios ({servicios.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicios.map((servicio) => (
              <ServiceCard key={servicio.id_servicio} provider={servicio} />
            ))}
          </div>
        </div>
      )}

      {usuarios.length === 0 && servicios.length === 0 && q && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron resultados para "{q}"</p>
          <p className="text-gray-400 text-sm mt-2">Intenta con otras palabras o profesionales</p>
        </div>
      )}
    </div>
  );
};
