# Instrucciones de Despliegue - Asador La Morenica

Este documento proporciona las instrucciones para desplegar la aplicación de gestión del Asador La Morenica en un entorno de producción utilizando Docker.

## Requisitos Previos

- Docker instalado en el servidor
- Docker Compose instalado en el servidor
- Git instalado en el servidor (opcional, si se desea clonar el repositorio)

## Pasos de Despliegue

### 1. Preparar los Archivos

Asegúrate de tener todos los archivos necesarios en tu servidor:
- Dockerfile
- docker-compose.yml
- docker-entrypoint.sh
- .env (con las variables de entorno correctas)
- El código fuente de la aplicación

### 2. Variables de Entorno

El archivo `.env` ya está configurado con los valores necesarios para el despliegue en producción. Si necesitas modificar algún valor, edita este archivo antes de iniciar la aplicación.

### 3. Iniciar la Aplicación

Para iniciar la aplicación, ejecuta el siguiente comando en el directorio donde se encuentran los archivos:

```bash
docker-compose up -d
```

Este comando hará lo siguiente:
- Construirá la imagen de la aplicación (si no existe)
- Creará un contenedor PostgreSQL para la base de datos
- Iniciará todos los servicios definidos en el docker-compose.yml
- Configurará la red necesaria para la comunicación entre contenedores

### 4. Verificar el Estado

Para verificar que todos los servicios están funcionando correctamente, ejecuta:

```bash
docker-compose ps
```

### 5. Ver Logs

Si necesitas ver los logs de la aplicación, puedes usar:

```bash
# Ver logs de la aplicación
docker-compose logs app

# Ver logs de la base de datos
docker-compose logs db

# Ver logs en tiempo real
docker-compose logs -f
```

### 6. Acceder a la Aplicación

Una vez que la aplicación esté en funcionamiento, puedes acceder a ella a través de:

```
http://tu-servidor:2025
```

O en la dirección IP o dominio configurado en tu servidor con el puerto 2025.

### 7. Detener la Aplicación

Si necesitas detener la aplicación, ejecuta:

```bash
docker-compose down
```

Si también quieres eliminar los volúmenes (esto eliminaría la base de datos), ejecuta:

```bash
docker-compose down -v
```

### 8. Actualizaciones

Para actualizar la aplicación con cambios en el código:

```bash
# Detener los contenedores
docker-compose down

# Reconstruir la imagen (si hay cambios en el Dockerfile)
docker-compose build

# Iniciar los servicios nuevamente
docker-compose up -d
```

## Solución de Problemas

### Problemas de Conexión a la Base de Datos

Si la aplicación no puede conectarse a la base de datos:

1. Verifica que el contenedor de PostgreSQL esté funcionando:
   ```bash
   docker-compose ps
   ```

2. Comprueba los logs de la base de datos:
   ```bash
   docker-compose logs db
   ```

3. Asegúrate de que las variables de entorno en el archivo `.env` son correctas, especialmente `DATABASE_URL`, `PGHOST`, `PGUSER`, `PGPASSWORD` y `PGDATABASE`.

### La Aplicación No Inicia

Si la aplicación no inicia correctamente:

1. Revisa los logs de la aplicación:
   ```bash
   docker-compose logs app
   ```

2. Verifica que el script de entrada (docker-entrypoint.sh) tiene permisos de ejecución:
   ```bash
   docker-compose exec app ls -l /usr/local/bin/docker-entrypoint.sh
   ```

## Copias de Seguridad

Para realizar una copia de seguridad de la base de datos:

```bash
docker-compose exec db pg_dump -U postgres chickens > backup_$(date +%Y%m%d).sql
```

Para restaurar una copia de seguridad:

```bash
cat backup.sql | docker-compose exec -T db psql -U postgres chickens
```