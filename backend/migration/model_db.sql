-- 1. Tabla de Usuarios (Se mantiene intacta)
CREATE TABLE users (
    id_users SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Sitios Web (Con el JSON cacheado y URL opcional)
CREATE TABLE websites (
    id_web SERIAL PRIMARY KEY,
    id_users INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255), -- NULLABLE para desarrollo local sin problemas
    published_json JSONB, -- El Santo Grial: Aquí guardas el JSON ya armado al dar "Publicar"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE
);

-- 3. Tabla de API Keys (Soporta múltiples llaves, rotación y seguridad con hash)
CREATE TABLE api_keys (
    id_key SERIAL PRIMARY KEY,
    id_web INT NOT NULL,
    key_name VARCHAR(100) NOT NULL, -- Ej: 'Llave de Producción', 'Local'
    api_key_hash VARCHAR(255) NOT NULL UNIQUE, -- El hash SHA256 que validarás en FastAPI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP, -- Para que el usuario sepa si su cliente estático está consumiendo la API
    FOREIGN KEY (id_web) REFERENCES websites(id_web) ON DELETE CASCADE
);

-- 4. Tabla de Componentes / Campos del Editor
-- Sirve para que el usuario recupere sus inputs al abrir el panel de React
CREATE TABLE components (
    id_components SERIAL PRIMARY KEY,
    id_web INT NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    key_value TEXT,
    key_type VARCHAR(100), -- Ej: 'text', 'image'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_web) REFERENCES websites(id_web) ON DELETE CASCADE
);