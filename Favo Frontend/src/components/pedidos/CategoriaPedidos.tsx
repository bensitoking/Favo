import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import NuevoPedidoModal from "./NuevoPedidoModal";

const API_URL = "https://favo-iy6h.onrender.com";

type Pedido = {
  id_pedidos: number;
  titulo: string;
  descripcion: string;
  precio?: number;
  id_usuario: number;
  Usuario?: { nombre: string };
};

export default function CategoriaPedidos() {
  const { id } = useParams();
  const id_categoria = Number(id || 0);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openNuevo, setOpenNuevo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/pedidos?id_categoria=${id_categoria}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setPedidos(data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al cargar pedidos");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id_categoria > 0) fetchPedidos();
    return () => {
      mounted = false;
    };
  }, [id_categoria]);

  const handleCreado = async () => {
    setOpenNuevo(false);
    // refresh
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pedidos?id_categoria=${id_categoria}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setPedidos(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pedidos en la categoría</h1>
        <button
          onClick={() => setOpenNuevo(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Añadir pedido
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-6">Cargando pedidos...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : pedidos.length === 0 ? (
          <div className="text-gray-600">No hay pedidos en esta categoría.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pedidos.map((p) => (
              <div key={p.id_pedidos} className="border rounded p-4 hover:shadow">
                <h3 className="font-semibold">{p.titulo}</h3>
                <p className="text-sm text-gray-600 mt-2">{p.descripcion}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500">Publicado por: {p.Usuario?.nombre || 'Desconocido'}</span>
                  <div className="flex items-center gap-2">
                    {p.precio !== undefined && <span className="text-sm font-medium">${p.precio}</span>}
                    <button
                      onClick={() => navigate(`/pedido/${p.id_pedidos}`, { state: { pedido: p } })}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Ver propuesta
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NuevoPedidoModal
        isOpen={openNuevo}
        onClose={handleCreado}
        apiUrl={API_URL}
        id_categoria={id_categoria}
      />
    </div>
  );
}
