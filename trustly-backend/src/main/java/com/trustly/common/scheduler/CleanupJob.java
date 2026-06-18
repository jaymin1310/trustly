package com.trustly.common.scheduler;

import com.trustly.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class CleanupJob {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Runs every day at midnight.
     * Deletes expired refresh tokens.
     */
    @Transactional
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanupRefreshTokens() {

        log.info("Starting refresh token cleanup");

        refreshTokenRepository.deleteByExpiryDateBefore(
                LocalDateTime.now()
        );

        log.info("Refresh token cleanup completed");
    }
}