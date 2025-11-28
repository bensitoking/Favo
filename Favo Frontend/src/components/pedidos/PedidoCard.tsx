import React from 'react';
import { CalendarIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, MapPinIcon, MessageCircleIcon, XCircleIcon, CheckIcon } from 'lucide-react';

type Pedido = {
  id_pedidos: number;
  titulo: string;
  descripcion: string;
  precio?: number;
  id_categoria: number;
  categoria_nombre?: string;
  id_usuario: number;
  status: 'pendiente' | 'en_proceso' | 'completado';
  accepted_by?: number | null;
  accepted_at?: string | null;
  aceptado_por_nombre?: string;
};

const API_URL = "https://favo-iy6h.onrender.com";
const getToken = () => localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || localStorage.getItem('token') || '';

export function PedidoCard({ pedido }: { pedido: Pedido }) {
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [showContraoferta, setShowContraoferta] = React.useState(false);
  const [nuevoPrecio, setNuevoPrecio] = React.useState(pedido.precio?.toString() || '');
  const [comentario, setComentario] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const token = getToken();
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_URL}/users/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.id_usuario || null);
        }
      } catch (e) {
        console.error('Error fetching current user:', e);
      }
    };
    fetchCurrentUser();
  }, []);

  const statusInfo = (() => {
    switch (pedido.status) {
      case 'pendiente':
        return { icon: <AlertCircleIcon size={18} className="text-orange-500" />, text: 'Pendiente', color: 'text-orange-600' };
      case 'en_proceso':
        return { icon: <ClockIcon size={18} className="text-yellow-500" />, text: 'En proceso', color: 'text-yellow-600' };
      case 'completado':
        return { icon: <CheckCircleIcon size={18} className="text-green-500" />, text: 'Completado', color: 'text-green-600' };
      default:
        return { icon: <ClockIcon size={18} className="text-gray-500" />, text: 'Desconocido', color: 'text-gray-600' };
    }
  })();

  // El creador del pedido (id_usuario) o quien lo aceptó (accepted_by) pueden marcarlo como completado si está en proceso
  const canComplete = pedido.status === 'en_proceso' && currentUserId && (currentUserId === pedido.id_usuario || currentUserId === pedido.accepted_by);

  // Si el usuario es el dueño y está en_proceso, puede aceptar/rechazar/contraoferta
  const isOwner = currentUserId === pedido.id_usuario;
  const canRespond = isOwner && pedido.status === 'en_proceso' && pedido.accepted_by;

  const completar = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/pedidos/${pedido.id_pedidos}/completar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo completar');
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Error al completar el pedido');
    }
  };

  const aceptarOferta = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      // Crear notificación de aceptado
      const res = await fetch(`${API_URL}/notificaciones_respuestas/aceptado?id_pedido=${pedido.id_pedidos}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('No se pudo aceptar la oferta');
      alert('Oferta aceptada. Se notificó al proveedor.');
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Error al aceptar la oferta');
    } finally {
      setLoading(false);
    }
  };

  const rechazarOferta = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      // Crear notificación de rechazado y revertir pedido
      const res = await fetch(`${API_URL}/notificaciones_respuestas/rechazado?id_pedido=${pedido.id_pedidos}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('No se pudo rechazar la oferta');
      alert('Oferta rechazada. El pedido vuelve a estar pendiente.');
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Error al rechazar la oferta');
    } finally {
      setLoading(false);
    }
  };

  const enviarContraoferta = async () => {
    try {
      if (!nuevoPrecio || parseFloat(nuevoPrecio) <= 0) {
        alert('Ingresa un precio válido');
        return;
      }

      setLoading(true);
      const token = getToken();
      
      const params = new URLSearchParams({
        id_pedido: pedido.id_pedidos.toString(),
        precio_nuevo: nuevoPrecio,
        ...(comentario && { comentario })
      });
      
      const res = await fetch(`${API_URL}/notificaciones_respuestas/contraoferta?${params}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('No se pudo enviar la contraoferta');
      alert('Contraoferta enviada. Se notificó al proveedor.');
      setShowContraoferta(false);
      setNuevoPrecio('');
      setComentario('');
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Error al enviar contraoferta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{pedido.titulo}</h3>
        <div className="flex items-center gap-2">
          {statusInfo.icon}
          <span className={`${statusInfo.color} font-medium`}>{statusInfo.text}</span>
        </div>
      </div>

      <p className="text-gray-700 mb-3">{pedido.descripcion}</p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        {typeof pedido.precio === 'number' && (
          <div className="flex items-center gap-1">
            <span>💵</span>
            <span>${pedido.precio.toFixed(2)}</span>
          </div>
        )}
        {pedido.accepted_at && (
          <div className="flex items-center gap-1">
            <CalendarIcon size={16} />
            <span>Aceptado el {new Date(pedido.accepted_at).toLocaleString('es-AR')}</span>
          </div>
        )}
        {pedido.aceptado_por_nombre && (
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
            <span>✅</span>
            <span className="font-semibold text-green-700">Por: {pedido.aceptado_por_nombre}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <MapPinIcon size={16} />
          <span>Cat. {pedido.categoria_nombre || `${pedido.id_categoria}`}</span>
        </div>
      </div>

      {/* Botones de respuesta (solo visible para el dueño cuando en_proceso) */}
      {canRespond && (
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Responder a la oferta:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={aceptarOferta}
              disabled={loading}
              className="px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <CheckIcon size={16} />
              Aceptar
            </button>
            <button
              onClick={rechazarOferta}
              disabled={loading}
              className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              <XCircleIcon size={16} />
              Rechazar
            </button>
            <button
              onClick={() => setShowContraoferta(!showContraoferta)}
              disabled={loading}
              className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <MessageCircleIcon size={16} />
              Contraoferta
            </button>
          </div>

          {/* Form de contraoferta */}
          {showContraoferta && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo precio
                </label>
                <input
                  type="number"
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(e.target.value)}
                  placeholder={pedido.precio?.toString()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentario (opcional)
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Agrega un comentario sobre tu contraoferta..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={enviarContraoferta}
                  disabled={loading}
                  className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar contraoferta'}
                </button>
                <button
                  onClick={() => setShowContraoferta(false)}
                  disabled={loading}
                  className="px-3 py-2 text-sm rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {canComplete && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button onClick={completar} className="px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700">
            Marcar como completado
          </button>
        </div>
      )}
    </div>
  );
}
