# Production Deployment Guide

This document provides instructions for deploying the Restaurant Management System in a production environment using Docker.

## Prerequisites

- Docker installed on your server
- Docker Compose installed on your server
- Git installed on your server

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Configure Environment Variables

Edit the `.env` file to configure your production environment:

```bash
# Make a copy of the example .env file
cp .env.example .env

# Edit the .env file with your production values
nano .env
```

Important variables to change:
- `SESSION_SECRET`: Set a strong, unique secret for session encryption
- `POSTGRES_PASSWORD`: Set a strong password for the PostgreSQL database
- Update the `DATABASE_URL` with the correct password if you changed it

### 3. Start the Application

Run the application using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Build the application container
- Start a PostgreSQL database container
- Create a network for the containers to communicate
- Set up a persistent volume for the database

### 4. Database Migration

To initialize the database schema, run:

```bash
docker-compose exec app npm run db:push
```

### 5. Access the Application

The application will be available at:

```
http://your-server-ip:5000
```

### 6. Monitoring and Logs

To view logs:

```bash
# View all logs
docker-compose logs

# View application logs
docker-compose logs app

# Follow logs in real-time
docker-compose logs -f
```

### 7. Stopping and Restarting

To stop the application:

```bash
docker-compose down
```

To restart the application:

```bash
docker-compose up -d
```

### 8. Updating the Application

To update with new code:

```bash
git pull
docker-compose build
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues

If the application can't connect to the database:

1. Check if the PostgreSQL container is running:
   ```bash
   docker-compose ps
   ```

2. Verify the database connection details in the `.env` file

3. Check the logs for specific error messages:
   ```bash
   docker-compose logs app
   ```

### Application Not Starting

1. Check the application logs:
   ```bash
   docker-compose logs app
   ```

2. Make sure all environment variables are properly set in the `.env` file

3. Try rebuilding the application:
   ```bash
   docker-compose build app
   docker-compose up -d
   ```

## Backing Up Data

To back up the PostgreSQL database:

```bash
docker-compose exec postgres pg_dump -U postgres restaurant > backup.sql
```

To restore a backup:

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres restaurant
```