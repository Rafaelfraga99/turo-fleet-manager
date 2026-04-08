package com.turofleet.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehiclePerformanceDTO {
    private Long id;
    private String vehicleName;
    private String make;
    private String model;
    private Integer year;
    private String licensePlate;
    private String vin;
    private String listingName;

    private BigDecimal totalEarnings;
    private int completedTrips;
    private int totalTrips;
    private int cancelledTrips;
    private int totalTripDays;

    private BigDecimal revenuePerDay;
    private double completionRate;
    private BigDecimal avgTripValue;

    private int healthScore;
    private String healthCategory;
}
