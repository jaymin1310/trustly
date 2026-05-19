package com.trustly.auth.repository;

import com.trustly.auth.entity.Otp;
import com.trustly.common.enums.OtpType;
import com.trustly.user.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp,Long> {
    Optional<Otp> findByCodeAndUserAndType(String code, User user, OtpType otpType);
    void deleteByUser(User user);
    void deleteByExpiryTimeBefore(java.time.LocalDateTime now);
    @Modifying
    @Transactional
    @Query("""
    UPDATE Otp o
    SET o.used = true
    WHERE o.user = :user
    AND o.type = :type
    AND o.used = false
    """)
    void invalidateAllOtpByUserAndType(User user, OtpType type);
    void deleteByUsedTrue();
    Optional<Otp> findTopByUserAndTypeAndUsedFalseOrderByCreatedAtDesc(
            User user,
            OtpType type
    );
}
