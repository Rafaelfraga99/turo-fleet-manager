package com.turofleet.controller;

import com.turofleet.model.Trip;
import com.turofleet.model.VehicleExpense;
import com.turofleet.repository.TripRepository;
import com.turofleet.repository.VehicleExpenseRepository;
import com.turofleet.service.VehicleAnalyticsService;
import com.turofleet.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class ReportController {

    private final TripRepository tripRepository;
    private final VehicleExpenseRepository expenseRepository;
    private final VehicleService vehicleService;
    private final VehicleAnalyticsService analyticsService;

    @GetMapping("/trips/csv")
    public ResponseEntity<byte[]> exportTrips() {
        List<Trip> trips = tripRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Reservation ID,Guest,Vehicle,Trip Start,Trip End,Status,Days,Trip Price,Total Earnings,Distance,Pickup Location\n");

        for (Trip t : trips) {
            csv.append(esc(t.getReservationId())).append(",");
            csv.append(esc(t.getGuest())).append(",");
            csv.append(esc(t.getVehicle() != null ? t.getVehicle().getVehicleName() : "")).append(",");
            csv.append(t.getTripStart() != null ? t.getTripStart().toString() : "").append(",");
            csv.append(t.getTripEnd() != null ? t.getTripEnd().toString() : "").append(",");
            csv.append(esc(t.getTripStatus())).append(",");
            csv.append(t.getTripDays() != null ? t.getTripDays() : "").append(",");
            csv.append(safe(t.getTripPrice())).append(",");
            csv.append(safe(t.getTotalEarnings())).append(",");
            csv.append(t.getDistanceTraveled() != null ? t.getDistanceTraveled() : "").append(",");
            csv.append(esc(t.getPickupLocation())).append("\n");
        }

        return csvResponse(csv.toString().getBytes(), "trips_export.csv");
    }

    @GetMapping("/expenses/csv")
    public ResponseEntity<byte[]> exportExpenses(@RequestParam(required = false) Long vehicleId) {
        List<VehicleExpense> expenses = vehicleId != null
                ? expenseRepository.findByVehicleIdOrderByExpenseDateDesc(vehicleId)
                : expenseRepository.findAll();

        StringBuilder csv = new StringBuilder();
        csv.append("Date,Category,Description,Amount,Vendor,Odometer,Notes\n");

        for (VehicleExpense e : expenses) {
            csv.append(e.getExpenseDate()).append(",");
            csv.append(e.getCategory()).append(",");
            csv.append(esc(e.getDescription())).append(",");
            csv.append(safe(e.getAmount())).append(",");
            csv.append(esc(e.getVendor())).append(",");
            csv.append(e.getOdometerAtExpense() != null ? e.getOdometerAtExpense() : "").append(",");
            csv.append(esc(e.getNotes())).append("\n");
        }

        return csvResponse(csv.toString().getBytes(), "expenses_export.csv");
    }

    @GetMapping("/profitability/csv")
    public ResponseEntity<byte[]> exportProfitability() {
        List<Map<String, Object>> vehicles = vehicleService.getVehicleSummaries();
        StringBuilder csv = new StringBuilder();
        csv.append("Vehicle,Year,Make,Model,Plate,Total Earnings,Completed Trips,Total Trips\n");

        for (Map<String, Object> v : vehicles) {
            csv.append(esc((String) v.get("vehicleName"))).append(",");
            csv.append(v.get("year")).append(",");
            csv.append(esc((String) v.get("make"))).append(",");
            csv.append(esc((String) v.get("model"))).append(",");
            csv.append(esc((String) v.get("licensePlate"))).append(",");
            csv.append(v.get("totalEarnings")).append(",");
            csv.append(v.get("completedTrips")).append(",");
            csv.append(v.get("totalTrips")).append("\n");
        }

        return csvResponse(csv.toString().getBytes(), "profitability_export.csv");
    }

    @GetMapping("/tax-summary")
    public Map<String, Object> getTaxSummary() {
        Map<String, Object> breakdown = analyticsService.getRevenueBreakdown();
        BigDecimal totalExpenses = expenseRepository.findAll().stream()
                .map(VehicleExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        breakdown.put("totalDeductibleExpenses", totalExpenses);
        breakdown.put("vehicleCount", vehicleService.findAll().size());
        return breakdown;
    }

    private ResponseEntity<byte[]> csvResponse(byte[] data, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    private String esc(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }

    private String safe(BigDecimal val) {
        return val != null ? val.toPlainString() : "0";
    }
}
