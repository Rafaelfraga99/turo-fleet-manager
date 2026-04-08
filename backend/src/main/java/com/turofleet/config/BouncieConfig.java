package com.turofleet.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Data
@Configuration
@ConfigurationProperties(prefix = "bouncie")
public class BouncieConfig {
    private String clientId;
    private String clientSecret;
    private String apiKey;
    private String redirectUri;
    private String authUrl;
    private String apiUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
