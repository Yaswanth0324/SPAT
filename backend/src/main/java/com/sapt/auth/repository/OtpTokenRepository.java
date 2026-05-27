package com.sapt.auth.repository;

import com.sapt.auth.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ============================================================
 * OtpTokenRepository - JPA Repository for OtpToken
 * ============================================================
 * TODO (Auth Team):
 *  - Add method to find latest unused OTP by email + purpose
 *  - Add method to delete all expired OTPs (for cleanup job)
 * ============================================================
 */
@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    /** Find the latest unused OTP for a given email and purpose */
    Optional<OtpToken> findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            String email, String purpose);

    /** Delete all OTPs for a given email (after successful verification) */
    void deleteByEmail(String email);

    // TODO: Add deleteByExpiresAtBefore(LocalDateTime now) for cleanup
}
