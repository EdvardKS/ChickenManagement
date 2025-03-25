import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Loader } from '@/components/ui/loader';

// Tipo para el usuario
type User = {
  id: number;
  username: string;
  role: 'haykakan' | 'festero';
  name: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

// Tipo para el contexto de autenticación
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHaykakan: boolean;
  isFestero: boolean;
  logout: () => Promise<void>;
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Proveedor de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Consulta para obtener información del usuario actual
  const { data, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/auth/me');
        if (response && response.id) {
          return response as User;
        }
        return null;
      } catch (error) {
        // Si hay un error, devolver null en lugar de lanzar el error
        return null;
      }
    },
    retry: false, // No reintentar si falla
    refetchOnWindowFocus: true, // Recargar cuando la ventana tenga foco
  });
  
  // Asegurarnos de que user sea siempre User | null
  const user: User | null = data || null;

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.clear(); // Limpiar todas las consultas
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún si hay error, invalidar la caché y redirigir al login
      queryClient.clear();
      navigate('/login');
    }
  };

  // Detectar cuando termina la carga inicial
  useEffect(() => {
    if (!isLoading) {
      setIsInitialLoad(false);
    }
  }, [isLoading]);

  // Durante la carga inicial, mostrar un spinner
  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  const authValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isHaykakan: user?.role === 'haykakan',
    isFestero: user?.role === 'festero',
    logout,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

// Componente de ruta protegida para cualquier usuario autenticado
export function ProtectedRoute({ 
  children,
  redirectTo = '/login',
}: { 
  children: ReactNode;
  redirectTo?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}

// Componente de ruta protegida solo para administradores
export function HaykakanRoute({ 
  children,
  redirectTo = '/admin',
}: { 
  children: ReactNode;
  redirectTo?: string;
}) {
  const { isHaykakan, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isHaykakan) {
      navigate(redirectTo);
    }
  }, [isHaykakan, isLoading, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return isHaykakan ? <>{children}</> : null;
}