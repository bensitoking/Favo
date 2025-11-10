import React from 'react';
import { Wrench, CheckCircle } from 'lucide-react';

type Servicio = {
  id_servicio: number;
  titulo: string;
  descripcion: string;
  id_categoria: number;
  id_usuario: number;
  activo: boolean;
};

export function ServicioCard({ servicio }: { servicio: Servicio }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Wrench size={20} />
          <h3 className="text-lg font-semibold text-gray-800">{servicio.titulo}</h3>
        </div>
        {servicio.activo ? (
          <span className="inline-flex items-center gap-1 text-green-600">
            <CheckCircle size={18} /> Activo
          </span>
        ) : (
          <span className="text-gray-500">Inactivo</span>
        )}
      </div>
      <p className="text-gray-700">{servicio.descripcion}</p>
      <div className="text-sm text-gray-500 mt-2">Categoría: {servicio.id_categoria}</div>
    </div>
  );
}
