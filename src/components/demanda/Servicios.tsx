import React, { useState } from "react";
import { RecentRequests } from "./RecentRequests";
import { TrendingColumn } from "./TrendingColumn";
import { NuevoServicioModal } from "./NuevoServicioModal";

export const Servicios = () => {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
            <div className="lg:col-span-2">
              <RecentRequests />
            </div>
            <div className="lg:col-span-1">
              <TrendingColumn />
            </div>
          </div>
        </div>
      </main>

      <button
  onClick={() => setModalAbierto(true)}
  className="fixed bottom-6 right-6 bg-[#1D4ED8] hover:bg-blue-800 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
</button>



      <NuevoServicioModal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
    </div>
  );
};
