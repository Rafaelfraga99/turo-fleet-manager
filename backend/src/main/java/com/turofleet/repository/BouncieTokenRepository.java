package com.turofleet.repository;

import com.turofleet.model.BouncieToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BouncieTokenRepository extends JpaRepository<BouncieToken, Long> {
    Optional<BouncieToken> findTopByOrderByCreatedAtDesc();
}
