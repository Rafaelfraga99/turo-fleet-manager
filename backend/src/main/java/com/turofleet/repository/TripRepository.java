package com.turofleet.repository;

import com.turofleet.model.Trip;
import com.turofleet.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    Optional<Trip> findByReservationId(String reservationId);

    List<Trip> findByVehicle(Vehicle vehicle);

    List<Trip> findByVehicleId(Long vehicleId);

    List<Trip> findByTripStatus(String tripStatus);

    @Query("SELECT COALESCE(SUM(t.totalEarnings), 0) FROM Trip t")
    BigDecimal sumTotalEarnings();

    @Query("SELECT COALESCE(SUM(t.totalEarnings), 0) FROM Trip t WHERE t.vehicle.id = :vehicleId")
    BigDecimal sumEarningsByVehicleId(Long vehicleId);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.tripStatus = :status")
    long countByTripStatus(String status);

    @Query("SELECT COALESCE(SUM(t.tripDays), 0) FROM Trip t WHERE t.tripStatus = 'Completed'")
    int sumTripDays();

    @Query("SELECT COALESCE(SUM(t.distanceTraveled), 0) FROM Trip t WHERE t.tripStatus = 'Completed'")
    long sumDistanceTraveled();

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.tripStatus = 'Completed'")
    long countCompletedByVehicleId(Long vehicleId);

    @Query("SELECT COALESCE(SUM(t.tripDays), 0) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.tripStatus = 'Completed'")
    int sumTripDaysByVehicleId(Long vehicleId);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.vehicle.id = :vehicleId AND (t.tripStatus = 'Guest cancellation' OR t.tripStatus = 'Host cancellation')")
    long countCancelledByVehicleId(Long vehicleId);

    long countByVehicleId(Long vehicleId);

    List<Trip> findByVehicleIdOrderByTripStartDesc(Long vehicleId);
}
