#!/bin/sh
set -e

# Esperar a que la base de datos esté lista
echo "Esperando a que la base de datos esté lista..."
for i in $(seq 1 30); do
  if pg_isready -h $PGHOST -p $PGPORT -U $PGUSER; then
    echo "La base de datos está lista!"
    break
  fi
  echo "Esperando a que la base de datos esté lista... $i/30"
  sleep 1
done

# Ejecutar el comando de migraciones
echo "Ejecutando migraciones..."
npm run db:push

# Iniciar la aplicación
echo "Iniciando la aplicación..."
exec "$@"