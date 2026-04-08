package com.turofleet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class TuroFleetManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(TuroFleetManagerApplication.class, args);
    }
}
