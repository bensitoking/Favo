import React from 'react';
import { ShoppingBagIcon, MessageSquareIcon, UserIcon, HelpCircleIcon, HomeIcon, SearchIcon, BriefcaseIcon, HeartIcon, ChevronDownIcon, CheckCircleIcon } from 'lucide-react';
import { HelpSection } from './HelpSection';
export function HelpPage() {
  return <div className="min-h-screen bg-gray-50 w-full">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Centro de Ayuda de Favo
          </h1>
          <p className="text-gray-600 text-lg">
            Todo lo que necesitas saber para aprovechar al máximo nuestra
            plataforma
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            ¿Qué es Favo?
          </h2>
          <p className="text-gray-700 mb-4">
            Favo es una plataforma argentina que conecta a personas que
            necesitan servicios con profesionales calificados. Ya sea que
            necesites un plomero, un profesor particular, un diseñador gráfico o
            cualquier otro servicio, Favo te ayuda a encontrar al profesional
            ideal para tu necesidad.
          </p>
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
            <div className="flex-1 bg-blue-50 p-4 rounded-lg text-center">
              <SearchIcon className="mx-auto text-blue-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-800">Busca servicios</h3>
              <p className="text-sm text-gray-600">
                Encuentra profesionales calificados
              </p>
            </div>
            <div className="flex-1 bg-blue-50 p-4 rounded-lg text-center">
              <MessageSquareIcon className="mx-auto text-blue-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-800">Contacta</h3>
              <p className="text-sm text-gray-600">Comunícate directamente</p>
            </div>
            <div className="flex-1 bg-blue-50 p-4 rounded-lg text-center">
              <CheckCircleIcon className="mx-auto text-blue-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-800">Contrata</h3>
              <p className="text-sm text-gray-600">
                Recibe el servicio que necesitas
              </p>
            </div>
          </div>
        </div>
        <HelpSection title="Mis Pedidos" icon={<ShoppingBagIcon size={24} className="text-blue-600" />} content={<div>
              <p className="mb-4">
                La sección "Mis Pedidos" te permite gestionar todas tus
                solicitudes de servicios:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Ver el historial completo de tus pedidos</li>
                <li>Revisar el estado de tus solicitudes actuales</li>
                <li>Publicar nuevas solicitudes de servicios</li>
                <li>
                  Calificar a los profesionales después de recibir un servicio
                </li>
              </ul>
              <div className="bg-gray-100 p-4 rounded-lg mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  ¿Cómo publicar un pedido?
                </h4>
                <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                  <li>
                    Haz clic en "Publicar pedido" en la sección de Mis Pedidos
                  </li>
                  <li>Describe detalladamente el servicio que necesitas</li>
                  <li>Especifica tu ubicación y disponibilidad</li>
                  <li>
                    Publica tu pedido y espera a que los profesionales te
                    contacten
                  </li>
                </ol>
              </div>
            </div>} />
        <HelpSection title="Mensajes" icon={<MessageSquareIcon size={24} className="text-blue-600" />} content={<div>
              <p className="mb-4">
                La sección "Mensajes" te permite comunicarte directamente con
                los profesionales:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Chatea en tiempo real con los proveedores de servicios</li>
                <li>Coordina detalles sobre el servicio que necesitas</li>
                <li>
                  Comparte información adicional o fotos para aclarar tus
                  necesidades
                </li>
                <li>
                  Recibe presupuestos y propuestas directamente en tu bandeja
                </li>
              </ul>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                <h4 className="font-semibold text-gray-800 flex items-center mb-2">
                  <span className="text-yellow-500 mr-2">Tip:</span>{' '}
                  Comunicación efectiva
                </h4>
                <p className="text-gray-700">
                  Proporciona información clara y detallada sobre tus
                  necesidades para recibir presupuestos más precisos y ahorrar
                  tiempo en la coordinación.
                </p>
              </div>
            </div>} />
        <HelpSection title="Perfil" icon={<UserIcon size={24} className="text-blue-600" />} content={<div>
              <p className="mb-4">
                Tu "Perfil" es tu identidad en Favo. Aquí puedes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Gestionar tu información personal y de contacto</li>
                <li>Ver tus calificaciones y reseñas si eres proveedor</li>
                <li>Actualizar tu foto de perfil y descripción</li>
                <li>Configurar tus preferencias de notificaciones</li>
                <li>Gestionar tus métodos de pago (si aplica)</li>
              </ul>
              <div className="bg-gray-100 p-4 rounded-lg mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Para proveedores de servicios:
                </h4>
                <p className="text-gray-700">
                  Si ofreces servicios en Favo, mantén tu perfil completo y
                  actualizado con tus habilidades, experiencia y fotos de
                  trabajos anteriores para aumentar tus posibilidades de ser
                  contratado.
                </p>
              </div>
            </div>} />
        <HelpSection title="Búsqueda de Servicios" icon={<SearchIcon size={24} className="text-blue-600" />} content={<div>
              <p className="mb-4">
                Favo te ofrece múltiples formas de encontrar el servicio que
                necesitas:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  Utiliza la barra de búsqueda para encontrar servicios
                  específicos
                </li>
                <li>
                  Explora por categorías populares como Tecnología, Hogar,
                  Educación y Salud
                </li>
                <li>
                  Descubre servicios tendencia basados en la demanda actual
                </li>
                <li>
                  Encuentra proveedores destacados con las mejores
                  calificaciones
                </li>
              </ul>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="font-semibold text-gray-800">Tecnología</p>
                  <p className="text-xs text-gray-600">234 servicios</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <p className="font-semibold text-gray-800">Hogar</p>
                  <p className="text-xs text-gray-600">186 servicios</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="font-semibold text-gray-800">Educación</p>
                  <p className="text-xs text-gray-600">158 servicios</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <p className="font-semibold text-gray-800">Salud</p>
                  <p className="text-xs text-gray-600">142 servicios</p>
                </div>
              </div>
            </div>} />
        <div className="bg-blue-800 rounded-lg shadow-md p-6 text-white mt-8">
          <h2 className="text-2xl font-bold mb-4">¿Necesitas más ayuda?</h2>
          <p className="mb-4">
            Si tienes alguna pregunta adicional o necesitas asistencia
            personalizada, no dudes en contactarnos.
          </p>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="bg-white text-blue-800 rounded-lg p-4 flex-1 text-center">
              <p className="font-semibold">Correo electrónico</p>
              <p>ayuda@favo.com</p>
            </div>
            <div className="bg-white text-blue-800 rounded-lg p-4 flex-1 text-center">
              <p className="font-semibold">Horario de atención</p>
              <p>Lunes a Viernes: 9:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}