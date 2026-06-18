package com.trustly.user.repository;

import com.trustly.common.enums.Role;
import com.trustly.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    long countByRolesContaining(
            Role role
    );
}
