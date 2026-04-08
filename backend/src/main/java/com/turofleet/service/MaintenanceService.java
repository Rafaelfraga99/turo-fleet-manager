package com.turofleet.service;

import com.turofleet.model.MaintenanceSchedule;
import com.turofleet.model.Vehicle;
import com.turofleet.repository.MaintenanceScheduleRepository;
import com.turofleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceScheduleRepository scheduleRepository;
    private final VehicleRepository vehicleRepository;

    public List<MaintenanceSchedule> findByVehicleId(Long vehicleId) {
        return scheduleRepository.findByVehicleIdOrderByNextDueDateAsc(vehicleId);
    }

    public MaintenanceSchedule create(Long vehicleId, MaintenanceSchedule schedule) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        schedule.setVehicle(vehicle);
        schedule.calculateNextDue();
        return scheduleRepository.save(schedule);
    }

    public MaintenanceSchedule markCompleted(Long id, LocalDate serviceDate, Integer serviceOdometer) {
        MaintenanceSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        schedule.setLastServiceDate(serviceDate);
        schedule.setLastServiceOdometer(serviceOdometer);
        schedule.setCompleted(false); // Reset to recalculate next
        schedule.calculateNextDue();
        return scheduleRepository.save(schedule);
    }

    public void delete(Long id) {
        scheduleRepository.deleteById(id);
    }

    public List<Map<String, Object>> getUpcomingMaintenance() {
        List<Map<String, Object>> upcoming = new ArrayList<>();
        LocalDate thirtyDaysOut = LocalDate.now().plusDays(30);

        for (MaintenanceSchedule s : scheduleRepository.findByNextDueDateBeforeAndCompletedFalse(thirtyDaysOut)) {
            Map<String, Object> item = new HashMap<>();
            Vehicle v = vehicleRepository.findById(s.getVehicleId()).orElse(null);
            item.put("id", s.getId());
            item.put("vehicleId", s.getVehicleId());
            item.put("vehicleName", v != null ? v.getVehicleName() : "Unknown");
            item.put("type", s.getType().name());
            item.put("description", s.getDescription());
            item.put("nextDueDate", s.getNextDueDate());
            item.put("nextDueOdometer", s.getNextDueOdometer());

            long daysUntil = s.getNextDueDate() != null
                    ? ChronoUnit.DAYS.between(LocalDate.now(), s.getNextDueDate()) : 999;
            item.put("daysUntil", daysUntil);
            item.put("urgency", daysUntil < 0 ? "OVERDUE" : daysUntil <= 7 ? "URGENT" : "UPCOMING");
            upcoming.add(item);
        }

        upcoming.sort(Comparator.comparingLong(a -> (long) a.get("daysUntil")));
        return upcoming;
    }
}
