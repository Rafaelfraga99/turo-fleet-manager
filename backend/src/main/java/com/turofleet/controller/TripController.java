package com.turofleet.controller;

import com.turofleet.model.Trip;
import com.turofleet.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping
    public List<Trip> getAll() {
        return tripService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getById(@PathVariable Long id) {
        return tripService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public List<Trip> getByVehicle(@PathVariable Long vehicleId) {
        return tripService.findByVehicleId(vehicleId);
    }

    @GetMapping("/status/{status}")
    public List<Trip> getByStatus(@PathVariable String status) {
        return tripService.findByStatus(status);
    }
}
