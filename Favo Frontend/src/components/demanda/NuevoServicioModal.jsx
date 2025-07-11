import React, { useState, useEffect } from "react";

export const NuevoServicioModal = ({ isOpen, onClose, apiUrl }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    id_categoria: 1,
    id_usuario: 1 // You may want to get this from auth context
  });
  const [categorias, setCategorias] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchCategorias = async () => {
        try {
          setLoadingCategorias(true);
          const response = await fetch(`${apiUrl}/categorias/simple`);
          
          if (!response.ok) {
            throw new Error("Error al cargar categorías");
          }
          
          const data = await response.json();
          setCategorias(data);
          
          // Set default category if available
          if (data.length > 0) {
            setFormData(prev => ({
              ...prev,
              id_categoria: data[0].id_categoria
            }));
          }
        } catch (err) {
          console.error("Error fetching categories:", err);
          setError("Error al cargar las categorías");
        } finally {
          setLoadingCategorias(false);
        }
      };

      fetchCategorias();
    }
  }, [isOpen, apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${apiUrl}/servicios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar el servicio');
      }

      const data = await response.json();
      console.log('Servicio creado:', data);
      setSuccess(true);
      
      // Reset form
      setFormData({
        titulo: "",
        descripcion: "",
        id_categoria: categorias.length > 0 ? categorias[0].id_categoria : 1,
        id_usuario: 1
      });

      setTimeout(() => {
        onClose(); // Close modal and trigger parent refresh
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error al crear servicio:', err);
      setError(err.message || 'Error al guardar el servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Añadir nuevo servicio</h2>
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
            ¡Servicio creado exitosamente!
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
              Rubro
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="¿Qué servicio ofrece?"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describa su servicio en detalle..."
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="id_categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            {loadingCategorias ? (
              <div className="animate-pulse py-2 bg-gray-200 rounded"></div>
            ) : (
              <select
                id="id_categoria"
                name="id_categoria"
                value={formData.id_categoria}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                {categorias.map(categoria => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting || loadingCategorias}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Guardando...</span>
                  <svg className="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </>
              ) : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};