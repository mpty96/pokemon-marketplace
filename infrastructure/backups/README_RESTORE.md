
---

## `README_RESTORE.md`

Explica cómo restaurar un backup en otra DB.

Ejemplo:

```md
# Restaurar base de datos PokeMarket

Este archivo explica cómo restaurar un backup `.sql` en una nueva base de datos PostgreSQL.

## Requisitos

- Tener PostgreSQL instalado.
- Tener disponible `psql`.
- Tener una nueva `DATABASE_URL`.
- Tener el archivo `.sql` de respaldo.

## Restaurar backup

```bash
psql "NUEVA_DATABASE_URL?sslmode=require" -f "backend/backups/pokemarket_pre_beta_backup.sql"