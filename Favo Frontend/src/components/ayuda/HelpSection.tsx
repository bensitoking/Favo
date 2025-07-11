import React from 'react';
interface HelpSectionProps {
  title: string;
  icon: ReactNode;
  content: ReactNode;
}
export function HelpSection({
  title,
  icon,
  content
}: HelpSectionProps) {
  return <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="text-gray-700">{content}</div>
    </div>;
}