/**
 * Hook personalizado para obtener el token de autenticación
 * Busca en localStorage primero (para "Recordarme"), luego en sessionStorage
 */
export const useToken = (): string => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || '';
  return token;
};

/**
 * Función auxiliar para obtener el token de forma sincrónica
 */
export const getToken = (): string => {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || '';
};
