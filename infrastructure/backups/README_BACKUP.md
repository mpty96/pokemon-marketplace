# Backup de base de datos PokeMarket

Este archivo explica cómo generar un respaldo completo de la base de datos PostgreSQL de PokeMarket.

## Requisitos

- Tener PostgreSQL instalado localmente.
- Tener disponible `pg_dump`.
- Tener acceso a la `DATABASE_URL` directa de producción.

## Comando recomendado

```bash
pg_dump "DATABASE_URL_DIRECTA?sslmode=require" -f "backend/backups/pokemarket_backup_FECHA.sql"