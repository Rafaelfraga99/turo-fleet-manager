package com.turofleet.service;

import com.turofleet.model.Vehicle;
import com.turofleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class BounceeSyncService {

    private final BouncieService bouncieService;
    private final VehicleRepository vehicleRepository;

    @Scheduled(fixedRate = 1800000) // 30 minutes
    public void syncAll() {
        if (!bouncieService.isConnected()) return;

        List<Map<String, Object>> bouncieVehicles;
        try {
            bouncieVehicles = bouncieService.getVehicles();
        } catch (Exception e) {
            log.error("Bouncie sync failed: {}", e.getMessage());
            return;
        }

        int synced = 0;
        for (Map<String, Object> bv : bouncieVehicles) {
            String imei = (String) bv.get("imei");
            if (imei == null) continue;

            List<Vehicle> vehicles = vehicleRepository.findAll().stream()
                    .filter(v -> imei.equals(v.getBouncieDeviceId()))
                    .toList();

            for (Vehicle vehicle : vehicles) {
                Map<String, Object> stats = (Map<String, Object>) bv.get("stats");
                if (stats == null) continue;

                // Update odometer
                Object odo = stats.get("odometer");
                if (odo != null) {
                    vehicle.setCurrentOdometer((int) Math.round(((Number) odo).doubleValue()));
                }

                vehicleRepository.save(vehicle);
                synced++;
            }
        }

        if (synced > 0) {
            log.info("Bouncie sync completed: {} vehicles updated", synced);
        }
    }
}
