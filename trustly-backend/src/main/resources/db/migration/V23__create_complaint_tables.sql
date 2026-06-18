CREATE TABLE complaints (
                            id BIGSERIAL PRIMARY KEY,

                            customer_id BIGINT NOT NULL,
                            worker_profile_id BIGINT NOT NULL,
                            service_request_id BIGINT NOT NULL,

                            category VARCHAR(50) NOT NULL,
                            description VARCHAR(2000) NOT NULL,
                            status VARCHAR(30) NOT NULL,

                            resolution_note VARCHAR(2000),
                            resolved_by BIGINT,
                            resolved_at TIMESTAMP,

                            created_at TIMESTAMP NOT NULL,
                            updated_at TIMESTAMP,

                            CONSTRAINT uk_complaint_customer_service_request
                                UNIQUE (customer_id, service_request_id),

                            CONSTRAINT fk_complaint_customer
                                FOREIGN KEY (customer_id)
                                    REFERENCES users(id),

                            CONSTRAINT fk_complaint_worker_profile
                                FOREIGN KEY (worker_profile_id)
                                    REFERENCES worker_profiles(id),

                            CONSTRAINT fk_complaint_service_request
                                FOREIGN KEY (service_request_id)
                                    REFERENCES service_requests(id),

                            CONSTRAINT fk_complaint_resolved_by
                                FOREIGN KEY (resolved_by)
                                    REFERENCES users(id)
);

CREATE INDEX idx_complaint_status
    ON complaints(status);

CREATE INDEX idx_complaint_customer
    ON complaints(customer_id);

CREATE INDEX idx_complaint_worker_profile
    ON complaints(worker_profile_id);

CREATE INDEX idx_complaint_service_request
    ON complaints(service_request_id);

CREATE TABLE complaint_evidences (
                                     id BIGSERIAL PRIMARY KEY,

                                     complaint_id BIGINT NOT NULL,

                                     file_url VARCHAR(1000) NOT NULL,
                                     public_id VARCHAR(500) NOT NULL,
                                     file_type VARCHAR(30) NOT NULL,

                                     uploaded_at TIMESTAMP NOT NULL,

                                     CONSTRAINT fk_complaint_evidence_complaint
                                         FOREIGN KEY (complaint_id)
                                             REFERENCES complaints(id)
);

CREATE INDEX idx_complaint_evidence_complaint
    ON complaint_evidences(complaint_id);

CREATE TABLE worker_penalties (
                                  id BIGSERIAL PRIMARY KEY,

                                  worker_profile_id BIGINT NOT NULL,
                                  complaint_id BIGINT NOT NULL,
                                  admin_id BIGINT NOT NULL,

                                  action VARCHAR(50) NOT NULL,
                                  status VARCHAR(30) NOT NULL,
                                  reason VARCHAR(2000) NOT NULL,

                                  start_at TIMESTAMP,
                                  end_at TIMESTAMP,
                                  created_at TIMESTAMP NOT NULL,

                                  CONSTRAINT fk_worker_penalty_worker_profile
                                      FOREIGN KEY (worker_profile_id)
                                          REFERENCES worker_profiles(id),

                                  CONSTRAINT fk_worker_penalty_complaint
                                      FOREIGN KEY (complaint_id)
                                          REFERENCES complaints(id),

                                  CONSTRAINT fk_worker_penalty_admin
                                      FOREIGN KEY (admin_id)
                                          REFERENCES users(id)
);

CREATE INDEX idx_worker_penalty_worker
    ON worker_penalties(worker_profile_id);

CREATE INDEX idx_worker_penalty_status
    ON worker_penalties(status);
