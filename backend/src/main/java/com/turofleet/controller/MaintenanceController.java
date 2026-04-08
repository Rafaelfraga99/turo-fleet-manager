package com.turofleet.controller;

import com.turofleet.model.MaintenanceSchedule;
import com.turofleet.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping("/vehicles/{vehicleId}/maintenance")
    public List<MaintenanceSchedule> getByVehicle(@PathVariable Long vehicleId) {
        return maintenanceService.findByVehicleId(vehicleId);
    }

    @PostMapping("/vehicles/{vehicleId}/maintenance")
    public MaintenanceSchedule create(@PathVariable Long vehicleId, @RequestBody MaintenanceSchedule schedule) {
        return maintenanceService.create(vehicleId, schedule);
    }

    @PutMapping("/maintenance/{id}/complete")
    public MaintenanceSchedule markCompleted(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        LocalDate serviceDate = LocalDate.parse((String) body.get("serviceDate"));
        Integer serviceOdometer = body.get("serviceOdometer") != null ? ((Number) body.get("serviceOdometer")).intValue() : null;
        return maintenanceService.markCompleted(id, serviceDate, serviceOdometer);
    }

    @DeleteMapping("/maintenance/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        maintenanceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/maintenance/upcoming")
    public List<Map<String, Object>> getUpcoming() {
        return maintenanceService.getUpcomingMaintenance();
    }
}
