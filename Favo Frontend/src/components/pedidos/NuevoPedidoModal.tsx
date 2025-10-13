import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  id_categoria: number;
}

const NuevoPedidoModal: React.FC<Props> = ({ isOpen, onClose, apiUrl, id_categoria }) => {
  const [form, setForm] = useState({ titulo: "", descripcion: "", precio: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const body = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        precio: form.precio ? Number(form.precio) : undefined,
        id_categoria,
      };
      const res = await fetch(`${apiUrl}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al crear pedido");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Nuevo pedido</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm mb-1">Título</label>
            <input name="titulo" value={form.titulo} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="mb-3">
            <label className="block text-sm mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="mb-3">
            <label className="block text-sm mb-1">Precio (opcional)</label>
            <input name="precio" value={form.precio} onChange={handleChange} type="number" step="0.01" className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 border rounded">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">{submitting ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoPedidoModal;
