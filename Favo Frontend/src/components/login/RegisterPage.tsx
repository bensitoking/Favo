import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, UserIcon, AlertCircleIcon, MapPinIcon } from 'lucide-react';
const API_URL =  'https://favo-iy6h.onrender.com';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [provincia, setProvincia] = useState('');
  const [barrio, setBarrio] = useState('');
  const [calle, setCalle] = useState('');
  const [altura, setAltura] = useState('');
  const [piso, setPiso] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    nombre: '',
    general: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      nombre: '',
      general: ''
    };
    let isValid = true;

    if (!nombre) {
      newErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo electrónico no es válido';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({...errors, general: ''});

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          nombre,
          provincia: provincia || undefined,
          barrio_zona: barrio || undefined,
          calle: calle || undefined,
          altura: altura || undefined,
          piso: piso ? parseInt(piso) : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en el registro');
      }

      // Automatically log in after registration
      const loginResponse = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Error al iniciar sesión después del registro');
      }

      const data = await loginResponse.json();
      localStorage.setItem('access_token', data.access_token);
      // Disparar manualmente el evento storage para que el header se actualice
      window.dispatchEvent(new StorageEvent('storage', { key: 'access_token', newValue: data.access_token }));
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en el registro';
      setErrors({
        ...errors,
        general: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-800 mb-3">
              Crear cuenta en Favo
            </h1>
            <p className="text-gray-600 text-lg">
              Únete a nuestra comunidad de servicios profesionales
            </p>
          </div>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
              <AlertCircleIcon size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-8 max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={20} className="text-gray-400" />
                  </div>
                  <input 
                    id="nombre" 
                    type="text" 
                    value={nombre} 
                    onChange={e => {
                      setNombre(e.target.value);
                      if (errors.nombre) setErrors({ ...errors, nombre: '' });
                    }} 
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200`} 
                    placeholder="Tu nombre completo" 
                  />
                </div>
                {errors.nombre && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircleIcon size={16} />
                    <span>{errors.nombre}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon size={20} className="text-gray-400" />
                  </div>
                  <input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={e => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }} 
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200`} 
                    placeholder="nombre@ejemplo.com" 
                  />
                </div>
                {errors.email && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircleIcon size={16} />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon size={20} className="text-gray-400" />
                  </div>
                  <input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={e => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }} 
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200`} 
                    placeholder="••••••••" 
                  />
                </div>
                {errors.password && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircleIcon size={16} />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ubicación (opcional)</span>
                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <div>
                  <label htmlFor="provincia" className="block text-sm font-medium text-gray-700 mb-1">
                    Provincia
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon size={20} className="text-gray-400" />
                    </div>
                    <input 
                      id="provincia"
                      type="text" 
                      value={provincia} 
                      onChange={e => setProvincia(e.target.value)} 
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200" 
                      placeholder="Ej: Buenos Aires"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="barrio" className="block text-sm font-medium text-gray-700 mb-1">
                    Barrio / Zona
                  </label>
                  <input 
                    id="barrio"
                    type="text" 
                    value={barrio} 
                    onChange={e => setBarrio(e.target.value)} 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200" 
                    placeholder="Ej: Almagro"
                  />
                </div>

                <div>
                  <label htmlFor="calle" className="block text-sm font-medium text-gray-700 mb-1">
                    Calle
                  </label>
                  <input 
                    id="calle"
                    type="text" 
                    value={calle} 
                    onChange={e => setCalle(e.target.value)} 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200" 
                    placeholder="Ej: Av. Corrientes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="altura" className="block text-sm font-medium text-gray-700 mb-1">
                      Altura
                    </label>
                    <input 
                      id="altura"
                      type="text" 
                      value={altura} 
                      onChange={e => setAltura(e.target.value)} 
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200" 
                      placeholder="Ej: 1234"
                    />
                  </div>
                  <div>
                    <label htmlFor="piso" className="block text-sm font-medium text-gray-700 mb-1">
                      Piso
                    </label>
                    <input 
                      id="piso"
                      type="number" 
                      value={piso} 
                      onChange={e => setPiso(e.target.value)} 
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200" 
                      placeholder="Ej: 3"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-800 text-white py-2.5 px-4 rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <a href="/login" className="font-medium text-blue-800 hover:text-blue-900 transition-colors duration-200">
                Inicia sesión
              </a>
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Al registrarte, aceptas nuestros{' '}
              <a href="#" className="text-blue-800 hover:text-blue-900">
                términos y condiciones
              </a>{' '}
              y{' '}
              <a href="#" className="text-blue-800 hover:text-blue-900">
                política de privacidad
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 bg-blue-800">
        <div className="h-full flex items-center justify-center p-12">
          <div className="max-w-lg text-center text-white">
            <h2 className="text-3xl font-bold mb-6">
              Conectamos necesidades con soluciones
            </h2>
            <p className="text-lg text-blue-100">
              Miles de personas confiables listas para ayudarte con
              cualquier servicio que necesites
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};