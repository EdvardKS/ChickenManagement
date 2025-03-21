import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Plus, UserCog, UserMinus, UserPlus } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { UserEditDialog } from '@/components/user-edit-dialog';

// Interfaz para el tipo de usuario
interface User {
  id: number;
  username: string;
  role: 'haykakan' | 'festero';
  name: string | null;
  email: string | null;
  phone: string | null;
  comparsaName: string | null;
  details: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Componente de gestión de usuarios festeros
function UsuariosTab() {
  const { toast } = useToast();
  const [showDeleted, setShowDeleted] = useState(false);
  const [showAdmins, setShowAdmins] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  // Consulta para obtener todos los usuarios
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/auth/users'],
    retry: false
  });

  // Mutación para activar/desactivar usuario
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return await apiRequest(`/api/auth/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: data.active ? 'Usuario activado' : 'Usuario desactivado',
        description: `El usuario ${data.username} ha sido ${data.active ? 'activado' : 'desactivado'} exitosamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Ha ocurrido un error. Inténtelo de nuevo más tarde.',
        variant: 'destructive',
      });
    },
  });

  const handleToggleActive = (user: User) => {
    toggleActiveMutation.mutate({ 
      id: user.id, 
      active: !user.active 
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:justify-between">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-deleted" 
              checked={showDeleted} 
              onCheckedChange={setShowDeleted} 
            />
            <Label htmlFor="show-deleted">Mostrar usuarios eliminados</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-admins" 
              checked={showAdmins} 
              onCheckedChange={setShowAdmins} 
            />
            <Label htmlFor="show-admins">Mostrar administradores (haykakan)</Label>
          </div>
        </div>

        <Button 
          onClick={handleCreateUser}
          className="bg-[#8B4513] text-white hover:bg-[#6d3610]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear Festero
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-2 font-medium">Usuario</th>
              <th className="p-2 font-medium">Rol</th>
              <th className="p-2 font-medium">Comparsa</th>
              <th className="p-2 font-medium">Email</th>
              <th className="p-2 font-medium">Teléfono</th>
              <th className="p-2 font-medium">Estado</th>
              <th className="p-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">Cargando usuarios...</td>
              </tr>
            ) : users && users.length > 0 ? (
              users
                .filter((user: User) => 
                  // Filtrar según el estado de los switches
                  (showAdmins || user.role === 'festero') && 
                  (showDeleted || user.active)
                )
                .map((user: User) => (
                  <tr key={user.id} className="border-t hover:bg-muted/50">
                    <td className="p-2">{user.username}</td>
                    <td className="p-2">{user.role === 'haykakan' ? 'Administrador' : 'Festero'}</td>
                    <td className="p-2">{user.comparsaName || 'N/A'}</td>
                    <td className="p-2">{user.email || 'N/A'}</td>
                    <td className="p-2">{user.phone || 'N/A'}</td>
                    <td className="p-2">
                      <span className={`rounded-full px-2 py-1 text-xs ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                          className={user.active ? 
                            "text-red-600 hover:text-red-800 hover:bg-red-50" : 
                            "text-green-600 hover:text-green-800 hover:bg-green-50"
                          }
                        >
                          {user.active ? (
                            <>
                              <UserMinus className="h-4 w-4 mr-1" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Activar
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center">No hay usuarios disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Diálogo para editar usuario existente */}
      <UserEditDialog 
        user={selectedUser}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Diálogo para crear nuevo usuario */}
      <UserEditDialog 
        isOpen={isCreateDialogOpen}
        isCreating={true}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}

// Componente para mostrar el calendario de pedidos
function CalendarioTab() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Establecer el rango para mostrar solo septiembre
  const from = new Date(new Date().getFullYear(), 8, 3); // 3 de septiembre
  const to = new Date(new Date().getFullYear(), 8, 10); // 10 de septiembre
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calendario de Fiestas</h1>
      <p className="text-muted-foreground">
        Visualiza los pedidos programados durante las fiestas (del 3 al 10 de septiembre).
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Septiembre {new Date().getFullYear()}</CardTitle>
          <CardDescription>
            Selecciona una fecha para ver los pedidos programados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            fromDate={from}
            toDate={to}
            initialFocus
          />
        </CardContent>
      </Card>

      {/* Aquí se podría mostrar los pedidos para la fecha seleccionada */}
      <Card>
        <CardHeader>
          <CardTitle>
            Pedidos para el {date?.toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta sección mostrará los pedidos programados para la fecha seleccionada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FiestasPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Fiestas</h2>
        <p className="text-muted-foreground">
          Administra usuarios festeros y visualiza pedidos durante las fiestas de Moros y Cristianos.
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="usuarios">Usuarios Festeros</TabsTrigger>
          <TabsTrigger value="calendario">Calendario de Pedidos</TabsTrigger>
        </TabsList>
        <TabsContent value="usuarios" className="mt-6">
          <UsuariosTab />
        </TabsContent>
        <TabsContent value="calendario" className="mt-6">
          <CalendarioTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}