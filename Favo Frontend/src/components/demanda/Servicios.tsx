import React, { useState, useEffect } from "react";
import { TrendingColumn } from "./TrendingColumn";
import { ContratarForm } from "./ContratarForm";
import { NuevoServicioModal } from "./NuevoServicioModal";
import { useSearchParams } from "react-router-dom";

const API_URL =  "https://favo-iy6h.onrender.com";

export const Servicios = () => {
  const [modalContratar, setModalContratar] = useState<{ open: boolean, servicioId?: number, destinatarioId?: number } | null>(null);
  type Servicio = {
    id_servicio: number;
    titulo: string;
    descripcion: string;
    id_usuario: number;
    Usuario?: {
      nombre: string;
    };
  };
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    const fetchServicios = async () => {

      try {
        setLoading(true);
        const url = searchQuery 
          ? `${API_URL}/servicios?q=${encodeURIComponent(searchQuery)}`
          : `${API_URL}/servicios`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setServicios(data);
      } catch (error) {
        console.error("Error fetching servicios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, [searchQuery]);
  const handleServicioCreado = async () => {
    setModalAbierto(false);
    try {
      const response = await fetch(`${API_URL}/servicios`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error("Error refreshing servicios:", error);
    }
  };



  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {searchQuery ? `Resultados para: "${searchQuery}"` : "Todos los servicios"}
                </h2>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="animate-pulse space-y-3">
                          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                          <div className="flex justify-between mt-4">
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : servicios.length === 0 ? (
                  <p className="text-gray-500">No se encontraron servicios{searchQuery ? ` que coincidan con "${searchQuery}"` : ""}.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servicios.map((servicio) => (
                      <div key={servicio.id_servicio} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-lg">{servicio.titulo}</h3>
                        <p className="text-gray-600 text-sm mt-2">{servicio.descripcion}</p>
                        {/* Aquí puedes agregar más detalles como ubicación, tiempo, pago, etc. */}
                        <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-500">Publicado por: {servicio.Usuario?.nombre || "Desconocido"}</span>
                          <div className="flex gap-2">
                            <button className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition-colors">
                              Contactar
                            </button>
                            <button
                              className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors"
                              onClick={() => setModalContratar({ open: true, servicioId: servicio.id_servicio, destinatarioId: servicio.id_usuario })}
                            >
                              Contratar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-1">
              <TrendingColumn apiUrl={API_URL} />
            </div>
          </div>
        </div>
      </main>

      
      <ContratarForm
        open={!!modalContratar?.open}
        onClose={() => setModalContratar(null)}
        servicioId={modalContratar?.servicioId || 0}
        destinatarioId={modalContratar?.destinatarioId || 0}
      />

<button
        onClick={() => setModalAbierto(true)}
        className="fixed bottom-6 right-6 bg-[#1D4ED8] hover:bg-blue-800 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
        aria-label="Añadir nuevo servicio"
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

      <NuevoServicioModal 
        isOpen={modalAbierto} 
        onClose={handleServicioCreado} 
        apiUrl={API_URL}
      />
    </div>
  );
};