package com.trustly.auth.repository;

import com.trustly.auth.entity.RefreshToken;
import com.trustly.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByToken(String token);
    void deleteByExpiryDateBefore(LocalDateTime now);
    void deleteByUser(User user);
}
