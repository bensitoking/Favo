import React from 'react';
import { ClipboardList, Wrench } from 'lucide-react';

type Props = {
  active: 'pedidos' | 'servicios';
  onChange: (v: 'pedidos' | 'servicios') => void;

  // subcontroles para pedidos
  pedidoView: 'mis_pedidos' | 'aceptados_por_mi';
  onPedidoViewChange: (v: 'mis_pedidos' | 'aceptados_por_mi') => void;

  pedidoFilter: 'activos' | 'completados';
  onPedidoFilterChange: (v: 'activos' | 'completados') => void;
};

export function ActivityTabs({
  active, onChange,
  pedidoView, onPedidoViewChange,
  pedidoFilter, onPedidoFilterChange
}: Props) {
  return (
    <>
      <div className="flex border-b border-gray-200">
        <button
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
            active === 'pedidos'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => onChange('pedidos')}
        >
          <ClipboardList size={20} />
          <span>Mis pedidos</span>
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
            active === 'servicios'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => onChange('servicios')}
        >
          <Wrench size={20} />
          <span>Mis servicios activos</span>
        </button>
      </div>

      {active === 'pedidos' && (
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              className={`px-3 py-2 text-sm ${pedidoView === 'mis_pedidos' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600'}`}
              onClick={() => onPedidoViewChange('mis_pedidos')}
            >
              Que yo creé
            </button>
            <button
              className={`px-3 py-2 text-sm ${pedidoView === 'aceptados_por_mi' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600'}`}
              onClick={() => onPedidoViewChange('aceptados_por_mi')}
            >
              Aceptados por mí
            </button>
          </div>

          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              className={`px-3 py-2 text-sm ${pedidoFilter === 'activos' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600'}`}
              onClick={() => onPedidoFilterChange('activos')}
            >
              Activos
            </button>
            <button
              className={`px-3 py-2 text-sm ${pedidoFilter === 'completados' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600'}`}
              onClick={() => onPedidoFilterChange('completados')}
            >
              Completados
            </button>
          </div>
        </div>
      )}
    </>
  );
}
