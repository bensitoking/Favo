-- Tabla Ubicacion
CREATE TABLE Ubicacion (
    id_ubicacion BIGSERIAL PRIMARY KEY,
    provincia VARCHAR,
    calle VARCHAR,
    altura INTEGER,
    piso SMALLINT,
    barrio_zona TEXT
);

-- Tabla Usuario
CREATE TABLE Usuario (
    id_usuario BIGSERIAL PRIMARY KEY,
    nombre VARCHAR,
    password VARCHAR,
    verificado BOOLEAN DEFAULT FALSE,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    esProveedor BOOLEAN DEFAULT FALSE,
    esDemanda BOOLEAN DEFAULT FALSE,
    id_ubicacion BIGINT REFERENCES Ubicacion(id_ubicacion),
    foto_perfil BYTEA,
    mail TEXT UNIQUE
);

-- Tabla Categoria
CREATE TABLE Categoria (
    id_categoria BIGSERIAL PRIMARY KEY,
    nombre VARCHAR
);

-- Tabla Categoria_usuario
CREATE TABLE Categoria_usuario (
    id_categoria_usuario BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT REFERENCES Usuario(id_usuario),
    id_categoria BIGINT REFERENCES Categoria(id_categoria)
);

-- Tabla Pedido
CREATE TABLE Pedido (
    id_pedidos BIGSERIAL PRIMARY KEY,
    titulo VARCHAR,
    descripcion VARCHAR,
    precio FLOAT,
    id_usuario BIGINT REFERENCES Usuario(id_usuario),
    id_categoria BIGINT REFERENCES Categoria(id_categoria)
);

-- Tabla Servicio
CREATE TABLE Servicio (
    id_servicio BIGSERIAL PRIMARY KEY,
    titulo VARCHAR,
    descripcion VARCHAR,
    id_usuario BIGINT REFERENCES Usuario(id_usuario),
    id_categoria BIGINT REFERENCES Categoria(id_categoria)
);
