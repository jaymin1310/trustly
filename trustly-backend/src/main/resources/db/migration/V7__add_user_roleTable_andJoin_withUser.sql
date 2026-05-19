-- Create user_roles table
CREATE TABLE user_roles (
                            user_id BIGINT NOT NULL,
                            role VARCHAR(50) NOT NULL,

                            CONSTRAINT fk_user_roles_user
                                FOREIGN KEY (user_id)
                                    REFERENCES users(id)
                                    ON DELETE CASCADE
);

-- Move existing role data from users.role
INSERT INTO user_roles (user_id, role)
SELECT id, role
FROM users;

-- Remove old role column
ALTER TABLE users
DROP COLUMN role;