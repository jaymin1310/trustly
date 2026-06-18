package com.trustly.auth.service;

import com.trustly.common.enums.OtpType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RedisOtpService {

    private static final Duration OTP_EXPIRY = Duration.ofMinutes(5);
    private static final Duration COOLDOWN_EXPIRY = Duration.ofSeconds(60);

    private final StringRedisTemplate redisTemplate;

    private String buildKey(String email, OtpType otpType) {
        return "otp:" + otpType.name() + ":" + email;
    }

    private String buildCooldownKey(String email, OtpType otpType) {
        return "otp_cooldown:" + otpType.name() + ":" + email;
    }

    public void saveOtp(
            String email,
            String otp,
            OtpType otpType
    ) {

        redisTemplate.opsForValue().set(
                buildKey(email, otpType),
                otp,
                OTP_EXPIRY
        );
    }

    public String getOtp(
            String email,
            OtpType otpType
    ) {

        return redisTemplate.opsForValue().get(
                buildKey(email, otpType)
        );
    }

    public boolean validateOtp(
            String email,
            String enteredOtp,
            OtpType otpType
    ) {

        String storedOtp = getOtp(
                email,
                otpType
        );

        return storedOtp != null
                && storedOtp.equals(enteredOtp);
    }

    public void deleteOtp(
            String email,
            OtpType otpType
    ) {

        redisTemplate.delete(
                buildKey(email, otpType)
        );
    }

    public boolean exists(
            String email,
            OtpType otpType
    ) {

        return Boolean.TRUE.equals(
                redisTemplate.hasKey(
                        buildKey(email, otpType)
                )
        );
    }

    public void createCooldown(
            String email,
            OtpType otpType
    ) {

        redisTemplate.opsForValue().set(
                buildCooldownKey(email, otpType),
                "1",
                COOLDOWN_EXPIRY
        );
    }

    public boolean hasCooldown(
            String email,
            OtpType otpType
    ) {

        return Boolean.TRUE.equals(
                redisTemplate.hasKey(
                        buildCooldownKey(email, otpType)
                )
        );
    }

    public long getCooldownSeconds(
            String email,
            OtpType otpType
    ) {

        Long ttl = redisTemplate.getExpire(
                buildCooldownKey(email, otpType)
        );

        return ttl == null ? 0 : ttl;
    }
}