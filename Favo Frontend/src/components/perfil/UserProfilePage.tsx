import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon, CalendarIcon, CheckCircleIcon, ArrowLeftIcon, MapPinIcon, BriefcaseIcon, ShoppingBagIcon } from 'lucide-react';
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
  id_ubicacion?: number;
  esProvedor?: boolean;
  esDemanda?: boolean;
  Ubicacion?: {
    provincia?: string;
    barrio_zona?: string;
    calle?: string;
    altura?: number;
    piso?: number;
  };
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

type Servicio = {
  id_servicio: number;
  titulo: string;
  precio: number;
  descripcion?: string;
  created_at: string;
};

type Pedido = {
  id_pedidos: number;
  titulo: string;
  precio: number;
  descripcion?: string;
  fecha?: string;
  created_at: string;
  estado?: string;
};

export const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [ratings, setRatings] = useState<RatingInfo[]>([]);
  const [promedio, setPromedio] = useState({ promedio: 0, cantidad: 0 });
  const [miRating, setMiRating] = useState<RatingInfo | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
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

        // Obtener servicios del usuario
        const servRes = await fetch(`${API_URL}/servicios`);
        if (servRes.ok) {
          const servData = await servRes.json();
          const userServices = Array.isArray(servData)
            ? servData.filter((s: any) => s.id_usuario === parseInt(id!))
            : [];
          setServicios(userServices);
        }

        // Obtener pedidos del usuario
        const pedRes = await fetch(`${API_URL}/pedidos`);
        if (pedRes.ok) {
          const pedData = await pedRes.json();
          const userPedidos = Array.isArray(pedData)
            ? pedData.filter((p: any) => p.id_usuario === parseInt(id!))
            : [];
          setPedidos(userPedidos);
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

      return; // Éxito, no lanzar error
    } catch (err: any) {
      console.error('Error:', err);
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

      {/* Encabezado del Perfil */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-6">
          <img 
            src={usuario.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre || 'Usuario')}&background=fff&color=1f2937`}
            alt={usuario.nombre}
            className="w-40 h-40 rounded-full border-4 border-white shadow-md object-cover"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{usuario.nombre || 'Usuario'}</h1>
                {usuario.verificado && (
                  <div className="flex items-center gap-1 text-green-600 mt-2">
                    <CheckCircleIcon size={18} />
                    <span className="text-sm font-medium">Verificado</span>
                  </div>
                )}
                
                {/* Ubicación */}
                {usuario.Ubicacion && (
                  <div className="flex items-start gap-2 mt-3 text-gray-700">
                    <MapPinIcon size={18} className="flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      {usuario.Ubicacion.calle && <p>{usuario.Ubicacion.calle} {usuario.Ubicacion.altura}</p>}
                      {usuario.Ubicacion.piso && <p>Piso {usuario.Ubicacion.piso}</p>}
                      {usuario.Ubicacion.barrio_zona && <p>{usuario.Ubicacion.barrio_zona}</p>}
                      {usuario.Ubicacion.provincia && <p>{usuario.Ubicacion.provincia}</p>}
                    </div>
                  </div>
                )}

                {usuario.descripcion && (
                  <p className="text-gray-600 mt-3 max-w-lg">{usuario.descripcion}</p>
                )}

                {usuario.fecha_registro && (
                  <div className="flex items-center gap-2 mt-3 text-gray-600 text-sm">
                    <CalendarIcon size={16} />
                    <span>Miembro desde {new Date(usuario.fecha_registro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</span>
                  </div>
                )}
              </div>
              {canRate && (
                <button 
                  onClick={() => setRatingModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  {miRating ? 'Editar calificación' : 'Calificar'}
                </button>
              )}
            </div>

            {/* Rating Summary */}
            <div className="mt-6 flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon 
                        key={star}
                        size={20}
                        className={`${
                          star <= Math.round(promedio.promedio)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-lg">{promedio.promedio.toFixed(1)}</span>
                </div>
                <span className="text-gray-600 text-sm">
                  {promedio.cantidad === 0 ? 'Sin calificaciones' : `${promedio.cantidad} ${promedio.cantidad === 1 ? 'reseña' : 'reseñas'}`}
                </span>
              </div>

              {/* Roles */}
              <div className="flex gap-4">
                {usuario.esProvedor && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                    <BriefcaseIcon size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Proveedor</span>
                  </div>
                )}
                {usuario.esDemanda && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                    <ShoppingBagIcon size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-600">Demandante</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {(servicios.length > 0 || pedidos.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
            <div className="text-sm text-gray-600">Servicios brindados</div>
            <div className="text-2xl font-bold text-blue-600">{servicios.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-600">
            <div className="text-sm text-gray-600">Servicios solicitados</div>
            <div className="text-2xl font-bold text-green-600">{pedidos.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600">Reseñas recibidas</div>
            <div className="text-2xl font-bold text-yellow-600">{promedio.cantidad}</div>
          </div>
        </div>
      )}

      {/* Servicios del Usuario */}
      {servicios.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <BriefcaseIcon size={24} className="text-blue-600" />
            Servicios brindados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicios.map((servicio) => (
              <div key={servicio.id_servicio} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{servicio.titulo}</h3>
                {servicio.descripcion && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{servicio.descripcion}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">${servicio.precio}</span>
                  <span className="text-xs text-gray-500">{new Date(servicio.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos del Usuario */}
      {pedidos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <ShoppingBagIcon size={24} className="text-green-600" />
            Servicios solicitados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pedidos.map((pedido) => (
              <div key={pedido.id_pedidos} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{pedido.titulo}</h3>
                  {pedido.estado && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      pedido.estado === 'completado' 
                        ? 'bg-green-100 text-green-800'
                        : pedido.estado === 'pendiente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pedido.estado}
                    </span>
                  )}
                </div>
                {pedido.descripcion && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pedido.descripcion}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">${pedido.precio}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(pedido.fecha || pedido.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reseñas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <StarIcon size={24} className="text-yellow-500" />
          Reseñas ({promedio.cantidad})
        </h2>
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
                  <p className="text-gray-700 text-sm mt-2 italic">{rating.comment}</p>
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
