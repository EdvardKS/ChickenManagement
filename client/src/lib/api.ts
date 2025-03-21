/**
 * Función para manejar errores de respuesta HTTP
 * Extrae detalles del error y lanza una excepción enriquecida
 */
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

      // Incluir el cuerpo completo para referencia
      error.response = errorBody;

      // Personalizar mensajes específicos para errores comunes
      if (res.status === 401) {
        // Error de autenticación
        const defaultMessage = "Debe iniciar sesión para acceder a esta función";
        error.friendlyMessage = errorBody.details || defaultMessage;
        error.actionRequired = "login";

        // Redirigir a la página de inicio de sesión después de unos segundos
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 3000);
      } else if (res.status === 403) {
        // Error de autorización (permisos)
        const defaultMessage = "No tiene los permisos necesarios para realizar esta acción";
        error.friendlyMessage = errorBody.details || defaultMessage;
        error.actionRequired = "permissions";
      }

      console.error(`API Error [${res.status}]:`, errorBody);
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

          // Redirigir a la página de inicio de sesión después de unos segundos
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 3000);
        }

        console.error(`API Error [${res.status}]:`, text);
      } catch (textError) {
        // Si todo falla, crear un error genérico
        error = new Error(`${res.status}: ${res.statusText}`);
        error.status = res.status;
        error.statusText = res.statusText;
        error.url = res.url;

        if (res.status === 401) {
          error.friendlyMessage = "Sesión expirada o no disponible";
          error.actionRequired = "login";

          // Redirigir a la página de inicio de sesión después de unos segundos
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 3000);
        }

        console.error(`API Error [${res.status}] (no body)`, res.statusText);
      }
    }

    throw error;
  }
}

/**
 * Función para realizar peticiones a la API - Formato simple
 * Siempre usa el formato: (method, url, data)
 * @param method Método HTTP (GET, POST, PUT, PATCH, DELETE)
 * @param url URL del endpoint
 * @param data Datos a enviar (opcional)
 */
export async function api(
  method: string,
  url: string,
  data?: unknown,
): Promise<any> {
  const options: RequestInit = {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  };

  const res = await fetch(url, options);
  await throwIfResNotOk(res);

  try {
    return await res.json();
  } catch (e) {
    return res;
  }
}

/**
 * Función para realizar solicitudes GET a la API
 * @param url URL del endpoint
 */
export async function apiGet<T = any>(url: string): Promise<T> {
  return api("GET", url);
}

/**
 * Función para realizar solicitudes POST a la API
 * @param url URL del endpoint 
 * @param data Datos a enviar
 */
export async function apiPost<T = any>(url: string, data?: any): Promise<T> {
  return api("POST", url, data);
}

/**
 * Función para realizar solicitudes PATCH a la API
 * @param url URL del endpoint
 * @param data Datos a enviar
 */
export async function apiPatch<T = any>(url: string, data?: any): Promise<T> {
  return api("PATCH", url, data);
}

/**
 * Función para realizar solicitudes DELETE a la API
 * @param url URL del endpoint
 * @param data Datos a enviar (opcional)
 */
export async function apiDelete<T = any>(url: string, data?: any): Promise<T> {
  return api("DELETE", url, data);
}