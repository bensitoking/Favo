import React, { useEffect, useState, useCallback } from "react";

interface Notificacion {
  id: number;
  titulo: string;
  desc: string;
  precio: number;
  ubicacion: string;
  id_usuario: number;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificaciones = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
     const token =
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token");

if (!token) {
  console.error("No hay token ni en localStorage ni en sessionStorage");
  setLoading(false);
  return;
}


      const res = await fetch("http://localhost:8000/notificaciones_servicios", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});


      if (res.status === 401) {
        setError("Sesión expirada o inválida (401). Iniciá sesión nuevamente.");
        setNotificaciones([]);
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        setError(`Error al obtener notificaciones (${res.status}): ${txt}`);
        setNotificaciones([]);
        return;
      }

      const data: Notificacion[] = await res.json();
      setNotificaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Fallo de red al obtener notificaciones.");
      setNotificaciones([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Trae notificaciones al montar el modal
    fetchNotificaciones();
  }, [fetchNotificaciones]);

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
              onClick={fetchNotificaciones}
              className="text-sm px-3 py-1 rounded-md border hover:bg-gray-50"
              title="Refrescar"
            >
              Refrescar
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl">
              ×
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500 text-center">Cargando...</div>
        ) : error ? (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded">
            {error}
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="text-gray-500 text-center">No hay notificaciones</div>
        ) : (
          <div className="space-y-4">
            {notificaciones.map((n) => (
              <div
                key={n.id}
                className="bg-gray-50 rounded-lg p-4 flex flex-col gap-2 shadow"
              >
                <div className="font-semibold text-blue-800">{n.titulo}</div>
                <div className="text-gray-700 text-sm">{n.desc}</div>
                <div className="text-xs text-gray-500">
                  Ubicación: {n.ubicacion} | Precio: ${n.precio}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onAceptar(n.id)}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                    title="Aceptar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onRechazar(n.id)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                    title="Rechazar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onMensaje(n.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                    title="Mensaje"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                      />
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
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
