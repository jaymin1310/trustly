ALTER TABLE worker_profiles
ADD COLUMN category_id BIGINT NOT NULL;

ALTER TABLE worker_profiles
ADD CONSTRAINT fk_worker_profile_category
FOREIGN KEY (category_id)
REFERENCES service_categories(id);