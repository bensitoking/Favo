import React, { useState } from 'react';
import { Conversation } from './Conversation';
import { MessageBubble } from './MessageBubble';
import { SendIcon, PaperclipIcon, SmileIcon } from 'lucide-react';
export const ChatInterface = () => {
  const [activeChat, setActiveChat] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const conversations = [{
    id: 0,
    name: 'Laura M.',
    role: 'Profesora de matemáticas',
    lastMessage: 'Hola, ¿podríamos coordinar una clase para el martes?',
    time: '12:45',
    unread: 2,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  }, {
    id: 1,
    name: 'Carlos G.',
    role: 'Plomero profesional',
    lastMessage: 'Perfecto, estaré allí a las 10 am',
    time: '10:30',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  }, {
    id: 2,
    name: 'María S.',
    role: 'Diseñadora gráfica',
    lastMessage: 'Te envío los diseños finales esta tarde',
    time: 'Ayer',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  }, {
    id: 3,
    name: 'Javier R.',
    role: 'Técnico en computación',
    lastMessage: 'Listo, problema resuelto. Cualquier cosa me avisas.',
    time: 'Ayer',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
  }];
  const messages = [{
    id: 1,
    sender: 'them',
    text: 'Hola, estoy interesada en tus servicios de matemáticas',
    time: '12:30'
  }, {
    id: 2,
    sender: 'me',
    text: 'Hola Laura, gracias por contactarme. ¿Qué nivel de matemáticas necesitas?',
    time: '12:35'
  }, {
    id: 3,
    sender: 'them',
    text: 'Necesito ayuda con cálculo diferencial para mi hijo que está en secundaria',
    time: '12:38'
  }, {
    id: 4,
    sender: 'me',
    text: 'Perfecto, tengo experiencia enseñando ese tema. ¿Para cuándo necesitarías la primera clase?',
    time: '12:40'
  }, {
    id: 5,
    sender: 'them',
    text: 'Hola, ¿podríamos coordinar una clase para el martes?',
    time: '12:45'
  }];
  const handleSubmit = e => {
    e.preventDefault();
    if (newMessage.trim()) {
      // En una aplicación real, aquí enviaríamos el mensaje
      setNewMessage('');
    }
  };
  return <div className="flex flex-1 overflow-hidden">
      {/* Lista de conversaciones */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Mensajes</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-136px)]">
          {conversations.map(conversation => <Conversation key={conversation.id} conversation={conversation} isActive={activeChat === conversation.id} onClick={() => setActiveChat(conversation.id)} />)}
        </div>
      </div>
      {/* Área de chat */}
      <div className="w-2/3 flex flex-col bg-gray-50">
        {/* Header del chat */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-center">
          <img src={conversations[activeChat].avatar} alt={conversations[activeChat].name} className="w-10 h-10 rounded-full mr-3" />
          <div>
            <h3 className="font-medium text-gray-900">
              {conversations[activeChat].name}
            </h3>
            <p className="text-sm text-gray-500">
              {conversations[activeChat].role}
            </p>
          </div>
        </div>
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => <MessageBubble key={message.id} message={message} />)}
        </div>
        {/* Input de mensaje */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white flex items-center">
          <button type="button" className="text-gray-400 hover:text-blue-800 mr-2">
            <PaperclipIcon size={20} />
          </button>
          <input type="text" placeholder="Escribe un mensaje..." className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent" value={newMessage} onChange={e => setNewMessage(e.target.value)} />
          <button type="button" className="text-gray-400 hover:text-blue-800 mx-2">
            <SmileIcon size={20} />
          </button>
          <button type="submit" className="bg-blue-800 text-white rounded-full p-2 hover:bg-blue-900">
            <SendIcon size={18} />
          </button>
        </form>
      </div>
    </div>;
};