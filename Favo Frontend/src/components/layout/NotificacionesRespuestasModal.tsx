import React, { useEffect, useState, useCallback } from "react";
import { CheckCircleIcon, XCircleIcon, MessageCircleIcon, AlertCircleIcon } from "lucide-react";

interface NotificacionRespuesta {
  id: number;
  id_pedido: number;
  tipo: 'aceptado' | 'rechazado' | 'contraoferta';
  titulo: string;
  descripcion: string;
  precio_anterior?: number;
  precio_nuevo?: number;
  comentario?: string;
  visto: boolean;
  created_at: string;
  nombre_usuario_origen?: string;
}

interface Props {
  onClose: () => void;
}

const API_BASE = "https://favo-iy6h.onrender.com";

export const NotificacionesRespuestasModal: React.FC<Props> = ({ onClose }) => {
  const [notificaciones, setNotificaciones] = useState<NotificacionRespuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (!token) {
        setError("No estás autenticado.");
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_BASE}/notificaciones_respuestas`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.status === 401) {
        setError("Sesión expirada. Inicia sesión nuevamente.");
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        setError(`Error ${res.status}: No se pudieron cargar las notificaciones`);
        return;
      }

      const data = await res.json();
      setNotificaciones(Array.isArray(data) ? data : []);

      // Marcar como visto
      if (Array.isArray(data)) {
        data.forEach(notif => {
          if (!notif.visto) {
            fetch(`${API_BASE}/notificaciones_respuestas/${notif.id}/visto`, {
              method: "PUT",
              headers: { "Authorization": `Bearer ${token}` }
            }).catch(e => console.error("Error marcando visto:", e));
          }
        });
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error al obtener notificaciones de respuestas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotificaciones();
  }, [fetchNotificaciones]);

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'aceptado':
        return <CheckCircleIcon size={20} className="text-green-500" />;
      case 'rechazado':
        return <XCircleIcon size={20} className="text-red-500" />;
      case 'contraoferta':
        return <MessageCircleIcon size={20} className="text-blue-500" />;
      default:
        return <AlertCircleIcon size={20} className="text-gray-500" />;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'aceptado':
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">Aceptado</span>;
      case 'rechazado':
        return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">Rechazado</span>;
      case 'contraoferta':
        return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">Contraoferta</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose}></div>

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-lg p-6 overflow-y-auto animate-slide-in-right">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Respuestas de Ofertas</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Cargando notificaciones...
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="font-semibold mb-2">⚠️ Error</div>
            <div>{error}</div>
            <button
              onClick={fetchNotificaciones}
              className="mt-3 text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Reintentar
            </button>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <div className="text-4xl mb-2">📨</div>
            <div>No tenés respuestas de ofertas</div>
            <div className="text-sm mt-1">Cuando recibas respuestas, aparecerán aquí.</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-500 mb-2">
              {notificaciones.length} respuesta{notificaciones.length !== 1 ? 's' : ''}
            </div>
            {notificaciones.map((notif) => (
              <div
                key={notif.id}
                className="bg-gray-50 rounded-lg p-4 flex flex-col gap-3 shadow border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getIconByTipo(notif.tipo)}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{notif.titulo}</div>
                      {notif.nombre_usuario_origen && (
                        <div className="text-xs text-gray-500">De: {notif.nombre_usuario_origen}</div>
                      )}
                    </div>
                  </div>
                  {getTipoBadge(notif.tipo)}
                </div>

                <div className="text-gray-700 text-sm">{notif.descripcion}</div>

                {notif.tipo === 'contraoferta' && (
                  <div className="bg-white border-l-4 border-blue-500 p-3 rounded space-y-2">
                    <div className="text-sm font-semibold text-blue-900">Nueva propuesta:</div>
                    {notif.precio_anterior && notif.precio_nuevo && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Precio anterior:</span>
                        <span className="line-through text-gray-500">${notif.precio_anterior.toFixed(2)}</span>
                        <span className="text-sm font-semibold text-blue-600">→ ${notif.precio_nuevo.toFixed(2)}</span>
                      </div>
                    )}
                    {notif.comentario && (
                      <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded mt-2">
                        <strong>Comentario:</strong> {notif.comentario}
                      </div>
                    )}
                  </div>
                )}

                {notif.created_at && (
                  <div className="text-xs text-gray-400">
                    📅 {new Date(notif.created_at).toLocaleDateString('es-AR')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slide-in-right {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
