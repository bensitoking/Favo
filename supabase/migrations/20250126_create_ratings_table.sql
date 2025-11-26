-- Crear tabla de Ratings
CREATE TABLE IF NOT EXISTS Rating (
  id_rating SERIAL PRIMARY KEY,
  id_usuario_rated INTEGER NOT NULL REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
  id_usuario_rater INTEGER NOT NULL REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comentario TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_usuario_rated, id_usuario_rater)
);

-- Crear índices para queries frecuentes
CREATE INDEX idx_rating_usuario_rated ON Rating(id_usuario_rated);
CREATE INDEX idx_rating_usuario_rater ON Rating(id_usuario_rater);
CREATE INDEX idx_rating_fecha ON Rating(fecha_creacion DESC);
