import React from 'react';
export const Conversation = ({
  conversation,
  isActive,
  onClick
}) => {
  return <div className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${isActive ? 'bg-blue-50' : ''}`} onClick={onClick}>
      <div className="relative">
        <img src={conversation.avatar} alt={conversation.name} className="w-12 h-12 rounded-full mr-3" />
        {conversation.unread > 0 && <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {conversation.unread}
          </span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h4 className="font-medium text-gray-900 truncate">
            {conversation.name}
          </h4>
          <span className="text-xs text-gray-500">{conversation.time}</span>
        </div>
        <p className="text-sm text-gray-500 truncate">{conversation.role}</p>
        <p className="text-sm text-gray-600 truncate">
          {conversation.lastMessage}
        </p>
      </div>
    </div>;
};