package com.trustly.auth.service;

import com.trustly.auth.repository.OtpRepository;
import com.trustly.auth.dto.response.OtpResponse;
import com.trustly.auth.entity.Otp;
import com.trustly.common.enums.OtpType;
import com.trustly.common.exception.InvalidOtpException;
import com.trustly.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();
    public String generateOtp() {
        return String.valueOf(100000 + random.nextInt(900000));
    }
    public OtpResponse generateAndSendOtp(User user, OtpType otpType) {
        Otp latestOtp = otpRepository
                .findTopByUserAndTypeAndUsedFalseOrderByCreatedAtDesc(user, otpType)
                .orElse(null);
        String msg;
        if (latestOtp != null) {

            LocalDateTime allowedTime =
                    latestOtp.getCreatedAt().plusSeconds(60);

            if (allowedTime.isAfter(LocalDateTime.now())) {

                long secondsLeft = Duration.between(
                        LocalDateTime.now(),
                        allowedTime
                ).getSeconds();
                msg="Please wait " + secondsLeft + " seconds before requesting new OTP";
                return OtpResponse.builder()
                        .success(false)
                        .message(msg)
                        .build();
            }
            otpRepository.invalidateAllOtpByUserAndType(user, otpType);
        }
        String code = generateOtp();
        Otp otp = Otp.builder()
                .code(code)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .type(otpType)
                .build();

        otpRepository.save(otp);
        emailService.sendOtpEmail(user.getEmail(), code);
        msg="OTP sent successfully";
        return OtpResponse.builder()
                .success(true)
                .message(msg)
                .build();
    }
    public void validateOtp(User user,String otpCode,OtpType otpType) {
        Otp otp = otpRepository.findByCodeAndUserAndType(otpCode, user,otpType)
                .orElseThrow(() -> new InvalidOtpException("Invalid OTP"));

        if (otp.isUsed()) {
            throw new InvalidOtpException("OTP already used");
        }

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new InvalidOtpException("OTP expired");
        }
        otp.setUsed(true);
        otpRepository.save(otp);
    }
}