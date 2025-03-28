import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import bcrypt from 'bcryptjs';
import { loginSchema, insertUserSchema } from '@shared/schema';
import { storage } from '../storage';

declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    role: 'haykakan' | 'festero';
  }
}

const router = Router();

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('Intento de inicio de sesión:', req.body);
    
    // Validar datos de entrada
    const validatedData = loginSchema.parse(req.body);
    console.log('Datos validados:', validatedData);
    
    // Buscar usuario por nombre de usuario
    const user = await storage.getUserByUsername(validatedData.username);
    if (!user) {
      console.log('Usuario no encontrado:', validatedData.username);
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    console.log('Usuario encontrado:', user.username, 'Rol:', user.role, 'Active:', user.active);
    
    // Verificar si el usuario está activo
    if (!user.active) {
      console.log('Usuario inactivo:', user.username);
      return res.status(401).json({ message: 'Usuario inactivo. Contacte al administrador.' });
    }
    
    // Verificar contraseña
    console.log('Intentando verificar contraseña para usuario:', user.username);
    const passwordMatch = await bcrypt.compare(validatedData.password, user.password);
    console.log('Resultado de verificación de contraseña:', passwordMatch);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    
    // Guardar información de usuario en la sesión
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    
    console.log('Sesión guardada:', req.session);
    
    // Enviar info de usuario sin contraseña
    const { password, ...userInfo } = user;
    res.json({ 
      user: userInfo,
      message: 'Inicio de sesión exitoso' 
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.log('Error de validación Zod:', error.errors);
      return res.status(400).json({ 
        message: 'Datos de entrada inválidos',
        errors: error.errors 
      });
    }
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  // Determinar si estamos en producción
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('🔒 Logout - Cerrando sesión del usuario:', req.session.username);
  console.log('🔒 Logout - Sesión actual:', req.session);
  
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Error al cerrar sesión:', err);
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    
    // Configurar las mismas opciones que en la creación de la cookie para su eliminación
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' as const : 'lax' as const,
      domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
    };
    
    console.log('🍪 Logout - Eliminando cookie con opciones:', cookieOptions);
    
    // Eliminar tanto el nombre de cookie personalizado como el predeterminado
    res.clearCookie('asador.sid', cookieOptions);
    res.clearCookie('connect.sid', cookieOptions); // Por si acaso queda alguna
    
    console.log('✅ Logout - Sesión cerrada correctamente');
    res.json({ message: 'Sesión cerrada correctamente' });
  });
});

// Get current user info
router.get('/me', async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  
  try {
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    const { password, ...userInfo } = user;
    res.json(userInfo);
  } catch (error) {
    console.error('Error al obtener información de usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  next();
};

// Middleware to check if user has admin role
export const isHaykakan = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔒 isHaykakan middleware - Verificando autenticación y rol');
  console.log('🔒 isHaykakan middleware - Sesión actual:', req.session);
  
  if (!req.session.userId) {
    console.error('❌ isHaykakan middleware - No hay sesión de usuario');
    return res.status(401).json({ 
      message: 'No autenticado',
      details: 'Debe iniciar sesión para acceder a esta función',
      code: 'AUTH_REQUIRED',
      endpoint: req.originalUrl
    });
  }
  
  console.log(`🔒 isHaykakan middleware - Usuario: ${req.session.username}, Rol: ${req.session.role}`);
  
  if (req.session.role !== 'haykakan') {
    console.error(`❌ isHaykakan middleware - Rol incorrecto: ${req.session.role}`);
    return res.status(403).json({ 
      message: 'No autorizado',
      details: 'Se requiere rol de administrador (haykakan) para esta operación',
      code: 'INSUFFICIENT_PERMISSIONS',
      role: req.session.role,
      endpoint: req.originalUrl
    });
  }
  
  console.log('✅ isHaykakan middleware - Autorización exitosa');
  next();
};

// Create first admin user if none exists
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    // Verificar si ya existe al menos un usuario
    const users = await storage.getAllUsers();
    if (users.length > 0) {
      return res.status(400).json({ message: 'Ya existen usuarios en el sistema' });
    }
    
    // Crear usuario administrador inicial
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await storage.createUser({
      username: 'admin',
      password: hashedPassword,
      role: 'haykakan',
      name: 'Administrador',
      email: 'admin@haykakan.com',
      active: true
    });
    
    const { password, ...userInfo } = adminUser;
    
    res.status(201).json({
      message: 'Usuario administrador creado exitosamente',
      user: userInfo
    });
  } catch (error) {
    console.error('Error al inicializar usuario admin:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Create new user (haykakan role required)
router.post('/users', isHaykakan, async (req: Request, res: Response) => {
  try {
    // Validar datos de entrada
    const userData = insertUserSchema.parse(req.body);
    
    // Verificar si ya existe un usuario con ese nombre
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: 'Nombre de usuario ya existe' });
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Crear usuario sin confirmPassword
    const { confirmPassword, ...userDataWithoutConfirm } = userData;
    const newUser = await storage.createUser({
      ...userDataWithoutConfirm,
      password: hashedPassword
    });
    
    // Enviar respuesta sin contraseña
    const { password, ...userInfo } = newUser;
    res.status(201).json(userInfo);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Datos de entrada inválidos',
        errors: error.errors 
      });
    }
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Get all users (haykakan role required)
router.get('/users', isHaykakan, async (req: Request, res: Response) => {
  try {
    // Obtener el parámetro de consulta para incluir inactivos 
    const showAll = req.query.showAll === 'true';
    
    // Obtener todos los usuarios
    const allUsers = await storage.getAllUsers();
    
    // Filtrar usuarios según el parámetro showAll
    const users = showAll 
      ? allUsers 
      : allUsers.filter(user => user.active);
    
    // Eliminar contraseñas de los datos
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Get festero users
router.get('/users/festeros', isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const festeros = await storage.getFesteroUsers();
    // Eliminar contraseñas de los datos
    const festerosSinPassword = festeros.map(user => {
      const { password, ...userInfo } = user;
      return userInfo;
    });
    
    res.json(festerosSinPassword);
  } catch (error) {
    console.error('Error al obtener usuarios festeros:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Update user
router.patch('/users/:id', isHaykakan, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    
    // Verificar si el usuario existe
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Procesar datos de actualización
    const updateData: any = { ...req.body };
    
    // Si hay nueva contraseña, hashearla
    if (updateData.password) {
      if (updateData.confirmPassword && updateData.password === updateData.confirmPassword) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
        delete updateData.confirmPassword;
      } else {
        return res.status(400).json({ message: 'Las contraseñas no coinciden' });
      }
    } else {
      // Si no hay contraseña nueva, eliminar estos campos
      delete updateData.password;
      delete updateData.confirmPassword;
    }
    
    // Actualizar usuario
    const updatedUser = await storage.updateUser(userId, updateData);
    
    // Enviar respuesta sin contraseña
    const { password, ...userInfo } = updatedUser;
    res.json(userInfo);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-active', isHaykakan, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    
    // Verificar si el usuario existe
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Invertir el estado active
    const newActiveStatus = !user.active;
    const updatedUser = await storage.updateUser(userId, { active: newActiveStatus });
    
    // Enviar respuesta sin contraseña
    const { password, ...userInfo } = updatedUser;
    
    res.json({
      ...userInfo,
      message: newActiveStatus ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente' 
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;