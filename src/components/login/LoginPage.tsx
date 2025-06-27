import React, { useState } from 'react';
import { MailIcon, LockIcon, AlertCircleIcon } from 'lucide-react';
export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const validateForm = () => {
    const newErrors = {
      email: '',
      password: ''
    };
    let isValid = true;
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
  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Login submitted:', {
        email,
        password,
        rememberMe
      });
    }
  };
  return <div className="flex min-h-[calc(100vh-64px)]">
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
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Google Sign In Button */}
            <button type="button" className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 mb-6">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5" />
              <span>Continuar con Google</span>
            </button>
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  o ingresá con tu email
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon size={20} className="text-gray-400" />
                  </div>
                  <input id="email" type="email" value={email} onChange={e => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({
                    ...errors,
                    email: ''
                  });
                }} className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200`} placeholder="nombre@ejemplo.com" />
                </div>
                {errors.email && <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircleIcon size={16} />
                    <span>{errors.email}</span>
                  </div>}
              </div>
              {/* Password input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon size={20} className="text-gray-400" />
                  </div>
                  <input id="password" type="password" value={password} onChange={e => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({
                    ...errors,
                    password: ''
                  });
                }} className={`block w-full pl-10 pr-3 py-2.5 border ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors duration-200`} placeholder="••••••••" />
                </div>
                {errors.password && <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircleIcon size={16} />
                    <span>{errors.password}</span>
                  </div>}
              </div>
              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="h-4 w-4 text-blue-800 focus:ring-blue-800 border-gray-300 rounded transition-colors duration-200" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Recordarme
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-800 hover:text-blue-900 transition-colors duration-200">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              {/* Submit button */}
              <button type="submit" className="w-full bg-blue-800 text-white py-2.5 px-4 rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 transition-colors duration-200 font-medium">
                Iniciar sesión
              </button>
            </form>
            {/* Sign up link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              ¿No tenés una cuenta?{' '}
              <a href="#" className="font-medium text-blue-800 hover:text-blue-900 transition-colors duration-200">
                Registrate ahora
              </a>
            </p>
          </div>
          {/* Trust indicators */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Al iniciar sesión, aceptás nuestros{' '}
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
      {/* Right side - Image */}
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
    </div>;
};