import React from 'react';
import { RecentRequests } from './RecentRequests';
import { TrendingColumn } from './TrendingColumn';
export const Servicios = () =>  {
  return <div className="flex flex-col min-h-screen bg-gray-50">
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
    </div>;
}