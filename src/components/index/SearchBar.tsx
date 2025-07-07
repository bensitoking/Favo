import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, XIcon } from 'lucide-react';

export const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`demanda?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <form onSubmit={handleSearch} className="bg-white shadow-lg rounded-full max-w-3xl mx-auto p-1 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center">
        <div className="pl-4 text-gray-400">
          <SearchIcon size={20} />
        </div>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="¿Qué servicio necesitas?" 
          className="w-full p-3 bg-transparent outline-none text-gray-700 placeholder-gray-400" 
        />
        {searchTerm && (
          <button 
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-gray-400 hover:text-gray-600 mr-2"
          >
            <XIcon size={20} />
          </button>
        )}
        <button 
          type="submit"
          className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full mr-1 transition-all hover:shadow-md ${!searchTerm.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Buscar
        </button>
      </div>
    </form>
  );
};