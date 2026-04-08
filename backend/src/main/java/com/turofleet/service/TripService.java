package com.turofleet.service;

import com.turofleet.model.Trip;
import com.turofleet.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;

    public List<Trip> findAll() {
        return tripRepository.findAll();
    }

    public Optional<Trip> findById(Long id) {
        return tripRepository.findById(id);
    }

    public List<Trip> findByVehicleId(Long vehicleId) {
        return tripRepository.findByVehicleId(vehicleId);
    }

    public List<Trip> findByStatus(String status) {
        return tripRepository.findByTripStatus(status);
    }
}
