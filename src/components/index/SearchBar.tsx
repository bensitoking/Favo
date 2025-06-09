import React from 'react';
import { Link } from 'react-router-dom'
import { SearchIcon } from 'lucide-react';
export const SearchBar = () => {
  return <div className="bg-white shadow-lg rounded-lg max-w-3xl mx-auto p-2">
      <div className="flex items-center bg-gray-50 rounded-md">
        <SearchIcon className="text-gray-400 ml-3" size={20} />
        <input type="text" placeholder="¿Qué servicio necesitas?" className="w-full p-3 bg-transparent outline-none text-gray-700 placeholder-gray-400" />
        <Link to="/demanda" >
        <button className="bg-[#1a365d] hover:bg-[#234781] text-white px-6 py-2 rounded-md mr-2 transition-colors">
          Buscar
        </button>
        </Link>
      </div>
    </div>;
};