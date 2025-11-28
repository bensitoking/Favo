import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const API_URL = "https://favo-iy6h.onrender.com";

type Pedido = {
  id_pedidos: number;
  titulo: string;
  descripcion: string;
  precio?: number;
  id_usuario: number;
  id_categoria: number;
  Usuario?: { nombre: string };
};

export default function PedidoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const statePedido = (location.state as any)?.pedido as Pedido | undefined;
  const [pedido, setPedido] = useState<Pedido | null>(statePedido || null);
  const [loading, setLoading] = useState(!statePedido);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (pedido || !id) return;
    let mounted = true;
    const fetchPedido = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/pedidos/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setPedido(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al cargar pedido");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPedido();
    // fetch current user id to validate ownership
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (!token) return;
        const res = await fetch(`${API_URL}/users/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setCurrentUserId(data.id_usuario);
      } catch (e) {
        console.error('Could not fetch current user', e);
      }
    };
    fetchMe();
    return () => { mounted = false; };
  }, [id, pedido]);

  const handleReject = () => {
    navigate(-1);
  };

  const handleAccept = async () => {
    if (!pedido) return;
    setError(null);
    
    // Validar que no sea el dueño del pedido
    if (currentUserId && currentUserId === pedido.id_usuario) {
      setError("No puedes aceptar tu propio pedido.");
      return;
    }
    
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (!token) throw new Error("No autenticado");

      // Aceptar el pedido usando el endpoint correcto
      const resAccept = await fetch(`${API_URL}/pedidos/${pedido.id_pedidos}/aceptar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resAccept.ok) {
        const err = await resAccept.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resAccept.status}`);
      }

      // Navigate back to the category page if we have the category id
      if (pedido.id_categoria) {
        navigate(`/categorias/${pedido.id_categoria}`);
      } else {
        // fallback: go back one step or to home
        try {
          navigate(-1);
        } catch {
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al aceptar pedido");
    }
  };

  if (loading) return <div className="container mx-auto p-6">Cargando pedido...</div>;
  if (error) return <div className="container mx-auto p-6 text-red-600">{error}</div>;
  if (!pedido) return <div className="container mx-auto p-6">Pedido no encontrado.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-semibold">{pedido.titulo}</h1>
        <p className="text-gray-700 mt-3">{pedido.descripcion}</p>
        {pedido.precio !== undefined && (
          <div className="mt-4 font-medium">Precio: ${pedido.precio}</div>
        )}
        <div className="mt-6 flex gap-3">
          <button 
            onClick={handleAccept} 
            disabled={currentUserId !== null && currentUserId === pedido.id_usuario}
            className={`px-6 py-2 rounded transition-colors ${
              currentUserId !== null && currentUserId === pedido.id_usuario
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}
          >
            Aceptar
          </button>
          <button onClick={handleReject} className="px-4 py-2 border rounded">Rechazar</button>
        </div>
        {currentUserId !== null && currentUserId === pedido.id_usuario && (
          <div className="mt-3 text-sm text-red-600">No puedes aceptar tu propio pedido.</div>
        )}
      </div>
    </div>
  );
}
