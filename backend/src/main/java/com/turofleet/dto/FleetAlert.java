package com.turofleet.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FleetAlert {
    private String type; // CRITICAL, WARNING, INFO
    private String message;
    private Long vehicleId;
    private String vehicleName;
}
