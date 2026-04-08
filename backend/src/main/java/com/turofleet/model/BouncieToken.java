package com.turofleet.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bouncie_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BouncieToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 1000)
    private String accessToken;

    @Column(length = 1000)
    private String refreshToken;

    private String tokenType;
    private Long expiresIn;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public boolean isExpired() {
        if (expiresIn == null) return true;
        return createdAt.plusSeconds(expiresIn).isBefore(LocalDateTime.now());
    }
}
