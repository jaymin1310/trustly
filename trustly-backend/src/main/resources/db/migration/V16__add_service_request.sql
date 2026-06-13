CREATE TABLE service_requests (
                                  id BIGSERIAL PRIMARY KEY,

                                  customer_id BIGINT NOT NULL,
                                  worker_profile_id BIGINT NOT NULL,
                                  category_id BIGINT NOT NULL,

                                  description VARCHAR(1000),

                                  status VARCHAR(40) NOT NULL,

                                  worker_remark VARCHAR(500),

                                  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  responded_at TIMESTAMP NULL,
                                  completed_at TIMESTAMP NULL,

                                  CONSTRAINT fk_service_request_customer
                                      FOREIGN KEY (customer_id)
                                          REFERENCES users(id),

                                  CONSTRAINT fk_service_request_worker_profile
                                      FOREIGN KEY (worker_profile_id)
                                          REFERENCES worker_profiles(id),

                                  CONSTRAINT fk_service_request_category
                                      FOREIGN KEY (category_id)
                                          REFERENCES service_categories(id)
);