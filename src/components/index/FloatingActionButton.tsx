import React from 'react';
import { PlusIcon } from 'lucide-react';
export const FloatingActionButton = () => {
  return <button className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105">
      <PlusIcon size={24} />
    </button>;
};