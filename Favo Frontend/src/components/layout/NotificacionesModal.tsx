import React, { useEffect, useState, useCallback } from "react";

interface Notificacion {
  id: number;
  titulo: string;
  desc: string;
  precio: number;
  ubicacion: string;
  id_usuario: number;
  created_at?: string;
  accepted_by?: number | null;
  accepted_at?: string | null;
  aceptado_por_nombre?: string;
  source?: 'servicio' | 'pedido';
}

interface Props {

  notificaciones?: Notificacion[];
  onAceptar?: (id: number) => void;
  onRechazar?: (id: number) => void;
  onMensaje?: (id: number) => void;
  onClose: () => void;
}

const API_BASE = "https://favo-iy6h.onrender.com";

export const NotificacionesModal: React.FC<Props> = (props: Props) => {
  const { onClose } = props;
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  // Eliminación permanente: no se necesita estado local de eliminadas
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchNotificaciones = useCallback(async () => {
    // Always combine service notifications (if parent provided) with pedidos fetched
    setLoading(true);
    setError(null);
    // Start with parent notifications (service-mode) if present
    const combined: Notificacion[] = [];
    if (props.notificaciones !== undefined) {
      combined.push(...(props.notificaciones || []).map(n => ({ ...n, source: 'servicio' as const })));
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        setLoading(false);
        window.location.href = "/login";
        return;
      }
      // Verificar si el token es válido y no está expirado
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          localStorage.removeItem("access_token");
          sessionStorage.removeItem("access_token");
          setLoading(false);
          window.location.href = "/login";
          return;
        }
      } catch (e) {
        setError("Token inválido. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        setLoading(false);
        window.location.href = "/login";
        return;
      }
      const res = await fetch(`${API_BASE}/notificaciones_pedidos`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.status === 401) {
        setError("Sesión expirada o inválida. Iniciá sesión nuevamente.");
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        setNotificaciones([]);
        window.location.href = "/login";
        return;
      }
      if (res.status === 404) {
        setError("Servicio de notificaciones no disponible temporalmente.");
        setNotificaciones([]);
        return;
      }
      if (res.status === 500) {
        setError("Error interno del servidor. Por favor, intentá más tarde.");
        setNotificaciones([]);
        return;
      }
      if (!res.ok) {
        try {
          const errorData = await res.json();
          setError(`Error (${res.status}): ${errorData.detail || 'Error desconocido'}`);
        } catch {
          setError(`Error (${res.status}): No se pudo obtener información del error`);
        }
        setNotificaciones([]);
        return;
      }
  const data: Notificacion[] = await res.json();
  const pedidos: Notificacion[] = Array.isArray(data) ? data.map(n => ({ ...n, source: 'pedido' })) : [];
  // combine parent-provided service notifications (already in combined) with pedidos
  const all = [...combined, ...pedidos];
  // sort by id desc if present to show newest first
  all.sort((a, b) => (b.id || 0) - (a.id || 0));
  setNotificaciones(all);
    } catch (err) {
      setError("Fallo de conexión. Verificá tu conexión a internet.");
      setNotificaciones([]);
      console.error("Error al obtener notificaciones:", err);
    } finally {
      setLoading(false);
    }
  }, [props.notificaciones]);

  useEffect(() => {
    fetchNotificaciones();
  }, [fetchNotificaciones]);

  const handleRefrescar = () => {
    fetchNotificaciones();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose}></div>

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-lg p-6 overflow-y-auto animate-slide-in-right">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Notificaciones</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefrescar}
              className="text-sm px-3 py-1 rounded-md border hover:bg-gray-50 transition-colors"
              title="Refrescar"
              disabled={loading}
            >
              {loading ? "..." : "Refrescar"}
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-red-500 text-2xl transition-colors"
            >
              ×
            </button>
          </div>
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
              onClick={handleRefrescar}
              className="mt-3 text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <div className="text-4xl mb-2">📧</div>
            <div>No tenés notificaciones</div>
            <div className="text-sm mt-1">Cuando tengas nuevas notificaciones, aparecerán aquí.</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-500 mb-2">
              {notificaciones.length} notificacion{notificaciones.length !== 1 ? 'es' : ''}
            </div>
            {notificaciones.map((n) => (
              <div
                key={n.id}
                className="bg-gray-50 rounded-lg p-4 flex flex-col gap-2 shadow border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <div className="font-semibold text-blue-800 text-lg">{n.titulo}</div>
                <div className="text-gray-700 text-sm">{n.desc}</div>
                <div className="text-xs text-gray-500">
                  📍 {n.ubicacion} | 💰 ${n.precio.toLocaleString()}
                </div>
                {n.aceptado_por_nombre && (
                  <div className="text-xs text-green-600 font-semibold">
                    ✅ Aceptado por: {n.aceptado_por_nombre}
                  </div>
                )}
                {n.created_at && (
                  <div className="text-xs text-gray-400">
                    📅 {new Date(n.created_at).toLocaleDateString()}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  {/* SOLO PARA NOTIFICACIONES DE SERVICIO */}
                  {n.source === 'servicio' ? (
                    <>
                      {/* ACEPTAR */}
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
                            if (!token) { window.location.href = '/login'; return; }
                            const res = await fetch(`${API_BASE}/notificaciones_respuestas/aceptado?id_notif_servicio=${n.id}`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                              alert('Oferta aceptada');
                              setNotificaciones(prev => prev.filter(x => x.id !== n.id));
                            } else {
                              const err = await res.json();
                              alert(`Error: ${err.detail}`);
                            }
                          } catch (err) { 
                            console.error(err);
                            alert('Error');
                          }
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded p-2 transition-colors text-sm"
                      >
                        ✓ Aceptar
                      </button>
                      
                      {/* RECHAZAR */}
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
                            if (!token) { window.location.href = '/login'; return; }
                            const res = await fetch(`${API_BASE}/notificaciones_respuestas/rechazado?id_notif_servicio=${n.id}`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                              alert('Oferta rechazada');
                              setNotificaciones(prev => prev.filter(x => x.id !== n.id));
                            } else {
                              const err = await res.json();
                              alert(`Error: ${err.detail}`);
                            }
                          } catch (err) { 
                            console.error(err);
                            alert('Error');
                          }
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded p-2 transition-colors text-sm"
                      >
                        ✗ Rechazar
                      </button>
                      
                      {/* CONTRAOFERTA */}
                      <button
                        onClick={() => props.onMensaje && props.onMensaje(n.id)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded p-2 transition-colors text-sm"
                      >
                        💬 Contraoferta
                      </button>
                    </>
                  ) : (
                    // For pedido notifications: only show checkmark to delete/ack
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
                          if (!token) { window.location.href = '/login'; return; }
                          const res = await fetch(`${API_BASE}/notificaciones_pedidos/${n.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (res.ok) {
                            setNotificaciones(prev => prev.filter(x => x.id !== n.id));
                          }
                        } catch (err) { console.error(err); }
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded p-2 transition-colors text-sm"
                    >
                      ✓ Aceptar
                    </button>
                  )}
                </div>
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