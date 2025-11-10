import React from 'react';
import { CalendarIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, MapPinIcon } from 'lucide-react';

type Pedido = {
  id_pedidos: number;
  titulo: string;
  descripcion: string;
  precio?: number;
  id_categoria: number;
  id_usuario: number;
  status: 'pendiente' | 'en_proceso' | 'completado';
  accepted_by?: number | null;
  accepted_at?: string | null;
};

const API_URL = "https://favo-iy6h.onrender.com";
const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';

export function PedidoCard({ pedido }: { pedido: Pedido }) {
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

  const canComplete = pedido.status === 'en_proceso';

  const completar = async () => {
    try {
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
        <div className="flex items-center gap-1">
          <MapPinIcon size={16} />
          <span>Cat. {pedido.id_categoria}</span>
        </div>
      </div>

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
