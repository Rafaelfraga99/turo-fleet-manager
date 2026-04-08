package com.turofleet.repository;

import com.turofleet.model.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, Long> {
    List<MaintenanceSchedule> findByVehicleIdOrderByNextDueDateAsc(Long vehicleId);
    List<MaintenanceSchedule> findByNextDueDateBeforeAndCompletedFalse(LocalDate date);
    List<MaintenanceSchedule> findByNextDueOdometerLessThanAndCompletedFalse(Integer odometer);
}
