package com.trustly.auth.service;

import com.trustly.auth.dto.request.*;
import com.trustly.auth.dto.response.ApiResponse;
import com.trustly.auth.dto.response.AuthResponse;
import com.trustly.auth.dto.response.OtpResponse;
import com.trustly.auth.entity.RefreshToken;
import com.trustly.auth.repository.RefreshTokenRepository;
import com.trustly.common.enums.OtpType;
import com.trustly.common.enums.Role;
import com.trustly.common.exception.DuplicateResourceException;
import com.trustly.common.exception.InvalidOtpException;
import com.trustly.common.exception.UnauthorizedException;
import com.trustly.common.security.CustomUserDetailsService;
import com.trustly.common.security.JwtService;
import com.trustly.user.entity.User;
import com.trustly.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailsService userDetailsService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final RefreshTokenRepository refreshTokenRepository;
    public final String otpMsg="If account exists, OTP has been sent";
    public ApiResponse register(RegisterRequest request) {
        Optional<User> existingUser =
                userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (user.getIsVerified()) {
                throw new DuplicateResourceException("Email is already registered");
            }
            user.setName(request.getName());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            OtpResponse otpResponse= otpService.generateAndSendOtp(user, OtpType.EMAIL_VERIFICATION);
            return ApiResponse.builder()
                    .message(otpResponse.getMessage())
                    .success(otpResponse.isSuccess())
                    .build();
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(Role.USER))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .tokenVersion(0)
                .isVerified(false)
                .build();
        userRepository.save(user);
        OtpResponse otpResponse= otpService.generateAndSendOtp(user,OtpType.EMAIL_VERIFICATION);
        return ApiResponse.builder()
                .message(otpResponse.getMessage())
                .success(otpResponse.isSuccess())
                .build();
    }
    public ApiResponse resetPassword(ResetPasswordRequest request){
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty() || !userOpt.get().getIsVerified()) {
            return ApiResponse.builder()
                    .message("Invalid email or OTP")
                    .success(false)
                    .build();
        }
        User user = userOpt.get();
        otpService.validateOtp(user,request.getOtp(),OtpType.PASSWORD_RESET);
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion()+1);
        userRepository.save(user);
        refreshTokenService.deleteByUser(user);
        return ApiResponse.builder()
                .message("Password reset successfully")
                .success(true)
                .build();
    }
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userOpt.get();

        if (!user.getIsVerified()) {
            throw new UnauthorizedException("User not verified");
        }
        UserDetails userDetails =
                userDetailsService.loadUserByUsername(user.getEmail());

        String accessToken =
                jwtService.generateAccessToken(userDetails, user.getTokenVersion());

        RefreshToken refreshToken =
                refreshTokenService.createRefreshToken(user, userDetails, user.getTokenVersion());
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .email(user.getEmail())
                .roles(user.getRoles())
                .build();
    }
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken =
                refreshTokenService.validateRefreshToken(
                        request.getRefreshToken()
                );
        User user = refreshToken.getUser();

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(user.getEmail());

        String newAccessToken =
                jwtService.generateAccessToken(userDetails, user.getTokenVersion());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .email(user.getEmail())
                .roles(user.getRoles())
                .build();
    }
    public ApiResponse resendVerificationOtp(OtpRequest request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()||userOpt.get().getIsVerified()) {
            return ApiResponse.builder()
                    .message(otpMsg)
                    .success(true)
                    .build();
        }
        User user = userOpt.get();
        OtpResponse otpResponse=otpService.generateAndSendOtp(user,OtpType.EMAIL_VERIFICATION);
        return ApiResponse.builder()
                .message(otpResponse.getMessage())
                .success(otpResponse.isSuccess())
                .build();
    }
    public ApiResponse resendResetOtp(OtpRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()|| !userOpt.get().getIsVerified()) {
            return ApiResponse.builder()
                    .message(otpMsg)
                    .success(true)
                    .build();
        }
        User user = userOpt.get();
        OtpResponse otpResponse=otpService.generateAndSendOtp(user,OtpType.PASSWORD_RESET);
        return ApiResponse.builder()
                .message(otpResponse.getMessage())
                .success(otpResponse.isSuccess())
                .build();
    }
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            throw new InvalidOtpException("Invalid email or OTP");
        }
        User user = userOpt.get();
        otpService.validateOtp(user,request.getOtp(),OtpType.EMAIL_VERIFICATION);
        user.setIsVerified(true);
        userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        UserDetails userDetails =
                userDetailsService.loadUserByUsername(user.getEmail());

        String accessToken =
                jwtService.generateAccessToken(userDetails, user.getTokenVersion());

        RefreshToken refreshToken =
                refreshTokenService.createRefreshToken(user, userDetails, user.getTokenVersion());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .email(user.getEmail())
                .roles(user.getRoles())
                .build();
    }
    public ApiResponse forgotPassword(OtpRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()|| !userOpt.get().getIsVerified()) {
            return ApiResponse.builder()
                    .message(otpMsg)
                    .success(true)
                    .build();
        }
        User user = userOpt.get();
        OtpResponse otpResponse=otpService.generateAndSendOtp(user,OtpType.PASSWORD_RESET);
        return ApiResponse.builder()
                .message(otpResponse.getMessage())
                .success(otpResponse.isSuccess())
                .build();
    }
    @Transactional
    public void logoutAllDevices(String accessToken) {

        String username =
                jwtService.extractUsername(accessToken);

        User user = userRepository.findByEmail(username)
                .orElseThrow(() ->
                        new UnauthorizedException(
                                "Invalid token"
                        )
                );
        user.setTokenVersion(
                user.getTokenVersion() + 1
        );
        userRepository.save(user);
        refreshTokenService.deleteByUser(user);
    }
    @Transactional
    public void logoutCurrentDevice(String refreshTokenValue) {

        RefreshToken refreshToken =
                refreshTokenService.validateRefreshToken(
                        refreshTokenValue
                );

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }
}
