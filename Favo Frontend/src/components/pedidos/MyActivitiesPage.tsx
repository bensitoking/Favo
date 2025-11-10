import React, { useEffect, useMemo, useState } from 'react';
import { ActivityTabs } from './ActivityTabs';
import { PedidoCard } from './PedidoCard';
import { ServicioCard } from './ServicioCard';

type Pedido = {
  id_pedidos: number;
  titulo: string;
  descripcion: string;
  precio?: number;
  id_categoria: number;
  id_usuario: number;       // dueño (demanda)
  status: 'pendiente' | 'en_proceso' | 'completado';
  accepted_by?: number | null;
  accepted_at?: string | null;
};

type Servicio = {
  id_servicio: number;
  titulo: string;
  descripcion: string;
  id_categoria: number;
  id_usuario: number;       // dueño (proveedor)
  activo: boolean;
};

const API_URL = "https://favo-iy6h.onrender.com";
const getToken = () =>
  localStorage.getItem('access_token') || localStorage.getItem('token') || '';

export default function MyActivitiesPage() {
  const [tab, setTab] = useState<'pedidos' | 'servicios'>('pedidos');
  const [pedidoView, setPedidoView] = useState<'mis_pedidos' | 'aceptados_por_mi'>('mis_pedidos');
  const [pedidoFilter, setPedidoFilter] = useState<'activos' | 'completados'>('activos');

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);

  const headers = useMemo(() => ({
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  }), []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (tab === 'pedidos') {
          // scope: owner (mis pedidos) | accepted (los que acepté)
          const scope = pedidoView === 'mis_pedidos' ? 'owner' : 'accepted';
          // status filter
          const status = pedidoFilter === 'completados' ? 'completado' : undefined;
          const res = await fetch(
            `${API_URL}/users/me/pedidos?scope=${scope}${status ? `&status=${status}` : ''}`,
            { headers }
          );
          const data = await res.json();
          setPedidos(Array.isArray(data) ? data : []);
        } else {
          // servicios del usuario; solo activos por UI (lo podés cambiar)
          const res = await fetch(`${API_URL}/users/me/servicios?only_active=true`, { headers });
          const data = await res.json();
          setServicios(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tab, pedidoView, pedidoFilter, headers]);

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mis Actividades</h1>
        </div>

        <ActivityTabs
          active={tab}
          onChange={setTab}
          pedidoView={pedidoView}
          onPedidoViewChange={setPedidoView}
          pedidoFilter={pedidoFilter}
          onPedidoFilterChange={setPedidoFilter}
        />

        {tab === 'pedidos' && (
          <section className="mt-6 space-y-4">
            {loading && <p className="text-gray-500">Cargando pedidos…</p>}
            {!loading && pedidos.length === 0 && (
              <div className="text-center py-12 text-gray-500">No hay pedidos para mostrar.</div>
            )}
            {pedidos.map(p => (
              <PedidoCard key={p.id_pedidos} pedido={p} />
            ))}
          </section>
        )}

        {tab === 'servicios' && (
          <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading && <p className="text-gray-500">Cargando servicios…</p>}
            {!loading && servicios.length === 0 && (
              <div className="text-center py-12 text-gray-500 col-span-full">
                No tenés servicios activos.
              </div>
            )}
            {servicios.map(s => (
              <ServicioCard key={s.id_servicio} servicio={s} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
