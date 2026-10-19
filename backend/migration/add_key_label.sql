-- Añade etiqueta legible por campo (label) al editor y al JSON publicado.
-- Aplicada en Neon: proyecto cms-db → base de datos neondb.

ALTER TABLE components ADD COLUMN IF NOT EXISTS key_label VARCHAR(255);

-- Backfill: las claves existentes se usan como etiqueta inicial.
UPDATE components SET key_label = key_name WHERE key_label IS NULL;
