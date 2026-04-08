package com.turofleet.service;

import com.turofleet.model.Vehicle;
import com.turofleet.repository.TripRepository;
import com.turofleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;

    public List<Vehicle> findAll() {
        return vehicleRepository.findAll();
    }

    public Optional<Vehicle> findById(Long id) {
        return vehicleRepository.findById(id);
    }

    public Map<String, Object> getVehicleSummary(Vehicle v) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", v.getId());
        summary.put("turoVehicleId", v.getTuroVehicleId());
        summary.put("make", v.getMake());
        summary.put("model", v.getModel());
        summary.put("year", v.getYear());
        summary.put("licensePlate", v.getLicensePlate());
        summary.put("vin", v.getVin());
        summary.put("vehicleName", v.getVehicleName());
        summary.put("listingName", v.getListingName());
        summary.put("color", v.getColor());
        summary.put("photoUrl", v.getPhotoUrl());
        summary.put("notes", v.getNotes());
        summary.put("purchasePrice", v.getPurchasePrice());
        summary.put("purchaseDate", v.getPurchaseDate());
        summary.put("monthlyPayment", v.getMonthlyPayment());
        summary.put("monthlyInsurance", v.getMonthlyInsurance());
        summary.put("yearlyRegistration", v.getYearlyRegistration());
        summary.put("monthlyParking", v.getMonthlyParking());
        summary.put("currentOdometer", v.getCurrentOdometer());
        summary.put("bouncieDeviceId", v.getBouncieDeviceId());
        summary.put("registrationExpiry", v.getRegistrationExpiry());
        summary.put("insuranceExpiry", v.getInsuranceExpiry());
        summary.put("inspectionExpiry", v.getInspectionExpiry());
        summary.put("totalEarnings", tripRepository.sumEarningsByVehicleId(v.getId()));
        summary.put("completedTrips", tripRepository.countCompletedByVehicleId(v.getId()));
        summary.put("totalTrips", tripRepository.findByVehicleId(v.getId()).size());
        return summary;
    }

    public List<Map<String, Object>> getVehicleSummaries() {
        List<Map<String, Object>> summaries = new ArrayList<>();
        for (Vehicle v : vehicleRepository.findAll()) {
            Map<String, Object> summary = new HashMap<>();
            summary.put("id", v.getId());
            summary.put("turoVehicleId", v.getTuroVehicleId());
            summary.put("make", v.getMake());
            summary.put("model", v.getModel());
            summary.put("year", v.getYear());
            summary.put("licensePlate", v.getLicensePlate());
            summary.put("vin", v.getVin());
            summary.put("vehicleName", v.getVehicleName());
            summary.put("listingName", v.getListingName());
            summary.put("totalEarnings", tripRepository.sumEarningsByVehicleId(v.getId()));
            summary.put("completedTrips", tripRepository.countCompletedByVehicleId(v.getId()));
            summary.put("totalTrips", tripRepository.findByVehicleId(v.getId()).size());
            summaries.add(summary);
        }
        return summaries;
    }

    public Vehicle updateVehicle(Long id, Vehicle details) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        if (details.getPhotoUrl() != null) vehicle.setPhotoUrl(details.getPhotoUrl());
        if (details.getColor() != null) vehicle.setColor(details.getColor());
        if (details.getNotes() != null) vehicle.setNotes(details.getNotes());
        if (details.getPurchasePrice() != null) vehicle.setPurchasePrice(details.getPurchasePrice());
        if (details.getPurchaseDate() != null) vehicle.setPurchaseDate(details.getPurchaseDate());
        if (details.getMonthlyPayment() != null) vehicle.setMonthlyPayment(details.getMonthlyPayment());
        if (details.getMonthlyInsurance() != null) vehicle.setMonthlyInsurance(details.getMonthlyInsurance());
        if (details.getYearlyRegistration() != null) vehicle.setYearlyRegistration(details.getYearlyRegistration());
        if (details.getMonthlyParking() != null) vehicle.setMonthlyParking(details.getMonthlyParking());
        if (details.getCurrentOdometer() != null) vehicle.setCurrentOdometer(details.getCurrentOdometer());
        if (details.getRegistrationExpiry() != null) vehicle.setRegistrationExpiry(details.getRegistrationExpiry());
        if (details.getInsuranceExpiry() != null) vehicle.setInsuranceExpiry(details.getInsuranceExpiry());
        if (details.getInspectionExpiry() != null) vehicle.setInspectionExpiry(details.getInspectionExpiry());
        return vehicleRepository.save(vehicle);
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVehicles", vehicleRepository.count());
        stats.put("totalTrips", tripRepository.count());
        stats.put("completedTrips", tripRepository.countByTripStatus("Completed"));
        stats.put("bookedTrips", tripRepository.countByTripStatus("Booked"));
        stats.put("inProgressTrips", tripRepository.countByTripStatus("In-progress"));
        stats.put("cancelledTrips",
                tripRepository.countByTripStatus("Guest cancellation") +
                tripRepository.countByTripStatus("Host cancellation"));
        stats.put("totalEarnings", tripRepository.sumTotalEarnings());
        stats.put("totalTripDays", tripRepository.sumTripDays());
        stats.put("totalDistance", tripRepository.sumDistanceTraveled());
        return stats;
    }
}
