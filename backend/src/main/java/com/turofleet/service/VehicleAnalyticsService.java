package com.turofleet.service;

import com.turofleet.dto.FleetAlert;
import com.turofleet.dto.MonthlyRevenue;
import com.turofleet.dto.VehiclePerformanceDTO;
import com.turofleet.model.Trip;
import com.turofleet.model.Vehicle;
import com.turofleet.repository.TripRepository;
import com.turofleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleAnalyticsService {

    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;

    public List<VehiclePerformanceDTO> getVehicleRankings(String sortBy) {
        List<VehiclePerformanceDTO> rankings = new ArrayList<>();

        for (Vehicle v : vehicleRepository.findAll()) {
            rankings.add(buildPerformanceDTO(v));
        }

        Comparator<VehiclePerformanceDTO> comparator = switch (sortBy != null ? sortBy : "healthScore") {
            case "revenuePerDay" -> Comparator.comparing(VehiclePerformanceDTO::getRevenuePerDay).reversed();
            case "completionRate" -> Comparator.comparingDouble(VehiclePerformanceDTO::getCompletionRate).reversed();
            case "totalEarnings" -> Comparator.comparing(VehiclePerformanceDTO::getTotalEarnings).reversed();
            default -> Comparator.comparingInt(VehiclePerformanceDTO::getHealthScore).reversed();
        };

        rankings.sort(comparator);
        return rankings;
    }

    public VehiclePerformanceDTO getVehiclePerformance(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        return buildPerformanceDTO(vehicle);
    }

    public Map<String, Object> getFleetHealthSummary() {
        List<VehiclePerformanceDTO> all = getVehicleRankings("healthScore");

        long topPerformers = all.stream().filter(v -> "TOP_PERFORMER".equals(v.getHealthCategory())).count();
        long needsAttention = all.stream().filter(v -> "NEEDS_ATTENTION".equals(v.getHealthCategory())).count();
        long critical = all.stream().filter(v -> "CRITICAL".equals(v.getHealthCategory())).count();

        double avgHealth = all.stream().mapToInt(VehiclePerformanceDTO::getHealthScore).average().orElse(0);

        BigDecimal avgRevenuePerDay = all.stream()
                .map(VehiclePerformanceDTO::getRevenuePerDay)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(Math.max(all.size(), 1)), 2, RoundingMode.HALF_UP);

        Map<String, Object> summary = new HashMap<>();
        summary.put("avgHealthScore", Math.round(avgHealth));
        summary.put("topPerformers", topPerformers);
        summary.put("needsAttention", needsAttention);
        summary.put("critical", critical);
        summary.put("totalVehicles", all.size());
        summary.put("avgRevenuePerDay", avgRevenuePerDay);
        return summary;
    }

    public List<MonthlyRevenue> getMonthlyRevenue() {
        List<Trip> allTrips = tripRepository.findAll();
        Map<String, MonthlyRevenue> monthMap = new TreeMap<>();

        for (Trip t : allTrips) {
            if (t.getTripStart() == null) continue;
            String ym = YearMonth.from(t.getTripStart()).format(DateTimeFormatter.ofPattern("yyyy-MM"));

            MonthlyRevenue mr = monthMap.computeIfAbsent(ym, k ->
                    MonthlyRevenue.builder().yearMonth(k).revenue(BigDecimal.ZERO).build());

            mr.setTripCount(mr.getTripCount() + 1);
            mr.setRevenue(mr.getRevenue().add(t.getTotalEarnings() != null ? t.getTotalEarnings() : BigDecimal.ZERO));

            if ("Completed".equals(t.getTripStatus())) {
                mr.setCompletedCount(mr.getCompletedCount() + 1);
            } else if (t.getTripStatus() != null && t.getTripStatus().contains("cancellation")) {
                mr.setCancelledCount(mr.getCancelledCount() + 1);
            }
        }

        return new ArrayList<>(monthMap.values());
    }

    public List<FleetAlert> getAlerts() {
        List<FleetAlert> alerts = new ArrayList<>();
        List<VehiclePerformanceDTO> rankings = getVehicleRankings("healthScore");

        BigDecimal avgRevPerDay = rankings.stream()
                .map(VehiclePerformanceDTO::getRevenuePerDay)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(Math.max(rankings.size(), 1)), 2, RoundingMode.HALF_UP);

        for (VehiclePerformanceDTO v : rankings) {
            // Critical: 100% cancellation
            if (v.getTotalTrips() > 0 && v.getCompletionRate() == 0) {
                alerts.add(FleetAlert.builder()
                        .type("CRITICAL")
                        .message(v.getVehicleName() + ": 0% completion rate across " + v.getTotalTrips() + " trips")
                        .vehicleId(v.getId())
                        .vehicleName(v.getVehicleName())
                        .build());
            }
            // Critical: health score < 30
            else if (v.getHealthScore() < 30 && v.getTotalTrips() > 0) {
                alerts.add(FleetAlert.builder()
                        .type("CRITICAL")
                        .message(v.getVehicleName() + ": health score " + v.getHealthScore() + "/100 — consider removing from fleet")
                        .vehicleId(v.getId())
                        .vehicleName(v.getVehicleName())
                        .build());
            }

            // Warning: cancellation rate > 40%
            if (v.getCompletionRate() > 0 && v.getCompletionRate() < 60 && v.getTotalTrips() >= 3) {
                alerts.add(FleetAlert.builder()
                        .type("WARNING")
                        .message(v.getVehicleName() + ": " + String.format("%.0f", v.getCompletionRate()) + "% completion rate — review pricing or listing")
                        .vehicleId(v.getId())
                        .vehicleName(v.getVehicleName())
                        .build());
            }

            // Warning: revenue per day below fleet average
            if (v.getRevenuePerDay().compareTo(avgRevPerDay) < 0 && v.getTotalTripDays() > 5) {
                alerts.add(FleetAlert.builder()
                        .type("WARNING")
                        .message(v.getVehicleName() + ": $" + v.getRevenuePerDay() + "/day — below fleet avg of $" + avgRevPerDay + "/day")
                        .vehicleId(v.getId())
                        .vehicleName(v.getVehicleName())
                        .build());
            }

            // Consecutive cancellations check
            List<Trip> vehicleTrips = tripRepository.findByVehicleIdOrderByTripStartDesc(v.getId());
            int consecutive = 0;
            for (Trip t : vehicleTrips) {
                if (t.getTripStatus() != null && t.getTripStatus().contains("cancellation")) {
                    consecutive++;
                } else {
                    break;
                }
            }
            if (consecutive >= 3) {
                alerts.add(FleetAlert.builder()
                        .type("CRITICAL")
                        .message(v.getVehicleName() + ": " + consecutive + " consecutive cancellations — investigate immediately")
                        .vehicleId(v.getId())
                        .vehicleName(v.getVehicleName())
                        .build());
            }
        }

        // Compliance alerts
        for (Vehicle vehicle : vehicleRepository.findAll()) {
            LocalDate now = LocalDate.now();
            checkComplianceDate(alerts, vehicle, vehicle.getRegistrationExpiry(), "Registration", now);
            checkComplianceDate(alerts, vehicle, vehicle.getInsuranceExpiry(), "Insurance", now);
            checkComplianceDate(alerts, vehicle, vehicle.getInspectionExpiry(), "Inspection", now);
        }

        // Info: top performers
        rankings.stream()
                .filter(v -> "TOP_PERFORMER".equals(v.getHealthCategory()))
                .limit(3)
                .forEach(v -> alerts.add(FleetAlert.builder()
                        .type("INFO")
                        .message(v.getVehicleName() + ": top performer — $" + v.getRevenuePerDay() + "/day, " + String.format("%.0f", v.getCompletionRate()) + "% completion")
                        .vehicleId(v.getId())
                        .vehicleName(v.getVehicleName())
                        .build()));

        alerts.sort(Comparator.comparingInt(a -> switch (a.getType()) {
            case "CRITICAL" -> 0;
            case "WARNING" -> 1;
            default -> 2;
        }));

        return alerts;
    }

    public Map<String, Object> getRevenueBreakdown() {
        List<Trip> allTrips = tripRepository.findAll();
        BigDecimal tripPrice = BigDecimal.ZERO, tolls = BigDecimal.ZERO, gas = BigDecimal.ZERO;
        BigDecimal extras = BigDecimal.ZERO, delivery = BigDecimal.ZERO, cancellation = BigDecimal.ZERO;
        BigDecimal lateFees = BigDecimal.ZERO, cleaning = BigDecimal.ZERO, discounts = BigDecimal.ZERO;
        BigDecimal additionalUsage = BigDecimal.ZERO, excessDistance = BigDecimal.ZERO;

        for (Trip t : allTrips) {
            tripPrice = tripPrice.add(safe(t.getTripPrice()));
            tolls = tolls.add(safe(t.getTollsAndTickets()));
            gas = gas.add(safe(t.getGasReimbursement()));
            extras = extras.add(safe(t.getExtras()));
            delivery = delivery.add(safe(t.getDelivery()));
            cancellation = cancellation.add(safe(t.getCancellationFee()));
            lateFees = lateFees.add(safe(t.getLateFee()));
            cleaning = cleaning.add(safe(t.getCleaning()));
            additionalUsage = additionalUsage.add(safe(t.getAdditionalUsage()));
            excessDistance = excessDistance.add(safe(t.getExcessDistance()));
            discounts = discounts.add(safe(t.getThreeDayDiscount()))
                    .add(safe(t.getOneWeekDiscount())).add(safe(t.getTwoWeekDiscount()))
                    .add(safe(t.getThreeWeekDiscount())).add(safe(t.getOneMonthDiscount()))
                    .add(safe(t.getEarlyBirdDiscount())).add(safe(t.getNonRefundableDiscount()));
        }

        Map<String, Object> breakdown = new LinkedHashMap<>();
        breakdown.put("tripPrice", tripPrice);
        breakdown.put("tollsAndTickets", tolls);
        breakdown.put("gasReimbursement", gas);
        breakdown.put("extras", extras);
        breakdown.put("delivery", delivery);
        breakdown.put("cancellationFees", cancellation);
        breakdown.put("lateFees", lateFees);
        breakdown.put("cleaning", cleaning);
        breakdown.put("additionalUsage", additionalUsage);
        breakdown.put("excessDistance", excessDistance);
        breakdown.put("discounts", discounts);
        breakdown.put("total", tripRepository.sumTotalEarnings());
        return breakdown;
    }

    public List<Map<String, Object>> getLocationStats() {
        List<Trip> completedTrips = tripRepository.findByTripStatus("Completed");
        Map<String, List<Trip>> byLocation = completedTrips.stream()
                .filter(t -> t.getPickupLocation() != null)
                .collect(Collectors.groupingBy(Trip::getPickupLocation));

        return byLocation.entrySet().stream()
                .map(e -> {
                    Map<String, Object> stat = new HashMap<>();
                    stat.put("location", e.getKey());
                    stat.put("tripCount", e.getValue().size());
                    BigDecimal total = e.getValue().stream()
                            .map(t -> safe(t.getTotalEarnings()))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    stat.put("totalEarnings", total);
                    stat.put("avgEarnings", total.divide(BigDecimal.valueOf(e.getValue().size()), 2, RoundingMode.HALF_UP));
                    return stat;
                })
                .sorted((a, b) -> ((BigDecimal) b.get("totalEarnings")).compareTo((BigDecimal) a.get("totalEarnings")))
                .collect(Collectors.toList());
    }

    // --- Private helpers ---

    private VehiclePerformanceDTO buildPerformanceDTO(Vehicle v) {
        BigDecimal earnings = tripRepository.sumEarningsByVehicleId(v.getId());
        long completed = tripRepository.countCompletedByVehicleId(v.getId());
        long total = tripRepository.countByVehicleId(v.getId());
        long cancelled = tripRepository.countCancelledByVehicleId(v.getId());
        int tripDays = tripRepository.sumTripDaysByVehicleId(v.getId());

        BigDecimal revenuePerDay = tripDays > 0
                ? earnings.divide(BigDecimal.valueOf(tripDays), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        double completionRate = total > 0 ? (completed * 100.0 / total) : 0;

        BigDecimal avgTripValue = completed > 0
                ? earnings.divide(BigDecimal.valueOf(completed), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        int healthScore = calculateHealthScore(revenuePerDay, completionRate, (int) total, avgTripValue);
        String category = healthScore >= 70 ? "TOP_PERFORMER" : healthScore >= 40 ? "NEEDS_ATTENTION" : "CRITICAL";

        return VehiclePerformanceDTO.builder()
                .id(v.getId())
                .vehicleName(v.getVehicleName())
                .make(v.getMake())
                .model(v.getModel())
                .year(v.getYear())
                .licensePlate(v.getLicensePlate())
                .vin(v.getVin())
                .listingName(v.getListingName())
                .totalEarnings(earnings)
                .completedTrips((int) completed)
                .totalTrips((int) total)
                .cancelledTrips((int) cancelled)
                .totalTripDays(tripDays)
                .revenuePerDay(revenuePerDay)
                .completionRate(completionRate)
                .avgTripValue(avgTripValue)
                .healthScore(healthScore)
                .healthCategory(category)
                .build();
    }

    private int calculateHealthScore(BigDecimal revenuePerDay, double completionRate, int totalTrips, BigDecimal avgTripValue) {
        double revScore = normalize(revenuePerDay.doubleValue(), 0, 60) * 40;
        double compScore = (completionRate / 100.0) * 30;
        double volScore = normalize(totalTrips, 0, 25) * 15;
        double avgScore = normalize(avgTripValue.doubleValue(), 0, 400) * 15;
        return (int) Math.round(Math.min(100, revScore + compScore + volScore + avgScore));
    }

    private double normalize(double value, double min, double max) {
        if (max <= min) return 0;
        return Math.min(1.0, Math.max(0, (value - min) / (max - min)));
    }

    private void checkComplianceDate(List<FleetAlert> alerts, Vehicle vehicle, LocalDate expiry, String docType, LocalDate now) {
        if (expiry == null) return;
        long daysUntil = ChronoUnit.DAYS.between(now, expiry);
        if (daysUntil < 0) {
            alerts.add(FleetAlert.builder()
                    .type("CRITICAL")
                    .message(vehicle.getVehicleName() + ": " + docType + " EXPIRED " + Math.abs(daysUntil) + " days ago")
                    .vehicleId(vehicle.getId())
                    .vehicleName(vehicle.getVehicleName())
                    .build());
        } else if (daysUntil <= 30) {
            alerts.add(FleetAlert.builder()
                    .type("WARNING")
                    .message(vehicle.getVehicleName() + ": " + docType + " expires in " + daysUntil + " days")
                    .vehicleId(vehicle.getId())
                    .vehicleName(vehicle.getVehicleName())
                    .build());
        }
    }

    private BigDecimal safe(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }
}
