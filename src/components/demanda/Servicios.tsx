import React, { useState, useEffect } from "react";
import { RecentRequests } from "./RecentRequests";
import { TrendingColumn } from "./TrendingColumn";
import { NuevoServicioModal } from "./NuevoServicioModal";
import { supabase } from "./supabaseClient"; 
import { useSearchParams } from "react-router-dom";

export const Servicios = () => {
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Mostrar siempre el título, no solo cuando hay búsqueda */}
          <h2 className="text-2xl font-bold mb-4">
            {searchQuery ? `Resultados para: "${searchQuery}"` : "Todos los servicios"}
          </h2>
          
          {loading ? (
            <p>Cargando servicios...</p>
          ) : servicios.length === 0 ? (
            <p>No se encontraron servicios{searchQuery ? ` que coincidan con "${searchQuery}"` : ""}.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map((servicio) => (
                <div key={servicio.id_servicio} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">{servicio.titulo}</h3>
                  <p className="text-gray-600 mb-4">{servicio.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">ID: {servicio.id_servicio}</span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                      Contactar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};