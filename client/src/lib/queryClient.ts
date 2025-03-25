import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Intentar obtener el cuerpo como JSON primero
    let error: any;
    let errorBody: any;
    
    try {
      // Intentar leer cuerpo como JSON
      const clonedRes = res.clone();  // Clonar para no consumir el body
      errorBody = await clonedRes.json();
      
      // Crear un error con los detalles disponibles
      const errorMessage = errorBody.error || errorBody.message || `${res.status}: ${res.statusText}`;
      error = new Error(errorMessage);
      
      // Agregar información adicional al objeto de error
      error.status = res.status;
      error.statusText = res.statusText;
      error.url = res.url;
      
      // Agregar todos los detalles recibidos del servidor
      if (errorBody.details) error.details = errorBody.details;
      if (errorBody.code) error.code = errorBody.code;
      if (errorBody.endpoint) error.endpoint = errorBody.endpoint;
      if (errorBody.role) error.role = errorBody.role;
      if (errorBody.stack && process.env.NODE_ENV !== 'production') error.serverStack = errorBody.stack;
      
      // Incluir el cuerpo completo para referencia
      error.response = errorBody;
      
      // Personalizar mensajes específicos para errores comunes - SIN redirecciones
      if (res.status === 401) {
        // Error de autenticación
        const defaultMessage = "Debe iniciar sesión para acceder a esta función";
        error.friendlyMessage = errorBody.details || defaultMessage;
        error.actionRequired = "login";
      } else if (res.status === 403) {
        // Error de autorización (permisos)
        const defaultMessage = "No tiene los permisos necesarios para realizar esta acción";
        error.friendlyMessage = errorBody.details || defaultMessage;
        error.actionRequired = "permissions";
      }
      
      console.error(`API Error [${res.status}]:`, errorBody);
      console.error('Detalles completos del error:', {
        status: res.status,
        statusText: res.statusText,
        url: res.url,
        body: errorBody,
        error: error
      });
    } catch (e) {
      // Si falla al leer como JSON, intentar leer como texto
      try {
        const text = await res.text() || res.statusText;
        error = new Error(`${res.status}: ${text}`);
        error.status = res.status;
        error.statusText = res.statusText;
        error.url = res.url;
        
        // Personalizar mensajes para errores comunes
        if (res.status === 401) {
          error.friendlyMessage = "Debe iniciar sesión para acceder a esta función";
          error.actionRequired = "login";
        }
        
        console.error(`API Error [${res.status}]:`, text);
        console.error('Detalles completos del error:', {
          status: res.status,
          statusText: res.statusText,
          url: res.url,
          text: text
        });
      } catch (textError) {
        // Si todo falla, crear un error genérico
        error = new Error(`${res.status}: ${res.statusText}`);
        error.status = res.status;
        error.statusText = res.statusText;
        error.url = res.url;
        
        if (res.status === 401) {
          error.friendlyMessage = "Sesión expirada o no disponible";
          error.actionRequired = "login";
        }
        
        console.error(`API Error [${res.status}] (no body)`, res.statusText);
        console.error('Detalles genéricos del error:', {
          status: res.status,
          statusText: res.statusText,
          url: res.url
        });
      }
    }
    
    throw error;
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit,
): Promise<any> {
  const res = await fetch(url, {
    credentials: "include",
    ...options
  });

  // Manejo especial para rutas públicas - no lanzar errores 401
  if (res.status === 401 && (
    url === '/api/auth/me' || 
    url === '/api/menus/featured' || 
    url === '/api/stock' || 
    url === '/api/business-hours' ||
    url.startsWith('/api/business-hours')
  )) {
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  await throwIfResNotOk(res);
  
  try {
    return await res.json();
  } catch (e) {
    // Si no se puede parsear como JSON, devuelve la respuesta directa
    return res;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const res = await fetch(url, {
      credentials: "include",
    });

    // Siempre devolver null para errores 401 en la ruta de auth/me
    if (res.status === 401 && (
      url === '/api/auth/me' || 
      url === '/api/menus/featured' || 
      url === '/api/stock' || 
      url === '/api/business-hours' ||
      url.startsWith('/api/business-hours')
    )) {
      return null;
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), // Cambiado para no lanzar errores 401
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
