CREATE TABLE worker_applications
(
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    phone VARCHAR(20) NOT NULL,

    category VARCHAR(50) NOT NULL,

    experience_years INTEGER,

    address TEXT,

    document_number VARCHAR(100) NOT NULL,

    status VARCHAR(20) NOT NULL,

    admin_remark TEXT,

    reviewed_by BIGINT,

    reviewed_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_worker_application_user
        FOREIGN KEY (user_id)
            REFERENCES users(id),

    CONSTRAINT fk_worker_application_admin
        FOREIGN KEY (reviewed_by)
            REFERENCES users(id)
);