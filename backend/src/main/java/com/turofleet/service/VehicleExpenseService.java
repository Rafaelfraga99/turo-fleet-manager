package com.turofleet.service;

import com.turofleet.model.Vehicle;
import com.turofleet.model.VehicleExpense;
import com.turofleet.repository.TripRepository;
import com.turofleet.repository.VehicleExpenseRepository;
import com.turofleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleExpenseService {

    private final VehicleExpenseRepository expenseRepository;
    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;

    public List<VehicleExpense> findByVehicleId(Long vehicleId) {
        return expenseRepository.findByVehicleIdOrderByExpenseDateDesc(vehicleId);
    }

    public VehicleExpense create(Long vehicleId, VehicleExpense expense) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        expense.setVehicle(vehicle);
        return expenseRepository.save(expense);
    }

    public VehicleExpense update(Long id, VehicleExpense data) {
        VehicleExpense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        expense.setCategory(data.getCategory());
        expense.setDescription(data.getDescription());
        expense.setAmount(data.getAmount());
        expense.setExpenseDate(data.getExpenseDate());
        expense.setOdometerAtExpense(data.getOdometerAtExpense());
        expense.setVendor(data.getVendor());
        expense.setReceiptUrl(data.getReceiptUrl());
        expense.setNotes(data.getNotes());
        return expenseRepository.save(expense);
    }

    public void delete(Long id) {
        expenseRepository.deleteById(id);
    }

    public Map<String, Object> getSummary(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        BigDecimal totalEarnings = tripRepository.sumEarningsByVehicleId(vehicleId);
        BigDecimal totalExpenses = expenseRepository.sumExpensesByVehicleId(vehicleId);

        BigDecimal monthlyFixed = BigDecimal.ZERO;
        if (vehicle.getMonthlyPayment() != null) monthlyFixed = monthlyFixed.add(vehicle.getMonthlyPayment());
        if (vehicle.getMonthlyInsurance() != null) monthlyFixed = monthlyFixed.add(vehicle.getMonthlyInsurance());
        if (vehicle.getMonthlyParking() != null) monthlyFixed = monthlyFixed.add(vehicle.getMonthlyParking());
        if (vehicle.getYearlyRegistration() != null) {
            monthlyFixed = monthlyFixed.add(vehicle.getYearlyRegistration().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP));
        }

        // Calculate months active (from first trip or purchase date to now)
        List<com.turofleet.model.Trip> trips = tripRepository.findByVehicleIdOrderByTripStartDesc(vehicleId);
        long monthsActive = 1;
        if (!trips.isEmpty()) {
            LocalDateTime firstTrip = trips.get(trips.size() - 1).getTripStart();
            if (firstTrip != null) {
                monthsActive = Math.max(1, ChronoUnit.MONTHS.between(firstTrip, LocalDateTime.now()) + 1);
            }
        }

        BigDecimal totalFixedCosts = monthlyFixed.multiply(BigDecimal.valueOf(monthsActive));
        BigDecimal netProfit = totalEarnings.subtract(totalExpenses).subtract(totalFixedCosts);
        BigDecimal profitMargin = totalEarnings.compareTo(BigDecimal.ZERO) > 0
                ? netProfit.divide(totalEarnings, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // By category
        List<VehicleExpense> expenses = expenseRepository.findByVehicleIdOrderByExpenseDateDesc(vehicleId);
        Map<String, BigDecimal> byCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().name(),
                        Collectors.reducing(BigDecimal.ZERO, VehicleExpense::getAmount, BigDecimal::add)
                ));

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalEarnings", totalEarnings);
        summary.put("totalExpenses", totalExpenses);
        summary.put("fixedMonthlyCosts", monthlyFixed);
        summary.put("monthsActive", monthsActive);
        summary.put("totalFixedCosts", totalFixedCosts);
        summary.put("netProfit", netProfit);
        summary.put("profitMargin", profitMargin.setScale(1, RoundingMode.HALF_UP));
        summary.put("expensesByCategory", byCategory);
        return summary;
    }
}
