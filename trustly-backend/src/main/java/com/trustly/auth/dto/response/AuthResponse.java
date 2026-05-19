package com.trustly.auth.dto.response;
import com.trustly.common.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private Set<Role> roles;
}