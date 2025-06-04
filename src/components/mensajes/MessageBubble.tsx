import React from 'react';
export const MessageBubble = ({
  message
}) => {
  const isMe = message.sender === 'me';
  return <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isMe ? 'bg-blue-800 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
        <p className="text-sm">{message.text}</p>
        <span className={`text-xs block mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
          {message.time}
        </span>
      </div>
    </div>;
};