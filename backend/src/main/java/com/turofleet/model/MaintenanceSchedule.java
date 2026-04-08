package com.turofleet.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Vehicle vehicle;

    @Column(name = "vehicle_id", insertable = false, updatable = false)
    private Long vehicleId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MaintenanceType type;

    private String description;

    private LocalDate lastServiceDate;
    private Integer lastServiceOdometer;

    private Integer intervalMiles;
    private Integer intervalMonths;

    private LocalDate nextDueDate;
    private Integer nextDueOdometer;

    @Builder.Default
    private Boolean completed = false;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public void calculateNextDue() {
        if (lastServiceDate != null && intervalMonths != null) {
            nextDueDate = lastServiceDate.plusMonths(intervalMonths);
        }
        if (lastServiceOdometer != null && intervalMiles != null) {
            nextDueOdometer = lastServiceOdometer + intervalMiles;
        }
    }
}
