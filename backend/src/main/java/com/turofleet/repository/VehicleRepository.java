package com.turofleet.repository;

import com.turofleet.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByTuroVehicleId(String turoVehicleId);
    Optional<Vehicle> findByVin(String vin);
}
