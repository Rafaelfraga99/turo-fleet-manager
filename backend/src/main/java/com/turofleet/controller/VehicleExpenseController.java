package com.turofleet.controller;

import com.turofleet.model.VehicleExpense;
import com.turofleet.service.VehicleExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles/{vehicleId}/expenses")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class VehicleExpenseController {

    private final VehicleExpenseService expenseService;

    @GetMapping
    public List<VehicleExpense> getByVehicle(@PathVariable Long vehicleId) {
        return expenseService.findByVehicleId(vehicleId);
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(@PathVariable Long vehicleId) {
        return expenseService.getSummary(vehicleId);
    }

    @PostMapping
    public VehicleExpense create(@PathVariable Long vehicleId, @RequestBody VehicleExpense expense) {
        return expenseService.create(vehicleId, expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleExpense> update(@PathVariable Long vehicleId, @PathVariable Long id, @RequestBody VehicleExpense expense) {
        try {
            return ResponseEntity.ok(expenseService.update(id, expense));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long vehicleId, @PathVariable Long id) {
        expenseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
