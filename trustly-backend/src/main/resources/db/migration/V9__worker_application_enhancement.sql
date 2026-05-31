ALTER TABLE worker_applications
DROP CONSTRAINT worker_applications_user_id_key;

ALTER TABLE worker_applications
    ADD COLUMN document_type VARCHAR(30) NOT NULL DEFAULT 'AADHAAR';

ALTER TABLE worker_applications
    ADD COLUMN document_url TEXT;