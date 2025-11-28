import { useEffect, useState } from 'react';
import { StarIcon, MapPinIcon, CalendarIcon, CheckCircleIcon, AlertCircleIcon, BriefcaseIcon, ShoppingBagIcon } from 'lucide-react';
import { Spinner } from '../layout/spinner';

const API_URL = 'https://favo-iy6h.onrender.com';

const normalizeUserData = async (currentUser: any) => {
  if (!currentUser) return null;
  
  // Normalizar descripción
  currentUser.descripcion = currentUser.descripcion || currentUser.description || currentUser.desc || currentUser.bio || currentUser.about || currentUser.descripcion_text || '';
  
  // Normalizar foto: el backend puede devolver foto_perfil (base64 sin prefijo)
  // o foto_perfil_base64. Asegurar que foto_perfil_base64 tenga el valor correcto
  if (currentUser.foto_perfil && !currentUser.foto_perfil_base64) {
    currentUser.foto_perfil_base64 = currentUser.foto_perfil;
  }
  
  // Obtener ubicación si existe
  if (currentUser.id_ubicacion) {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const ubRes = await fetch(`${API_URL}/ubicaciones/${currentUser.id_ubicacion}`, { headers });
      if (ubRes.ok) {
        currentUser.Ubicacion = await ubRes.json();
      }
    } catch (e) {
      console.error('Error fetching location:', e);
    }
  }
  
  return currentUser;
};

