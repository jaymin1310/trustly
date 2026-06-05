package com.trustly.common.util;

import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
public final class SecurityUtils {
    private SecurityUtils() {
    }

    public static String getCurrentUserEmail() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null) {
            throw new IllegalStateException("No authenticated user found");
        }

        return authentication.getName();
    }
}
