package com.trustly.auth.service;

import com.trustly.auth.dto.response.OtpResponse;
import com.trustly.common.enums.OtpType;
import com.trustly.common.exception.InvalidOtpException;
import com.trustly.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class OtpService {
    // remove otp repo because of conversion in redis otp service
    private final RedisOtpService redisOtpService;
    private final EmailService emailService;

    private final SecureRandom random = new SecureRandom();

    public String generateOtp() {
        return String.valueOf(100000 + random.nextInt(900000));
    }

    public OtpResponse generateAndSendOtp(
            User user,
            OtpType otpType
    ) {

        String email = user.getEmail();

        if (redisOtpService.hasCooldown(email, otpType)) {

            long secondsLeft =
                    redisOtpService.getCooldownSeconds(
                            email,
                            otpType
                    );

            return OtpResponse.builder()
                    .success(false)
                    .message(
                            "Please wait "
                                    + secondsLeft
                                    + " seconds before requesting new OTP"
                    )
                    .build();
        }

        String code = generateOtp();

        redisOtpService.saveOtp(
                email,
                code,
                otpType
        );

        redisOtpService.createCooldown(
                email,
                otpType
        );

        emailService.sendOtpEmail(
                email,
                code
        );

        return OtpResponse.builder()
                .success(true)
                .message("OTP sent successfully")
                .build();
    }

    public void validateOtp(
            User user,
            String otpCode,
            OtpType otpType
    ) {

        String email = user.getEmail();

        boolean valid =
                redisOtpService.validateOtp(
                        email,
                        otpCode,
                        otpType
                );

        if (!valid) {
            throw new InvalidOtpException(
                    "Invalid or expired OTP"
            );
        }

        redisOtpService.deleteOtp(
                email,
                otpType
        );
    }
}