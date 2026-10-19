-- Compartir edición de proyectos: miembros + invitaciones (notificaciones)

CREATE TABLE project_members (
    id_members  SERIAL PRIMARY KEY,
    id_web      INT NOT NULL REFERENCES websites(id_web) ON DELETE CASCADE,
    id_users    INT NOT NULL REFERENCES users(id_users) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_web, id_users)
);

CREATE TABLE project_invitations (
    id_invitation SERIAL PRIMARY KEY,
    id_web        INT NOT NULL REFERENCES websites(id_web) ON DELETE CASCADE,
    id_inviter    INT NOT NULL REFERENCES users(id_users) ON DELETE CASCADE,
    id_invitee    INT NOT NULL REFERENCES users(id_users) ON DELETE CASCADE,
    status        VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_web, id_invitee)
);
