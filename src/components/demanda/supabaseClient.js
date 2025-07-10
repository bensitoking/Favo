import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wsdtyhtzshwtjnbizglr.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZHR5aHR6c2h3dGpuYml6Z2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTM1NjgsImV4cCI6MjA2NTM4OTU2OH0.6_LLtuM_bgjGNBKjLA9eh64USjTjA75TeQ1Lj8U9kLA'; 
export const supabase = createClient(supabaseUrl, supabaseKey);

// Función personalizada para login
export const loginUsuario = async (email, password) => {
  const { data, error } = await supabase
    .from('Usuario')
    .select('*')
    .eq('mail', email)
    .eq('password', password) // Nota: Esto no es seguro, lo mejoraremos
    .single();

  if (error) throw error;
  return data;
};

// Función para obtener sesión
export const getSession = () => {
  const session = localStorage.getItem('supabaseSession') || 
                  sessionStorage.getItem('supabaseSession');
  return session ? JSON.parse(session) : null;

  
};

// En supabaseClient.js
export const hashPassword = async (password) => {
    // Usar un método seguro para hashear contraseñas
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };
  
  // Luego modifica tu login:
  const handleSubmit = async (e) => {
    // ...
    const hashedPassword = await hashPassword(password);
    const usuario = await supabase
      .from('Usuario')
      .select('*')
      .eq('mail', email)
      .eq('password', hashedPassword) // Ahora comparamos con el hash
      .single();
    // ...
  };