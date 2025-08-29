import React, { useState } from "react";

interface ContratarFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  servicioId: number;
  destinatarioId: number;
}

const API_BASE = "http://localhost:8000";

export const ContratarForm: React.FC<ContratarFormProps> = ({ open, onClose, onSuccess, servicioId, destinatarioId }) => {
  const [titulo, setTitulo] = useState("");
  const [desc, setDesc] = useState("");
  const [precio, setPrecio] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [remoto, setRemoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/notificaciones_servicios`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          titulo,
          desc,
          precio: Number(precio),
          ubicacion: remoto ? "Remoto" : ubicacion,
          id_servicio: servicioId,
          id_usuario: destinatarioId
        })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Error al enviar la solicitud");
        setLoading(false);
        return;
      }
      setTitulo("");
      setDesc("");
      setPrecio("");
      setUbicacion("");
      setRemoto(false);
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError("Fallo de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl relative animate-fade-in">
        <button onClick={onClose} className="absolute top-5 right-6 text-2xl text-gray-400 hover:text-gray-700">×</button>
        <h2 className="text-2xl font-bold mb-6">Enviar Solicitud</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-1">Título profesional</label>
            <input
              className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Ej: Desarrollador frontend"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Descripción del pedido</label>
            <textarea
              className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Ej: Desarrollador frontend con experiencia en React para proyecto freelance"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              required
              rows={4}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Precio</label>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">$</span>
              <input
                className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="25"
                type="number"
                min="0"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Ubicación</label>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">4cd</span>
              <input
                className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Ej: Palermo, Buenos Aires"
                value={ubicacion}
                onChange={e => setUbicacion(e.target.value)}
                disabled={remoto}
                required={!remoto}
              />
            </div>
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                checked={remoto}
                onChange={e => setRemoto(e.target.checked)}
                id="remoto"
                className="mr-2"
              />
              <label htmlFor="remoto" className="text-gray-600 text-sm">Trabajo remoto</label>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded-lg">{error}</div>}
          <div className="flex justify-end gap-3 pt-4 border-t mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800" disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .animate-fade-in { animation: fade-in 0.2s; }
        @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};
