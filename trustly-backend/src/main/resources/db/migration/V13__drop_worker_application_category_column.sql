ALTER TABLE worker_applications
DROP COLUMN category;
ALTER TABLE worker_applications
ALTER COLUMN category_id SET NOT NULL;