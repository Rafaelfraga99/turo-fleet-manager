package com.turofleet.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyRevenue {
    private String yearMonth;
    private BigDecimal revenue;
    private int tripCount;
    private int completedCount;
    private int cancelledCount;
}
