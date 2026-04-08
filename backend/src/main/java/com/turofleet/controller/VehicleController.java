package com.turofleet.controller;

import com.turofleet.model.Vehicle;
import com.turofleet.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return vehicleService.getVehicleSummaries();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        var opt = vehicleService.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(vehicleService.getVehicleSummary(opt.get()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @RequestBody Vehicle details) {
        try {
            return ResponseEntity.ok(vehicleService.updateVehicle(id, details));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        return vehicleService.getDashboardStats();
    }
}
