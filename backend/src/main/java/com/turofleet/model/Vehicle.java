package com.turofleet.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "turo_vehicle_id", unique = true)
    private String turoVehicleId;

    @Column(nullable = false)
    private String make;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private Integer year;

    private String licensePlate;

    @Column(unique = true)
    private String vin;

    private String vehicleName;
    private String listingName;
    private String color;
    private String photoUrl;
    private String notes;

    @Column(precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    private LocalDate purchaseDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal monthlyPayment;

    @Column(precision = 10, scale = 2)
    private BigDecimal monthlyInsurance;

    @Column(precision = 10, scale = 2)
    private BigDecimal yearlyRegistration;

    @Column(precision = 10, scale = 2)
    private BigDecimal monthlyParking;

    private Integer currentOdometer;

    // Compliance dates
    private LocalDate registrationExpiry;
    private LocalDate insuranceExpiry;
    private LocalDate inspectionExpiry;

    // Bouncie GPS
    private String bouncieDeviceId;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
