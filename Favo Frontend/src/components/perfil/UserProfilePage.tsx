import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon, CalendarIcon, CheckCircleIcon, ArrowLeftIcon } from 'lucide-react';
import { RatingModal } from './RatingModal';

const API_URL = 'https://favo-iy6h.onrender.com';

type Usuario = {
  id_usuario: number;
  nombre?: string;
  descripcion?: string;
  foto_perfil?: string;
  verificado?: boolean;
  fecha_registro?: string;
  mail?: string;
};

type RatingInfo = {
  id: number;
  score: number;
  comment?: string;
  created_at: string;
  Usuario?: {
    id_usuario: number;
    nombre: string;
  };
};

export const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [ratings, setRatings] = useState<RatingInfo[]>([]);
  const [promedio, setPromedio] = useState({ promedio: 0, cantidad: 0 });
  const [miRating, setMiRating] = useState<RatingInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener usuario
        const userRes = await fetch(`${API_URL}/usuarios/${id}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setUsuario(userData);
        }

        // Obtener ratings del usuario
        const ratingsRes = await fetch(`${API_URL}/ratings/usuario/${id}`);
        if (ratingsRes.ok) {
          const ratingsData = await ratingsRes.json();
          setRatings(Array.isArray(ratingsData) ? ratingsData : []);
        }

        // Obtener promedio
        const promRes = await fetch(`${API_URL}/ratings/promedio/${id}`);
        if (promRes.ok) {
          const promData = await promRes.json();
          setPromedio(promData);
        }

        // Obtener usuario actual
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (token) {
          const meRes = await fetch(`${API_URL}/users/me/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            setCurrentUserId(meData.id_usuario);

            // Obtener mi rating a este usuario
            const myRatingRes = await fetch(`${API_URL}/ratings/mi-rating/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (myRatingRes.ok) {
              const myRatingData = await myRatingRes.json();
              if (myRatingData) setMiRating(myRatingData);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleSubmitRating = async (rating: number, comment?: string) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      throw new Error('No autenticado');
    }

    try {
      const res = await fetch(`${API_URL}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_usuario_rated: parseInt(id!),
          rating,
          comment: comment || null
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al enviar rating');
      }

      // Recargar datos
      const ratingsRes = await fetch(`${API_URL}/ratings/usuario/${id}`);
      if (ratingsRes.ok) {
        const ratingsData = await ratingsRes.json();
        setRatings(Array.isArray(ratingsData) ? ratingsData : []);
      }

      const promRes = await fetch(`${API_URL}/ratings/promedio/${id}`);
      if (promRes.ok) {
        const promData = await promRes.json();
        setPromedio(promData);
      }

      const myRatingRes = await fetch(`${API_URL}/ratings/mi-rating/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (myRatingRes.ok) {
        const myRatingData = await myRatingRes.json();
        if (myRatingData) setMiRating(myRatingData);
      }
    } catch (err: any) {
      throw new Error(err.message || 'Error al enviar rating');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Usuario no encontrado</p>
      </div>
    );
  }

  const canRate = currentUserId && currentUserId !== usuario.id_usuario;

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeftIcon size={20} />
        Volver
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-6">
          <img 
            src={usuario.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre || 'Usuario')}&background=fff&color=1f2937`}
            alt={usuario.nombre}
            className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{usuario.nombre || 'Usuario'}</h1>
                {usuario.verificado && (
                  <div className="flex items-center gap-1 text-green-600 mt-1">
                    <CheckCircleIcon size={16} />
                    <span className="text-sm">Verificado</span>
                  </div>
                )}
                {usuario.descripcion && (
                  <p className="text-sm text-gray-600 mt-2">{usuario.descripcion}</p>
                )}
                {usuario.fecha_registro && (
                  <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                    <CalendarIcon size={16} />
                    <span>Miembro desde {new Date(usuario.fecha_registro).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {canRate && (
                <button 
                  onClick={() => setRatingModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {miRating ? 'Editar calificación' : 'Calificar'}
                </button>
              )}
            </div>

            {/* Rating Summary */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon 
                      key={star}
                      size={18}
                      className={`${
                        star <= Math.round(promedio.promedio)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{promedio.promedio.toFixed(1)}</span>
              </div>
              <span className="text-gray-600">
                {promedio.cantidad === 0 ? 'Sin calificaciones' : `${promedio.cantidad} ${promedio.cantidad === 1 ? 'calificación' : 'calificaciones'}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Reseñas</h2>
        {ratings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Sin reseñas aún</p>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{rating.Usuario?.nombre || 'Anónimo'}</p>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon 
                          key={star}
                          size={14}
                          className={`${
                            star <= rating.score
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-gray-700 text-sm mt-2">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <RatingModal 
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={handleSubmitRating}
        userName={usuario.nombre || 'este usuario'}
      />
    </div>
  );
};
