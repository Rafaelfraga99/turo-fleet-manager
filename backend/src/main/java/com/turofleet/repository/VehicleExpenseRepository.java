package com.turofleet.repository;

import com.turofleet.model.VehicleExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface VehicleExpenseRepository extends JpaRepository<VehicleExpense, Long> {

    List<VehicleExpense> findByVehicleIdOrderByExpenseDateDesc(Long vehicleId);

    List<VehicleExpense> findByVehicleIdAndExpenseDateBetween(Long vehicleId, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM VehicleExpense e WHERE e.vehicle.id = :vehicleId")
    BigDecimal sumExpensesByVehicleId(@Param("vehicleId") Long vehicleId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM VehicleExpense e WHERE e.vehicle.id = :vehicleId AND e.expenseDate BETWEEN :start AND :end")
    BigDecimal sumExpensesByVehicleIdAndDateRange(@Param("vehicleId") Long vehicleId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
