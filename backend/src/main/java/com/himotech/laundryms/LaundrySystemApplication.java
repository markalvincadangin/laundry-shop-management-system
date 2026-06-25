package com.himotech.laundryms;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.TimeZone;

@SpringBootApplication
@EnableAsync
@EnableAspectJAutoProxy
public class LaundrySystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(LaundrySystemApplication.class, args);
	}

	@PostConstruct
	public void init() {
		// Ensure the entire application uses UTC for internal logic and DB persistence
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
	}

}
