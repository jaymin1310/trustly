CREATE TABLE otps (

                      id BIGSERIAL PRIMARY KEY,

                      code VARCHAR(6) NOT NULL,

                      type VARCHAR(30) NOT NULL,

                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                      expiry_time TIMESTAMP NOT NULL,

                      used BOOLEAN NOT NULL DEFAULT FALSE,

                      user_id BIGINT NOT NULL,

                      CONSTRAINT fk_otp_user
                          FOREIGN KEY (user_id)
                              REFERENCES users(id)
                              ON DELETE CASCADE
);