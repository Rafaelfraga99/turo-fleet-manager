package com.turofleet.controller;

import com.turofleet.model.BouncieToken;
import com.turofleet.model.Vehicle;
import com.turofleet.repository.VehicleRepository;
import com.turofleet.service.BouncieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bouncie")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class BouncieController {

    private final BouncieService bouncieService;
    private final VehicleRepository vehicleRepository;

    @GetMapping("/auth")
    public Map<String, String> getAuthUrl() {
        return Map.of("url", bouncieService.getAuthorizationUrl());
    }

    @GetMapping("/callback")
    public String handleCallback(@RequestParam String code) {
        try {
            BouncieToken token = bouncieService.exchangeCode(code);
            return "<html><body style='background:#0a0a0f;color:#34d399;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh'>" +
                    "<div style='text-align:center'><h1>Bouncie Connected!</h1><p>You can close this window.</p>" +
                    "<script>setTimeout(()=>window.close(),3000)</script></div></body></html>";
        } catch (Exception e) {
            return "<html><body style='background:#0a0a0f;color:#f87171;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh'>" +
                    "<div style='text-align:center'><h1>Connection Failed</h1><p>" + e.getMessage() + "</p></div></body></html>";
        }
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        return bouncieService.getStatus();
    }

    @GetMapping("/vehicles")
    public List<Map<String, Object>> getBouncieVehicles() {
        return bouncieService.getVehicles();
    }

    @PostMapping("/auto-link")
    public Map<String, Object> autoLinkByVin() {
        List<Map<String, Object>> bouncieVehicles = bouncieService.getVehicles();
        int linked = 0;
        List<String> linkedVehicles = new java.util.ArrayList<>();

        for (Map<String, Object> bv : bouncieVehicles) {
            String vin = (String) bv.get("vin");
            String imei = (String) bv.get("imei");
            if (vin == null || imei == null) continue;

            vehicleRepository.findByVin(vin).ifPresent(vehicle -> {
                if (vehicle.getBouncieDeviceId() == null || vehicle.getBouncieDeviceId().isEmpty()) {
                    vehicle.setBouncieDeviceId(imei);
                    vehicleRepository.save(vehicle);
                }
            });

            if (vehicleRepository.findByVin(vin).map(v -> v.getBouncieDeviceId() != null).orElse(false)) {
                linked++;
                linkedVehicles.add(vin);
            }
        }

        return Map.of("linked", linked, "totalBouncieDevices", bouncieVehicles.size(), "linkedVins", linkedVehicles);
    }

    @PostMapping("/link/{vehicleId}")
    public ResponseEntity<?> linkDevice(@PathVariable Long vehicleId, @RequestBody Map<String, String> body) {
        String deviceId = body.get("deviceId");
        if (deviceId == null) return ResponseEntity.badRequest().body(Map.of("error", "deviceId required"));

        return vehicleRepository.findById(vehicleId).map(vehicle -> {
            vehicle.setBouncieDeviceId(deviceId);
            vehicleRepository.save(vehicle);
            return ResponseEntity.ok(Map.of("message", "Device linked successfully", "vehicleId", vehicleId, "deviceId", deviceId));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vehicle/{vehicleId}/location")
    public ResponseEntity<Map<String, Object>> getVehicleLocation(@PathVariable Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null || vehicle.getBouncieDeviceId() == null) {
            return ResponseEntity.ok(Map.of("error", "Vehicle not linked to Bouncie device"));
        }
        Map<String, Object> data = bouncieService.getVehicleByImei(vehicle.getBouncieDeviceId());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/vehicle/{vehicleId}/trips")
    public ResponseEntity<List<Map<String, Object>>> getVehicleTrips(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "") String startDate,
            @RequestParam(defaultValue = "") String endDate) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null || vehicle.getBouncieDeviceId() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(bouncieService.getTrips(vehicle.getBouncieDeviceId(), startDate, endDate));
    }
}
