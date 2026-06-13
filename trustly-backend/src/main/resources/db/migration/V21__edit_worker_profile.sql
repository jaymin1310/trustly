ALTER TABLE worker_profiles
    ADD COLUMN average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00;

ALTER TABLE worker_profiles
    ADD COLUMN total_reviews INT NOT NULL DEFAULT 0;