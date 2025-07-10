import React, { useState, useEffect } from "react";
import { RecentRequests } from "./RecentRequests";
import { TrendingColumn } from "./TrendingColumn";
import { NuevoServicioModal } from "./NuevoServicioModal";
import { supabase } from "./supabaseClient";
import { useSearchParams } from "react-router-dom";

export const Servicios = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('Servicio')
          .select('*')
          .order('id_servicio', { ascending: false });

        if (searchQuery.trim()) {
          query = query.or(
            `titulo.ilike.%${searchQuery}%,descripcion.ilike.%${searchQuery}%`
          );
        }

        const { data, error } = await query;

        if (error) throw error;

        setServicios(data || []);
      } catch (error) {
        console.error("Error fetching servicios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, [searchQuery]);

  // Función para refrescar los servicios después de crear uno nuevo
  const handleServicioCreado = () => {
    setModalAbierto(false);
    // Forzar recarga de servicios
    const fetchServicios = async () => {
      const { data } = await supabase
        .from('Servicio')
        .select('*')
        .order('id_servicio', { ascending: false });
      setServicios(data || []);
    };
    fetchServicios();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="container mx-auto px-4">
          {/* Sección principal con las dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
            <div className="lg:col-span-2">
              {/* Sección de resultados de búsqueda o todos los servicios */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {searchQuery ? `Resultados para: "${searchQuery}"` : "Todos los servicios"}
                </h2>
                
                {loading ? (
                  <p>Cargando servicios...</p>
                ) : servicios.length === 0 ? (
                  <p>No se encontraron servicios{searchQuery ? ` que coincidan con "${searchQuery}"` : ""}.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servicios.map((servicio) => (
                      <div key={servicio.id_servicio} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-lg">{servicio.titulo}</h3>
                        <p className="text-gray-600 text-sm mt-2">{servicio.descripcion}</p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs text-gray-500">ID: {servicio.id_servicio}</span>
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                            Contactar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Componente RecentRequests */}
              <RecentRequests />
            </div>
            
            {/* TrendingColumn */}
            <div className="lg:col-span-1">
              <TrendingColumn />
            </div>
          </div>
        </div>
      </main>

      {/* Botón flotante para nuevo servicio */}
      <button
        onClick={() => setModalAbierto(true)}
        className="fixed bottom-6 right-6 bg-[#1D4ED8] hover:bg-blue-800 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal de nuevo servicio */}
      <NuevoServicioModal 
        isOpen={modalAbierto} 
        onClose={handleServicioCreado} 
      />
    </div>
  );
};