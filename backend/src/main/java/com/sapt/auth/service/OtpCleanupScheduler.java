package com.sapt.auth.service;

import com.sapt.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * ============================================================
 * OtpCleanupScheduler — Expired OTP Cleanup Job
 * ============================================================
 * OTPs are now stored directly on the User entity (otp_code,
 * otp_expires_at). This job clears any expired OTPs by nulling
 * those fields on User rows where otp_expires_at has passed.
 *
 * Schedule: Every hour (cron: 0 0 * * * *)
 * ============================================================
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OtpCleanupScheduler {

    private final UserRepository userRepository;

    /**
     * Clears expired OTP codes from the users table.
     * Runs at the start of every hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        log.info("Running OTP cleanup job at {}", now);
        try {
            userRepository.clearExpiredOtps(now);
            log.info("OTP cleanup completed successfully.");
        } catch (Exception e) {
            log.error("OTP cleanup failed: {}", e.getMessage());
        }
    }
}
