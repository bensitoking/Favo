import React, { useState } from 'react';
import { StarIcon, X } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => Promise<void>;
  userName: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit, userName }) => {
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(rating);
      setRating(5);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al enviar rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Calificar a {userName}</h2>
          <button 
            onClick={onClose} 
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Calificación</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none transition"
              >
                <StarIcon 
                  size={32} 
                  className={`${
                    star <= rating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  } hover:text-yellow-400`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">{rating} de 5 estrellas</p>
        </div>

        <div className="flex gap-2 justify-end">
          <button 
            onClick={onClose} 
            disabled={submitting}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};
