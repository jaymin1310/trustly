ALTER TABLE worker_applications
    ADD COLUMN category_id BIGINT;

ALTER TABLE worker_applications
    ADD CONSTRAINT fk_worker_application_category
        FOREIGN KEY (category_id)
            REFERENCES service_categories(id);