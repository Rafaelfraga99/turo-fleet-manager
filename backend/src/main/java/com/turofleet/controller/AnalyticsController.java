package com.turofleet.controller;

import com.turofleet.dto.FleetAlert;
import com.turofleet.dto.MonthlyRevenue;
import com.turofleet.dto.VehiclePerformanceDTO;
import com.turofleet.service.VehicleAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class AnalyticsController {

    private final VehicleAnalyticsService analyticsService;

    @GetMapping("/vehicle-rankings")
    public List<VehiclePerformanceDTO> getVehicleRankings(@RequestParam(defaultValue = "healthScore") String sortBy) {
        return analyticsService.getVehicleRankings(sortBy);
    }

    @GetMapping("/vehicle/{id}/performance")
    public ResponseEntity<VehiclePerformanceDTO> getVehiclePerformance(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(analyticsService.getVehiclePerformance(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/fleet-health")
    public Map<String, Object> getFleetHealth() {
        return analyticsService.getFleetHealthSummary();
    }

    @GetMapping("/monthly-revenue")
    public List<MonthlyRevenue> getMonthlyRevenue() {
        return analyticsService.getMonthlyRevenue();
    }

    @GetMapping("/alerts")
    public List<FleetAlert> getAlerts() {
        return analyticsService.getAlerts();
    }

    @GetMapping("/revenue-breakdown")
    public Map<String, Object> getRevenueBreakdown() {
        return analyticsService.getRevenueBreakdown();
    }

    @GetMapping("/location-stats")
    public List<Map<String, Object>> getLocationStats() {
        return analyticsService.getLocationStats();
    }
}
