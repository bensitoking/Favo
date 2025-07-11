import React from 'react';
import { ClockIcon, CheckCircleIcon } from 'lucide-react';
interface OrderTabsProps {
  activeTab: 'active' | 'completed';
  onTabChange: (tab: 'active' | 'completed') => void;
}
export function OrderTabs({
  activeTab,
  onTabChange
}: OrderTabsProps) {
  return <div className="flex border-b border-gray-200">
      <button className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'active' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => onTabChange('active')}>
        <ClockIcon size={20} />
        <span>Pedidos Activos</span>
      </button>
      <button className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'completed' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => onTabChange('completed')}>
        <CheckCircleIcon size={20} />
        <span>Completados</span>
      </button>
    </div>;
}