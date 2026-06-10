CREATE TABLE worker_profiles (
                                 id BIGSERIAL PRIMARY KEY,

                                 worker_id BIGINT NOT NULL UNIQUE,

                                 bio VARCHAR(500),

                                 experience_years INTEGER NOT NULL,

                                 city VARCHAR(100),

                                 state VARCHAR(100),

                                 profile_completed BOOLEAN NOT NULL DEFAULT FALSE,

                                 created_at TIMESTAMP NOT NULL,

                                 updated_at TIMESTAMP NOT NULL,

                                 CONSTRAINT fk_worker_profile_worker
                                     FOREIGN KEY (worker_id)
                                         REFERENCES users(id)
);