export const ProfilePage = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingPromedio, setRatingPromedio] = useState({ promedio: 0, cantidad: 0 });
  const [editing, setEditing] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [provinceInput, setProvinceInput] = useState('');
  const [barrioInput, setBarrioInput] = useState('');
  const [calleInput, setCalleInput] = useState('');
  const [alturaInput, setAlturaInput] = useState('');
  const [pisoInput, setPisoInput] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [savingError, setSavingError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) return;

      const res = await fetch(`${API_URL}/users/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        let currentUser = await res.json();
        currentUser = await normalizeUserData(currentUser);
        setUser(currentUser);
        
        // También refrescar los servicios/pedidos si es necesario
        const [servRes, pedRes] = await Promise.all([
          fetch(`${API_URL}/servicios`),
          fetch(`${API_URL}/pedidos`).catch(() => ({ ok: false }))
        ]);

        if (servRes && servRes.ok) {
          const servicios = await servRes.json();
          if (currentUser && Array.isArray(servicios)) {
            setServicios(servicios.filter((s: any) => s.id_usuario === currentUser.id_usuario));
          }
        }

        if (pedRes && (pedRes as Response).ok) {
          const pedidos = await (pedRes as Response).json();
          if (currentUser && Array.isArray(pedidos)) {
            setPedidos(pedidos.filter((p: any) => p.id_usuario === currentUser.id_usuario));
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

        // Fetch current user
        let currentUser = null;
        if (token) {
          const res = await fetch(`${API_URL}/users/me/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) currentUser = await res.json();
        }

        // If no token or failed, try unauthenticated call
        if (!currentUser) {
          try {
            const resPublic = await fetch(`${API_URL}/users/me/`);
            if (resPublic.ok) currentUser = await resPublic.json();
          } catch (e) {
            // ignore
          }
        }

        // Normalize and fetch related data
        if (currentUser) {
          currentUser = await normalizeUserData(currentUser);
          setUser(currentUser);

          // Obtener ratings del usuario
          try {
            const ratingsRes = await fetch(`${API_URL}/ratings/usuario/${currentUser.id_usuario}`);
            if (ratingsRes.ok) {
              const ratingsData = await ratingsRes.json();
              setRatings(Array.isArray(ratingsData) ? ratingsData : []);
            }

            const promRes = await fetch(`${API_URL}/ratings/promedio/${currentUser.id_usuario}`);
            if (promRes.ok) {
              const promData = await promRes.json();
              setRatingPromedio(promData);
            }
          } catch (e) {
            console.error('Error fetching ratings:', e);
          }
        }

        // Fetch servicios and pedidos and map to our history components
        const [servRes, pedRes] = await Promise.all([
          fetch(`${API_URL}/servicios`),
          fetch(`${API_URL}/pedidos`).catch(() => ({ ok: false }))
        ]);

        if (servRes && servRes.ok) {
          const servicios = await servRes.json();
          // provided = services where id_usuario === current user's id
          if (currentUser && Array.isArray(servicios)) {
            setServicios(servicios.filter((s: any) => s.id_usuario === currentUser.id_usuario));
          }
        }

        // compute simple stats from fetched data
        // We compute stats by counting arrays we filled above. Keep them in state so rendering can use them.

        if (pedRes && (pedRes as Response).ok) {
          const pedidos = await (pedRes as Response).json();
          if (currentUser && Array.isArray(pedidos)) {
            setPedidos(pedidos.filter((p: any) => p.id_usuario === currentUser.id_usuario));
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      {loading ? <Spinner /> : null}
      
      <>
      {/* Encabezado del Perfil */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-6">
          <img src={
            user?.foto_perfil_base64 
              ? (user.foto_perfil_base64.startsWith('data:') 
                  ? user.foto_perfil_base64 
                  : `data:image/jpeg;base64,${user.foto_perfil_base64}`)
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || user?.mail || 'User')}&background=fff&color=1f2937`
          } alt="Foto de perfil" className="w-40 h-40 rounded-full border-4 border-white shadow-md object-cover" />
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user?.nombre || user?.mail || 'Usuario'}</h1>
                
                {/* Status de Verificación */}
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircleIcon size={18} className={user?.verificado ? "text-green-500" : "text-gray-400"} />
                  <span className={user?.verificado ? "text-green-600 text-sm font-medium" : "text-gray-600 text-sm"}>
                    {user?.verificado ? 'Identidad verificada' : 'No verificado'}
                  </span>
                </div>

                {/* Ubicación */}
                {user?.Ubicacion ? (
                  <div className="flex items-start gap-2 mt-3 text-gray-700">
                    <MapPinIcon size={18} className="flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      {user.Ubicacion.calle && <p>{user.Ubicacion.calle} {user.Ubicacion.altura}</p>}
                      {user.Ubicacion.piso && <p>Piso {user.Ubicacion.piso}</p>}
                      {user.Ubicacion.barrio_zona && <p>{user.Ubicacion.barrio_zona}</p>}
                      {user.Ubicacion.provincia && <p>{user.Ubicacion.provincia}</p>}
                    </div>
                  </div>
                ) : null}

                {/* Descripción */}
                {user?.descripcion && (
                  <p className="text-gray-600 mt-3 max-w-lg">{user.descripcion}</p>
                )}

                {/* Fecha de Registro */}
                {user?.fecha_registro && (
                  <div className="flex items-center gap-2 mt-3 text-gray-600 text-sm">
                    <CalendarIcon size={16} />
                    <span>Miembro desde {new Date(user.fecha_registro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</span>
                  </div>
                )}
              </div>

              {/* Botón Editar */}
              <button onClick={() => {
                setEditing(true);
                setEmailInput(user?.mail || '');
                setNameInput(user?.nombre || '');
                setDescInput(user?.descripcion || '');
                setSelectedLocationId(user?.id_ubicacion || null);
                if (user?.Ubicacion) {
                  setProvinceInput(user.Ubicacion.provincia || '');
                  setBarrioInput(user.Ubicacion.barrio_zona || '');
                  setCalleInput(user.Ubicacion.calle || '');
                  setAlturaInput(String(user.Ubicacion.altura || ''));
                  setPisoInput(String(user.Ubicacion.piso || ''));
                }
              }} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                Editar perfil
              </button>
            </div>

            {/* Rating Summary y Roles */}
            <div className="mt-6 flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon 
                        key={star}
                        size={20}
                        className={`${
                          star <= Math.round(ratingPromedio.promedio)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-lg">{ratingPromedio.promedio.toFixed(1)}</span>
                </div>
                <span className="text-gray-600 text-sm">
                  {ratingPromedio.cantidad === 0 ? 'Sin calificaciones' : `${ratingPromedio.cantidad} ${ratingPromedio.cantidad === 1 ? 'reseña' : 'reseñas'}`}
                </span>
              </div>

              {/* Roles */}
              <div className="flex gap-4">
                {user?.esProvedor && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                    <BriefcaseIcon size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Proveedor</span>
                  </div>
                )}
                {user?.esDemanda && (
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

      {/* Formulario de edición */}
      {editing && (
        <div>
              {editing && (
                <div className="mt-6 bg-white border-2 border-blue-100 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Editar tu perfil</h3>
                  
                  {savingError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircleIcon size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-red-700 text-sm">{savingError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Foto de perfil */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Foto de perfil</label>
                      <div className="flex gap-4 items-start">
                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-300 flex-shrink-0 overflow-hidden">
                          <img 
                            src={
                              photoBase64 
                                ? `data:image/jpeg;base64,${photoBase64}`
                                : (user?.foto_perfil_base64 
                                    ? (user.foto_perfil_base64.startsWith('data:') 
                                        ? user.foto_perfil_base64 
                                        : `data:image/jpeg;base64,${user.foto_perfil_base64}`)
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'User')}&background=fff&color=1f2937`)
                            }
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                const result = reader.result as string;
                                const base = result.split(',')[1] || result;
                                setPhotoBase64(base);
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="block w-full text-sm text-gray-500 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <p className="text-xs text-gray-500 mt-2">PNG, JPG o GIF. Máx 5MB.</p>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label>
                      <input 
                        type="email"
                        value={emailInput} 
                        onChange={(e) => setEmailInput(e.target.value)} 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="tu@email.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cambiar el email requiere verificación</p>
                    </div>

                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                      <input 
                        type="text"
                        value={nameInput} 
                        onChange={(e) => setNameInput(e.target.value)} 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                      <input 
                        type="text"
                        value={descInput} 
                        onChange={(e) => setDescInput(e.target.value)} 
                        maxLength={200}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Descripción breve sobre ti"
                      />
                      <p className="text-xs text-gray-500 mt-1">{descInput.length}/200</p>
                    </div>

                    {/* Sección de Ubicación */}
                    <div className="md:col-span-2 border-t-2 border-gray-200 pt-6 mt-2">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Provincia</label>
                          <input 
                            type="text"
                            value={provinceInput} 
                            onChange={(e) => setProvinceInput(e.target.value)} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Ej: Buenos Aires"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Barrio/Zona</label>
                          <input 
                            type="text"
                            value={barrioInput} 
                            onChange={(e) => setBarrioInput(e.target.value)} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Ej: Olivos"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Calle</label>
                          <input 
                            type="text"
                            value={calleInput} 
                            onChange={(e) => setCalleInput(e.target.value)} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Ej: Av. Libertador"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Altura</label>
                          <input 
                            type="text"
                            value={alturaInput} 
                            onChange={(e) => setAlturaInput(e.target.value)} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Ej: 1234"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Piso (opcional)</label>
                          <input 
                            type="text"
                            value={pisoInput} 
                            onChange={(e) => setPisoInput(e.target.value)} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Ej: 3B"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3 mt-8 justify-end border-t pt-6">
                    <button 
                      onClick={() => {
                        setEditing(false);
                        setSavingError('');
                      }} 
                      className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => setShowConfirmDialog(true)}
                      className="px-6 py-2.5 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </div>
              )}

              {/* Diálogo de confirmación */}
              {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmar cambios</h3>
                    <p className="text-gray-600 mb-6">
                      ¿Estás seguro de que deseas guardar estos cambios en tu perfil?.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button 
                        onClick={() => setShowConfirmDialog(false)}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={async () => {
                          setShowConfirmDialog(false);
                          setSavingError('');
                          try {
                            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
                            if (!token) {
                              setSavingError('No autenticado');
                              return;
                            }

                            let newLocationId = selectedLocationId;

                            // Crear o actualizar ubicación si hay datos
                            if (provinceInput || barrioInput || calleInput || alturaInput || pisoInput) {
                              // Solo incluir campos que tienen valor
                              const locationData: any = {};
                              if (provinceInput) locationData.provincia = provinceInput;
                              if (barrioInput) locationData.barrio_zona = barrioInput;
                              if (calleInput) locationData.calle = calleInput;
                              if (alturaInput) locationData.altura = alturaInput;
                              if (pisoInput && String(pisoInput).trim()) {
                                const pisoNum = parseInt(String(pisoInput).trim());
                                if (!isNaN(pisoNum)) locationData.piso = pisoNum;
                              }

                              let locationRes;
                              if (selectedLocationId) {
                                // Actualizar ubicación existente
                                locationRes = await fetch(`${API_URL}/ubicaciones/${selectedLocationId}`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify(locationData)
                                });
                              } else {
                                // Crear nueva ubicación
                                locationRes = await fetch(`${API_URL}/ubicaciones`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify(locationData)
                                });
                              }

                              if (locationRes.ok) {
                                const responseData = await locationRes.json();
                                // Extraer el ID correctamente (puede venir como id_ubicacion o id)
                                newLocationId = responseData.id_ubicacion || responseData.id;
                              } else {
                                const errorData = await locationRes.json().catch(() => ({}));
                                setSavingError(errorData.detail || 'Error al guardar la ubicación');
                                return;
                              }
                            }

                            // Guardar datos del usuario
                            const body: any = {};
                            body.nombre = nameInput;
                            body.descripcion = descInput;
                            if (newLocationId) body.id_ubicacion = newLocationId;
                            if (photoBase64) body.foto_perfil_base64 = photoBase64;

                            const res = await fetch(`${API_URL}/users/me/`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify(body)
                            });

                            if (res.ok) {
                              // Refrescar todos los datos del usuario
                              await refreshUserData();
                              setEditing(false);
                              setPhotoBase64(null);
                              setShowConfirmDialog(false);
                              // Limpiar los campos de ubicación también
                              setSelectedLocationId(user?.id_ubicacion || null);
                            } else {
                              const errorData = await res.json().catch(() => ({}));
                              setSavingError(errorData.detail || 'Error al guardar los cambios');
                            }
                          } catch (err: any) {
                            setSavingError(err.message || 'Error al guardar los cambios');
                          }
                        }}
                        className="px-4 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              )}
        </div>
      )}

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
            <div className="text-2xl font-bold text-yellow-600">{ratingPromedio.cantidad}</div>
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
              <div key={pedido.id_pedidos || pedido.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
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
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <StarIcon size={24} className="text-yellow-500" />
          Reseñas ({ratingPromedio.cantidad})
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
      </>
    </div>
  );
};