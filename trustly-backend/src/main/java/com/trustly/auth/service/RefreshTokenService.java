package com.trustly.auth.service;

import com.trustly.auth.repository.RefreshTokenRepository;
import com.trustly.auth.entity.RefreshToken;
import com.trustly.common.exception.UnauthorizedException;
import com.trustly.common.security.JwtService;
import com.trustly.user.entity.User;
import io.jsonwebtoken.JwtException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    @Value("${jwt.refresh.expiration}")
    private long refreshTokenExpiration;

    public RefreshToken createRefreshToken(User user, UserDetails userDetails, int tokenVersion) {

        String token = jwtService.generateRefreshToken(userDetails,tokenVersion);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiryDate(LocalDateTime.now()
                        .plusSeconds(refreshTokenExpiration / 1000))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }
    @Transactional
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(token)
                .orElseThrow(() ->
                        new UnauthorizedException("Refresh token not found"));

        if (refreshToken.isRevoked()) {
            throw new UnauthorizedException("Refresh token revoked");
        }
        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.deleteByToken(token);
            throw new UnauthorizedException("Refresh token expired");
        }
        try {
            jwtService.extractUsername(token);
        } catch (JwtException e) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        Integer tokenVersionFromJwt = jwtService.extractTokenVersion(token);
        User user = refreshToken.getUser();

        if (!tokenVersionFromJwt.equals(user.getTokenVersion())) {
            throw new UnauthorizedException("Refresh token is invalid due to version mismatch");
        }
        return refreshToken;
    }
    @Transactional
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
    @Transactional
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }
}
