-- Agregar columna comment a la tabla rating
ALTER TABLE rating
ADD COLUMN comment TEXT DEFAULT NULL;
