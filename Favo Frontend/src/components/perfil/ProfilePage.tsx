import { useEffect, useState } from 'react';
import { ServiceHistory } from './ServiceHistory';
import { StarIcon, MapPinIcon, CalendarIcon, CheckCircleIcon, MailIcon, MapIcon, AlertCircleIcon } from 'lucide-react';
import { Spinner } from '../layout/spinner';

const API_URL = 'https://favo-iy6h.onrender.com';

export const ProfilePage = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [providedServices, setProvidedServices] = useState<any[]>([]);
  const [requestedServices, setRequestedServices] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [provinceInput, setProvinceInput] = useState('');
  const [barrioInput, setBarrioInput] = useState('');
  const [calleInput, setCalleInput] = useState('');
  const [alturaInput, setAlturaInput] = useState('');
  const [pisoInput, setPisoInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [savingError, setSavingError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

        // If no token or failed, try unauthenticated call (some setups return public profile)
        if (!currentUser) {
          try {
            const resPublic = await fetch(`${API_URL}/users/me/`);
            if (resPublic.ok) currentUser = await resPublic.json();
          } catch (e) {
            // ignore
          }
        }

        // Normalize fields that may come under different names/formats
        if (currentUser) {
          // description may come as descripcion or description
          currentUser.descripcion = currentUser.descripcion || currentUser.description || currentUser.desc || currentUser.bio || currentUser.about || currentUser.descripcion_text;
          // foto may be provided as base64, url, or bytes. Prefer an explicit URL field if present
          if (currentUser.foto_perfil_url) {
            currentUser.foto_perfil_url = currentUser.foto_perfil_url;
          } else if (currentUser.foto_perfil_base64) {
            currentUser.foto_perfil_base64 = currentUser.foto_perfil_base64;
          } else if (currentUser.foto_perfil && typeof currentUser.foto_perfil === 'string') {
            // if backend already returns a base64 string without prefix
            currentUser.foto_perfil_base64 = currentUser.foto_perfil;
          } else if (currentUser.foto_perfil && currentUser.foto_perfil.data) {
            // sometimes binary is returned as object with data
            try {
              const b64 = Buffer.from(currentUser.foto_perfil.data).toString('base64');
              currentUser.foto_perfil_base64 = b64;
            } catch (e) {
              // ignore
            }
          }

          setUser(currentUser);

          // If user has a foreign key to Ubicacion, try to fetch it (pass token if available)
          if (currentUser.id_ubicacion) {
            try {
              const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
              const headers: any = {};
              if (token) headers['Authorization'] = `Bearer ${token}`;
              const ubRes = await fetch(`${API_URL}/ubicaciones/${currentUser.id_ubicacion}`, { headers });
              if (ubRes.ok) {
                const ub = await ubRes.json();
                // attach to user for convenience
                currentUser.Ubicacion = ub;
                setUser({ ...currentUser });
                // preselect location for editing
                setSelectedLocationId(currentUser.id_ubicacion || null);
              }
            } catch (e) {
              // ignore if backend doesn't have this endpoint
            }
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
            const provided = servicios.filter((s: any) => s.id_usuario === currentUser.id_usuario).map((s: any) => ({
              id: s.id_servicio,
              service: s.titulo,
              client: s.Usuario?.nombre || 'Desconocido',
              date: s.created_at ? new Date(s.created_at).toLocaleDateString() : '—',
              status: 'Publicado',
              amount: s.precio ? `$${s.precio}` : '—',
              rating: s.rating || undefined
            }));
            setProvidedServices(provided);
          }
        }

        // compute simple stats from fetched data
        // We compute stats by counting arrays we filled above. Keep them in state so rendering can use them.

        if (pedRes && (pedRes as Response).ok) {
          const pedidos = await (pedRes as Response).json();
          if (currentUser && Array.isArray(pedidos)) {
            const requested = pedidos.filter((p: any) => p.id_usuario === currentUser.id_usuario).map((p: any) => ({
              id: p.id_pedidos || p.id,
              service: p.titulo || 'Pedido',
              provider: p.Proveedor?.nombre || p.proveedor_nombre || 'Desconocido',
              date: p.fecha ? new Date(p.fecha).toLocaleDateString() : (p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'),
              status: p.estado || 'Pendiente',
              amount: p.precio ? `$${p.precio}` : '—',
              rating: p.rating || undefined
            }));
            setRequestedServices(requested);
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // preload ubicaciones list for the edit form (non-blocking)
    (async () => {
      try {
        const res = await fetch(`${API_URL}/ubicaciones`);
        if (res.ok) {
          const data = await res.json();
          setLocations(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      {loading ? <Spinner /> : null}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* If foto_perfil is provided as base64 or URL, use it. If foto_perfil is binary, backend needs to expose it as base64 or URL. */}
          <img src={
            user?.foto_perfil_url || (user?.foto_perfil_base64 ? `data:image/jpeg;base64,${user.foto_perfil_base64}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || user?.mail || 'User')}&background=fff&color=1f2937`)
          } alt="Foto de perfil" className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.nombre || user?.mail || 'Usuario'}</h1>
                {/* description */}
                {user?.descripcion && <p className="text-sm text-gray-600 mt-1">{user.descripcion}</p>}
                {/* Mostrar ubicación compuesta si está disponible */}
                {user?.Ubicacion ? (
                  <div className="flex items-center gap-2 mt-1">
                    <MapPinIcon size={16} className="text-gray-400" />
                    <span className="text-gray-600">{`${user.Ubicacion.calle || ''}${user.Ubicacion.altura ? ' ' + user.Ubicacion.altura : ''}${user.Ubicacion.piso ? ', Piso ' + user.Ubicacion.piso : ''}${user.Ubicacion.barrio_zona ? ' - ' + user.Ubicacion.barrio_zona : ''}${user.Ubicacion.provincia ? ', ' + user.Ubicacion.provincia : ''}`.replace(/^, |^\s+/, '') || '—'}</span>
                  </div>
                ) : user?.id_ubicacion ? (
                  <div className="flex items-center gap-2 mt-1">
                    <MapPinIcon size={16} className="text-gray-400" />
                    <span className="text-gray-600">Ubicación registrada (ID {user.id_ubicacion})</span>
                  </div>
                ) : null}
                {user?.fecha_registro && (
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarIcon size={16} className="text-gray-400" />
                    <span className="text-gray-600">Miembro desde {new Date(user.fecha_registro).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircleIcon size={16} className="text-green-500" />
                  <span className="text-green-600">{user?.verificado ? 'Identidad verificada' : 'No verificado'}</span>
                </div>
              </div>
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
                  setAlturaInput(user.Ubicacion.altura || '');
                  setPisoInput(user.Ubicacion.piso || '');
                }
              }} className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900">Editar perfil</button>
            </div>
            {/* Edit form/modal */}
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
                                : user?.foto_perfil_url || user?.foto_perfil_base64 
                                  ? (user?.foto_perfil_url || `data:image/jpeg;base64,${user?.foto_perfil_base64}`)
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'User')}&background=fff&color=1f2937`
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
                                setPhotoPreview(result);
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
                              if (pisoInput) locationData.piso = parseInt(pisoInput);

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
                            if (nameInput !== user?.nombre) body.nombre = nameInput;
                            if (descInput !== user?.descripcion) body.descripcion = descInput;
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
                              const updated = await res.json();
                              setUser(updated);
                              setEditing(false);
                              setPhotoBase64(null);
                              setPhotoPreview(null);
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

            <div className="mt-4">
              <div className="flex items-center gap-1">
                <StarIcon size={20} className="text-yellow-400 fill-current" />
                <span className="text-lg font-semibold">{user?.rating ?? '—'}</span>
                <span className="text-gray-500">({user?.review_count ?? 0} reseñas)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Small live stats row derived from fetched data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-sm text-gray-500">Servicios brindados</div>
          <div className="text-2xl font-bold">{providedServices.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-sm text-gray-500">Servicios solicitados</div>
          <div className="text-2xl font-bold">{requestedServices.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-sm text-gray-500">Reseñas</div>
          <div className="text-2xl font-bold">{user?.review_count ?? 0}</div>
        </div>
      </div>


      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <ServiceHistory title="Servicios brindados" type="provided" services={providedServices} />
        <ServiceHistory title="Servicios solicitados" type="requested" services={requestedServices} />
      </div>
    </div>
  );
};