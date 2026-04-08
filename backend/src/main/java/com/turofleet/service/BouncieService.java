package com.turofleet.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.turofleet.config.BouncieConfig;
import com.turofleet.model.BouncieToken;
import com.turofleet.repository.BouncieTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BouncieService {

    private final BouncieConfig config;
    private final BouncieTokenRepository tokenRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getAuthorizationUrl() {
        return config.getAuthUrl() + "/dialog/authorize" +
                "?response_type=code" +
                "&client_id=" + config.getClientId() +
                "&redirect_uri=" + config.getRedirectUri();
    }

    public BouncieToken exchangeCode(String code) {
        String url = config.getAuthUrl() + "/oauth/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = Map.of(
                "client_id", config.getClientId(),
                "client_secret", config.getClientSecret(),
                "grant_type", "authorization_code",
                "code", code,
                "redirect_uri", config.getRedirectUri()
        );

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
            Map<String, Object> data = response.getBody();
            if (data == null) throw new RuntimeException("Empty token response");

            BouncieToken token = BouncieToken.builder()
                    .accessToken((String) data.get("access_token"))
                    .refreshToken((String) data.get("refresh_token"))
                    .tokenType((String) data.get("token_type"))
                    .expiresIn(data.get("expires_in") != null ? ((Number) data.get("expires_in")).longValue() : 86400L)
                    .build();

            return tokenRepository.save(token);
        } catch (Exception e) {
            log.error("Failed to exchange OAuth code: {}", e.getMessage());
            throw new RuntimeException("OAuth token exchange failed: " + e.getMessage());
        }
    }

    public boolean isConnected() {
        return tokenRepository.findTopByOrderByCreatedAtDesc().isPresent();
    }

    private String getAccessToken() {
        BouncieToken token = tokenRepository.findTopByOrderByCreatedAtDesc()
                .orElseThrow(() -> new RuntimeException("Bouncie not connected. Please authorize first."));

        if (token.isExpired() && token.getRefreshToken() != null) {
            token = refreshAccessToken(token);
        }

        return token.getAccessToken();
    }

    private BouncieToken refreshAccessToken(BouncieToken token) {
        String url = config.getAuthUrl() + "/oauth/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = Map.of(
                "client_id", config.getClientId(),
                "client_secret", config.getClientSecret(),
                "grant_type", "refresh_token",
                "refresh_token", token.getRefreshToken()
        );

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
            Map<String, Object> data = response.getBody();
            if (data == null) throw new RuntimeException("Empty refresh response");

            BouncieToken newToken = BouncieToken.builder()
                    .accessToken((String) data.get("access_token"))
                    .refreshToken(data.get("refresh_token") != null ? (String) data.get("refresh_token") : token.getRefreshToken())
                    .tokenType((String) data.get("token_type"))
                    .expiresIn(data.get("expires_in") != null ? ((Number) data.get("expires_in")).longValue() : 3600L)
                    .build();

            return tokenRepository.save(newToken);
        } catch (Exception e) {
            log.error("Failed to refresh Bouncie token: {}", e.getMessage());
            throw new RuntimeException("Token refresh failed. Please re-authorize Bouncie.");
        }
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", getAccessToken());
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        return headers;
    }

    public List<Map<String, Object>> getVehicles() {
        String url = config.getApiUrl() + "/vehicles";
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(authHeaders()), String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            List<Map<String, Object>> vehicles = new ArrayList<>();
            if (root.isArray()) {
                for (JsonNode node : root) {
                    vehicles.add(objectMapper.convertValue(node, Map.class));
                }
            }
            return vehicles;
        } catch (Exception e) {
            log.error("Failed to fetch Bouncie vehicles: {}", e.getMessage());
            return List.of();
        }
    }

    public Map<String, Object> getVehicleByImei(String imei) {
        String url = config.getApiUrl() + "/vehicles?imei=" + imei;
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(authHeaders()), String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.isArray() && root.size() > 0) {
                return objectMapper.convertValue(root.get(0), Map.class);
            }
            return Map.of();
        } catch (Exception e) {
            log.error("Failed to fetch vehicle by IMEI: {}", e.getMessage());
            return Map.of();
        }
    }

    public List<Map<String, Object>> getTrips(String imei, String startDate, String endDate) {
        String url = config.getApiUrl() + "/trips?imei=" + imei +
                "&starts-after=" + startDate + "&ends-before=" + endDate;
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(authHeaders()), String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            List<Map<String, Object>> trips = new ArrayList<>();
            if (root.isArray()) {
                for (JsonNode node : root) {
                    trips.add(objectMapper.convertValue(node, Map.class));
                }
            }
            return trips;
        } catch (Exception e) {
            log.error("Failed to fetch Bouncie trips: {}", e.getMessage());
            return List.of();
        }
    }

    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("connected", isConnected());
        if (isConnected()) {
            BouncieToken token = tokenRepository.findTopByOrderByCreatedAtDesc().orElse(null);
            if (token != null) {
                status.put("connectedAt", token.getCreatedAt());
                status.put("expired", token.isExpired());
            }
            status.put("vehicleCount", getVehicles().size());
        }
        return status;
    }
}
