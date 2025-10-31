import { useEffect, useState } from 'react';
import { ServiceHistory } from './ServiceHistory';
import { StarIcon, MapPinIcon, CalendarIcon, CheckCircleIcon } from 'lucide-react';
import { Spinner } from '../layout/spinner';

const API_URL = 'https://favo-iy6h.onrender.com';

export const ProfilePage = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [providedServices, setProvidedServices] = useState<any[]>([]);
  const [requestedServices, setRequestedServices] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

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
                setNameInput(user?.nombre || '');
                setDescInput(user?.descripcion || '');
                setSelectedLocationId(user?.id_ubicacion || null);
              }} className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900">Editar perfil</button>
            </div>
            {/* Edit form/modal - preserved in original position, only toggled by the top button */}
            <div>
              {editing && (
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <div className="grid grid-cols-1 gap-3">
                    <label className="text-sm">Nombre</label>
                    <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="p-2 border rounded" />
                    <label className="text-sm">Descripción</label>
                    <textarea value={descInput} onChange={(e) => setDescInput(e.target.value)} className="p-2 border rounded" />
                    <label className="text-sm">Ubicación</label>
                    <select value={selectedLocationId ?? ''} onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : null)} className="p-2 border rounded">
                      <option value="">-- Seleccionar --</option>
                      {locations.map(loc => <option key={loc.id_ubicacion} value={loc.id_ubicacion}>{`${loc.calle || ''}${loc.altura ? ' ' + loc.altura : ''}${loc.barrio_zona ? ' - ' + loc.barrio_zona : ''}${loc.provincia ? ', ' + loc.provincia : ''}`}</option>)}
                    </select>
                    <label className="text-sm">Foto de perfil (opcional)</label>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = reader.result as string;
                        // strip prefix if present
                        const base = result.split(',')[1] || result;
                        setPhotoBase64(base);
                      };
                      reader.readAsDataURL(file);
                    }} />
                    <div className="flex gap-2">
                      <button onClick={async () => {
                        // submit
                        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
                        const body: any = {};
                        if (nameInput) body.nombre = nameInput;
                        if (descInput) body.descripcion = descInput;
                        if (selectedLocationId) body.id_ubicacion = selectedLocationId;
                        if (photoBase64) body.foto_perfil_base64 = photoBase64;
                        try {
                          const res = await fetch(`${API_URL}/users/me/`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                            },
                            body: JSON.stringify(body)
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            setUser(updated);
                            setEditing(false);
                          } else {
                            console.error('Failed to update profile', await res.text());
                          }
                        } catch (err) { console.error(err) }
                      }} className="bg-green-600 text-white px-3 py-1 rounded">Guardar</button>
                      <button onClick={() => setEditing(false)} className="bg-gray-200 px-3 py-1 rounded">Cancelar</button>
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