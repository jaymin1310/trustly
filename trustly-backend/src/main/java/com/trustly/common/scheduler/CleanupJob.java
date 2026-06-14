package com.trustly.common.scheduler;

import com.trustly.auth.repository.OtpRepository;
import com.trustly.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class CleanupJob {

    private final OtpRepository otpRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Scheduled(cron = "0 */10 * * * *")
    public void cleanupOtps() {

        log.info("Starting OTP cleanup");

        otpRepository.deleteByUsedTrue();
        otpRepository.deleteByExpiryTimeBefore(LocalDateTime.now());

        log.info("OTP cleanup completed");
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void cleanupRefreshTokens() {

        log.info("Starting refresh token cleanup");

        refreshTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());

        log.info("Refresh token cleanup completed");
    }
}