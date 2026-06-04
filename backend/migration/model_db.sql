-- Tabla de Usuarios
CREATE TABLE users (
    id_users SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Sitios Web
CREATE TABLE websites (
    id_web SERIAL PRIMARY KEY,
    id_users INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE
);

-- Tabla de Componentes
CREATE TABLE components (
    id_components SERIAL PRIMARY KEY,
    id_web INT NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    key_value TEXT,
    key_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_web) REFERENCES websites(id_web) ON DELETE CASCADE
);
