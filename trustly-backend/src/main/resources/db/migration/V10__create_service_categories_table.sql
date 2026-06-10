CREATE TABLE service_categories
(
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    description VARCHAR(500),

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_service_category_name UNIQUE(name)
);

INSERT INTO service_categories
(name, description)
VALUES
    ('Electrician', 'Electrical services'),
    ('Plumber', 'Plumbing services'),
    ('Painter', 'Painting services'),
    ('Cleaner', 'Cleaning services'),
    ('Carpenter', 'Carpentry services');