import React, { useEffect, useState, useCallback } from "react";

interface Notificacion {
  id: number;
  titulo: string;
  desc: string;
  precio: number;
  ubicacion: string;
  id_usuario: number;
  created_at?: string;
}

interface Props {
  onAceptar: (id: number) => void;
  onRechazar: (id: number) => void;
  onMensaje: (id: number) => void;
  onClose: () => void;
}

const API_BASE = "http://localhost:8000";

export const NotificacionesModal: React.FC<Props> = ({
  onAceptar,
  onRechazar,
  onMensaje,
  onClose,
}) => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  // Eliminación permanente: no se necesita estado local de eliminadas
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificaciones = useCallback(async () => {
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
      const res = await fetch(`${API_BASE}/notificaciones_servicios`, {
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
  setNotificaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Fallo de conexión. Verificá tu conexión a internet.");
      setNotificaciones([]);
      console.error("Error al obtener notificaciones:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
                {n.created_at && (
                  <div className="text-xs text-gray-400">
                    📅 {new Date(n.created_at).toLocaleDateString()}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onAceptar(n.id)}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors"
                    title="Aceptar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={async () => {
                      // Eliminar notificación al tocar la X
                      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
                      if (!token) return;
                      await fetch(`${API_BASE}/notificaciones_servicios/${n.id}`, {
                        method: "DELETE",
                        headers: {
                          "Authorization": `Bearer ${token}`,
                          "Content-Type": "application/json"
                        }
                      });
                      setNotificaciones(notificaciones.filter(notif => notif.id !== n.id));
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                    title="Eliminar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onMensaje(n.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors"
                    title="Enviar mensaje"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
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