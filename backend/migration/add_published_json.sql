-- Agregar columna published_json a la tabla websites
ALTER TABLE websites ADD COLUMN IF NOT EXISTS published_json JSONB DEFAULT NULL;
