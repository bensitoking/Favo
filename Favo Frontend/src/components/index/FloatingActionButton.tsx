import React from 'react';
import { PlusIcon } from 'lucide-react';

export const FloatingActionButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-105 group"
    >
      <PlusIcon size={24} className="group-hover:rotate-90 transition-transform" />
      <span className="sr-only">Crear nuevo</span>
      <span className="absolute -left-2 -top-2 bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-sm">
        3
      </span>
    </button>
  );
};