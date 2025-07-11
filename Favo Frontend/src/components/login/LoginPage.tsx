import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, AlertCircleIcon } from 'lucide-react';

const API_URL =  'http://localhost:8000';

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: ''
    };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    try {
      const response = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Credenciales inválidas');
      }

      const { access_token } = await response.json();
      
      // Store token based on remember me choice
      if (rememberMe) {
        localStorage.setItem('access_token', access_token);
      } else {
        sessionStorage.setItem('access_token', access_token);
      }

      // Redirect to dashboard or intended page
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Error al iniciar sesión'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-800 mb-3">
              Bienvenido a Favo
            </h1>
            <p className="text-gray-600 text-lg">
              La plataforma líder de servicios profesionales en Argentina
            </p>
          </div>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
              <AlertCircleIcon size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200`} 
                    placeholder="nombre@ejemplo.com"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircleIcon size={16} />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

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
                    name="password"
                    type="password" 
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200`} 
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
                {errors.password && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircleIcon size={16} />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input 
                    id="remember-me" 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    className="h-4 w-4 text-blue-800 focus:ring-blue-800 border-gray-300 rounded transition-colors duration-200"
                    disabled={loading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Recordarme
                  </label>
                </div>
                <a 
                  href="/forgot-password" 
                  className="text-sm text-blue-800 hover:text-blue-900 transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center items-center bg-blue-800 text-white py-2.5 px-4 rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : 'Iniciar sesión'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              ¿No tenés una cuenta?{' '}
              <a 
                href="/register" 
                className="font-medium text-blue-800 hover:text-blue-900 transition-colors duration-200"
              >
                Registrate ahora
              </a>
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Al iniciar sesión, aceptás nuestros{' '}
              <a href="/terms" className="text-blue-800 hover:text-blue-900">
                términos y condiciones
              </a>{' '}
              y{' '}
              <a href="/privacy" className="text-blue-800 hover:text-blue-900">
                política de privacidad
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Marketing Content */}
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