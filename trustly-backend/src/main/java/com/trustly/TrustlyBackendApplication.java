package com.trustly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TrustlyBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TrustlyBackendApplication.class, args);
	}

}
