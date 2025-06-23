import React from "react";

export const NuevoServicioModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Añadir nuevo servicio</h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium">Rubro</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="¿Qué hace?"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Ubicación</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="¿Dónde lo hace?"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Descripción</label>
            <textarea
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="¿Cómo lo hace?"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
