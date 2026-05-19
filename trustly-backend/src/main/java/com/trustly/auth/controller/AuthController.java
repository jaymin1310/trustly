package com.trustly.auth.controller;

import com.trustly.auth.dto.request.*;
import com.trustly.auth.dto.response.ApiResponse;
import com.trustly.auth.dto.response.AuthResponse;
import com.trustly.auth.service.AuthService;
import com.trustly.common.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }
    @PostMapping("/resend-verification-otp")
    public ResponseEntity<ApiResponse> resendVerificationOtp(
            @Valid @RequestBody OtpRequest request
    ) {
        return ResponseEntity.ok(authService.resendVerificationOtp(request));
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(
            @Valid @RequestBody OtpRequest request
    ) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
    @PostMapping("/resend-reset-otp")
    public ResponseEntity<ApiResponse> resendResetOtp(
            @Valid @RequestBody OtpRequest request
    ) {
        return ResponseEntity.ok(authService.resendResetOtp(request));
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        authService.logoutCurrentDevice(
                request.getRefreshToken()
        );

        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("Logged out successfully")
                        .build()
        );
    }
    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse> logoutAll(
            HttpServletRequest request
    ) {

        String authHeader =
                request.getHeader("Authorization");

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            throw new UnauthorizedException(
                    "Invalid Authorization header"
            );
        }

        String token = authHeader.substring(7);

        authService.logoutAllDevices(token);

        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("Logged out from all devices")
                        .build()
        );
    }

}
